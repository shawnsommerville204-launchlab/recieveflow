import { NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appB2mvOcxRCkeu1T';
const TOKEN = process.env.AIRTABLE_PAT;
const TABLES = { deliveries: 'tblevghldX3eQyN4M', items: 'tbl1QpYxCAg8Y5KLH', exceptions: 'tblsMSREzF3ZI5MHb' };

async function airtable(table: string) {
  if (!TOKEN) throw new Error('AIRTABLE_PAT is not configured');
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?pageSize=100`, {
    headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Airtable request failed');
  return data.records || [];
}

export async function GET() {
  try {
    const [deliveries, items, exceptions] = await Promise.all([
      airtable(TABLES.deliveries), airtable(TABLES.items), airtable(TABLES.exceptions)
    ]);
    const today = new Date();
    const sameDay = (value: string) => {
      if (!value) return false;
      const d = new Date(value);
      return d.toDateString() === today.toDateString();
    };
    const todayDeliveries = deliveries.filter((r: any) => sameDay(r.fields?.['Arrival Time']));
    const openExceptions = exceptions.filter((r: any) => !r.fields?.Resolved);
    const completed = todayDeliveries.filter((r: any) => r.fields?.Status === 'Complete');
    const receivedQty = items.reduce((sum: number, r: any) => sum + Number(r.fields?.['Quantity Received'] || 0), 0);
    const orderedQty = items.reduce((sum: number, r: any) => sum + Number(r.fields?.['Quantity Ordered'] || 0), 0);
    const accuracy = orderedQty ? Math.min(100, Math.round((receivedQty / orderedQty) * 1000) / 10) : 100;
    const recent = deliveries.slice().sort((a: any,b: any) => new Date(b.fields?.['Arrival Time'] || 0).getTime() - new Date(a.fields?.['Arrival Time'] || 0).getTime()).slice(0,6);
    return NextResponse.json({
      connected: true,
      metrics: { deliveries: todayDeliveries.length, completed: completed.length, openExceptions: openExceptions.length, accuracy, items: receivedQty },
      recent: recent.map((r: any) => ({ id: r.id, po: r.fields?.PO || '—', vendor: r.fields?.Vendor || '—', receiver: r.fields?.Receiver || '—', status: r.fields?.Status || 'Pending', arrival: r.fields?.['Arrival Time'] || null })),
      exceptions: openExceptions.slice(0,5).map((r: any) => ({ id: r.id, type: r.fields?.['Exception Type'] || 'Issue', item: r.fields?.Item || 'Material', priority: r.fields?.Priority || 'Medium' }))
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
