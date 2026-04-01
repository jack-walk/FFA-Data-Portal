// Page settings
import { records } from '$lib/data/ffaRecords';

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    records,
  };
}
