// Page settings
import csvText from '$lib/data/FFA-data.csv?raw';

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

const records = parseCsv(csvText)
  .filter((row) => row.State && row.Program)
  .map((row, index) => ({
    id: row.Index || `${row.State}-${row.Program}-${index + 1}`,
    state: row.State,
    program: row.Program,
    subProgram: row['Sub-Program'],
    abbreviation: row.Abbreviation,
    rating: row['Clearhouse Rating'],
    relevance: row['Project Relevance'],
    planUrl: row['Plan URL'],
  }));

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    records,
  };
}
