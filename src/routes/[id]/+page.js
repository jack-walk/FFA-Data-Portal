import { error } from '@sveltejs/kit';
import { records } from '$lib/data/ffaRecords';

export function load({ params }) {
  const record = records.find((item) => item.id === params.id);

  if (!record) {
    throw error(404, 'Entry not found');
  }

  return {
    showHeader: true,
    showFooter: true,
    record,
  };
}

export function entries() {
  return records.map((record) => ({ id: record.id }));
}
