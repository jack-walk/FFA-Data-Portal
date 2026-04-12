import csvText from '$lib/data/FFA-data.csv?raw';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const STATE_ABBREVIATIONS = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  DC: 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  "Hawai'i": 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Puerto Rico': 'PR',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};

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

function parseMoney(value) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[$,\s]/g, '');

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function formatAsOfDate(value) {
  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (!match) {
    return '';
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = Number(match[3]);

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) {
    return '';
  }

  if (year < 100) {
    year += 2000;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return dateFormatter.format(date);
}

function getStateAbbreviation(state) {
  return STATE_ABBREVIATIONS[state] || state.slice(0, 2).toUpperCase();
}

export const records = parseCsv(csvText)
  .filter((row) => row.State && row.Program)
  .map((row, index) => {
    const stateSpending = parseMoney(row['State Title-IV Spending']);
    const federalSpending = parseMoney(row['Federal Matching']);
    const hasStateSpending = stateSpending !== null;
    const hasFederalSpending = federalSpending !== null;
    const bothBlank = !hasStateSpending && !hasFederalSpending;
    const bothZero = hasStateSpending && hasFederalSpending && stateSpending === 0 && federalSpending === 0;
    const totalSpendingAmount = (stateSpending ?? 0) + (federalSpending ?? 0);
    const asOfDate = formatAsOfDate(row['Date Info Was Provided']);
    const totalSpending = (bothBlank || bothZero) ? '' : currencyFormatter.format(totalSpendingAmount);

    return {
      id: row.Index || `${row.State}-${row.Program}-${index + 1}`,
      index: row.Index,
      state: row.State,
      stateAbbreviation: getStateAbbreviation(row.State),
      program: row.Program,
      subProgram: row['Sub-Program'],
      abbreviation: row.Abbreviation,
      targetAgeMin: row['Target Age Min'],
      targetAgeMax: row['Target Age Max'],
      rating: row['Clearhouse Rating'],
      clearinghouseRating: row['Clearhouse Rating'],
      stateTitleIVSpending: row['State Title-IV Spending'],
      federalMatching: row['Federal Matching'],
      stateTitleIVSpendingFormatted: stateSpending === null ? '' : currencyFormatter.format(Math.round(stateSpending)),
      federalMatchingFormatted: federalSpending === null ? '' : currencyFormatter.format(Math.round(federalSpending)),
      dateInfoProvided: row['Date Info Was Provided'],
      relevance: row['Project Relevance'],
      projectRelevance: row['Project Relevance'],
      note1: row['Note 1'],
      note2: row['Note 2'],
      planUrl: row['Plan URL'],
      totalSpending,
      totalSpendingLabel: totalSpending ? 'total state spending' : '',
      totalSpendingAsOf: (totalSpending && asOfDate) ? `as of ${asOfDate}` : '',
    };
  });
