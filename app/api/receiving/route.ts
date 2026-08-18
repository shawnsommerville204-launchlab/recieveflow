import { NextRequest, NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appB2mvOcxRCkeu1T';
const TOKEN = process.env.AIRTABLE_PAT;

const TABLES = {
  deliveries: 'tblevghldX3eQyN4M',
  items: 'tbl1QpYxCAg8Y5KLH',
  exceptions: 'tblsMSREzF3ZI5MHb',
};

const F = {
  delivery: {
    po: 'fldqbxyiHQVg4ShhH', vendor: 'fld0N3jCI9DxfAJqp', bol: 'flddY20Sf7JxCfbGQ',
    driver: 'fldRawxs4XLfPu4ne', receiver: 'fldrk67Vg4CJ2RFDC', arrival: 'fld4mASu9yX6dPEn1',
    completion: 'fldfFpXqZnD8nKRxw', status: 'fldlaFdWFbaNtYhHT', notes: 'fldoWc6OEQJzBrj5s',
    paperless: 'fldto7PXvIipRPbgG', workflow: 'fldPChotLiN9uKokg',
  },
  item: {
    id: 'fldx0zj2UAM3MO30p', bfs: 'fldkQFKJCy9fXGBse', online: 'fldukgqqvuqRxZG0f',
    driver: 'fldANUJLLiedkKpNP', ordered: 'fldSq2jFpjskHVXnN', received: 'fld7w3OPI8Y9mlXlG',
    condition: 'fldMmA7M464ohNt4v', location: 'fldRo7dhPFOPnT2ha', delivery: 'fldjXAuiiJlWW7ibZ',
    barcode: 'fld24VTLy7hiIMN0y', actualLocation: 'fldjQWOTfIYBcQl32', notes: 'fldNCZTZX9XeXdzDl',
  },
};

async function airtable(path: string, init?: RequestInit) {
  if (!TOKEN) throw new Error('AIRTABLE_PAT is not configured');
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Airtable request failed');
  return data;
}

function normalize(record: any) {
  const f = record.fields || {};
  return { id: record.id, ...f };
}

export async function GET(request: NextRequest) {
  try {
    const po = request.nextUrl.searchParams.get('po') || 'DEMO-DEL-003';
    const deliveries = await airtable(`${TABLES.deliveries}?filterByFormula=${encodeURIComponent(`{PO}='${po.replace(/'/g, "\\'")}'`)}&pageSize=10`);
    const delivery = deliveries.records?.[0];
    if (!delivery) return NextResponse.json({ error: `Delivery ${po} not found` }, { status: 404 });

    const itemsData = await airtable(`${TABLES.items}?pageSize=100`);
    const items = (itemsData.records || [])
      .filter((r: any) => (r.fields?.Delivery || []).some((x: any) => x.id === delivery.id))
      .map(normalize);

    return NextResponse.json({ delivery: normalize(delivery), items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deliveryId, itemId, quantity, condition, location, notes, barcode } = body;
    if (!deliveryId) return NextResponse.json({ error: 'deliveryId is required' }, { status: 400 });

    if (itemId) {
      const itemFields: Record<string, any> = {};
      if (typeof quantity === 'number') itemFields[F.item.received] = quantity;
      if (condition) itemFields[F.item.condition] = condition;
      if (location) {
        itemFields[F.item.location] = location;
        itemFields[F.item.actualLocation] = location;
      }
      if (notes) itemFields[F.item.notes] = notes;
      if (barcode) itemFields[F.item.barcode] = barcode;
      if (Object.keys(itemFields).length) {
        await airtable(`${TABLES.items}/${itemId}`, { method: 'PATCH', body: JSON.stringify({ fields: itemFields }) });
      }
    }

    if (action === 'complete') {
      await airtable(`${TABLES.deliveries}/${deliveryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: {
          [F.delivery.status]: 'Complete',
          [F.delivery.workflow]: 'Complete',
          [F.delivery.paperless]: true,
          [F.delivery.completion]: new Date().toISOString(),
        } }),
      });
    } else if (action === 'save') {
      await airtable(`${TABLES.deliveries}/${deliveryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: {
          [F.delivery.status]: 'Receiving',
          [F.delivery.workflow]: 'Scanning',
          ...(notes ? { [F.delivery.notes]: notes } : {}),
        } }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
