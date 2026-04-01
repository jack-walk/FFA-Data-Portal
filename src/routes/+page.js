// Page settings
import violations from '$lib/data/bronx_buildings.json';

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    violations,
  };
}
