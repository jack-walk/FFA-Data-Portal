<script>
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import RankingList from '$lib/components/RankingList.svelte';
  import RankingCard from '$lib/components/RankingCard.svelte';
  import DropdownInput from '$lib/components/DropdownInput.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import { base } from '$app/paths';

  const ALL_STATES = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawai\'i',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
    'DC',
    'Puerto Rico',
  ];

  let { data } = $props();

  function parseMoney(value) {
    if (!value) return null;

    const normalized = String(value).replace(/[$,\s]/g, '');
    if (!normalized) return null;

    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
  }

  function getTotalSpendingForSort(record) {
    const stateAmount = parseMoney(record.stateTitleIVSpending);
    const federalAmount = parseMoney(record.federalMatching);

    if (stateAmount === null && federalAmount === null) {
      return null;
    }

    return (stateAmount ?? 0) + (federalAmount ?? 0);
  }

  function compareByProgramThenState(a, b) {
    const programCompare = (a.program || '').localeCompare(b.program || '');

    if (programCompare !== 0) {
      return programCompare;
    }

    return (a.state || '').localeCompare(b.state || '');
  }

  let sortBySpending = $state(false);

  let sortedRecords = $derived([
    ...data.records,
  ].sort((a, b) => {
    if (sortBySpending) {
      const aTotal = getTotalSpendingForSort(a);
      const bTotal = getTotalSpendingForSort(b);
      const aHas = aTotal !== null;
      const bHas = bTotal !== null;

      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      if (aHas && bHas && aTotal !== bTotal) {
        return bTotal - aTotal;
      }
    }

    return compareByProgramThenState(a, b);
  }));

  let selectedState = $state('');
  let selectedProgram = $state('');
  let currentPage = $state(1);
  const pageSize = 15;

  let stateOptions = $derived(
    [...new Set(ALL_STATES)]
      .sort((a, b) => a.localeCompare(b))
      .map((state) => ({ value: state, label: state }))
  );

  let programOptions = $derived(
    [...new Set(
      sortedRecords
        .filter((record) => !selectedState || record.state === selectedState)
        .map((record) => record.program)
    )]
      .sort((a, b) => a.localeCompare(b))
      .map((program) => ({ value: program, label: program }))
  );

  let filtered = $derived(
    sortedRecords
      .filter((record) => {
        const matchesState = !selectedState || record.state === selectedState;
        const matchesProgram = !selectedProgram || record.program === selectedProgram;

        return matchesState && matchesProgram;
      })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));

  let selectedStateHasPrograms = $derived(
    !selectedState || sortedRecords.some((record) => record.state === selectedState)
  );

  let pagedResults = $derived(
    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  $effect(() => {
    selectedState;
    selectedProgram;
    sortBySpending;
    currentPage = 1;
  });

  $effect(() => {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  });

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage -= 1;
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      currentPage += 1;
    }
  }

  function getEntryHref(id) {
    const safeBase = base === '/' ? '' : base;
    return `${safeBase}/${id}`;
  }
</script>

<DatabaseHeader
  headline="What are states spending to keep kids out of foster care?"
  description="The Family First Prevention Service Act sets aside federal dollars to help states reduce foster care entry rates.
  Here’s a look at what programs each state uses the act to fund."
  byline="Jack Walker"
    bylineHref="https://jackwalker.xyz"
  date="April 1, 2026"
>
  <p class="data-note">
    Entering the foster care system poses emotional and educational hurdles for children. Meanwhile, operating foster care programs can cost states significant money. In 2018, Congress passed the <a href="https://www.congress.gov/bill/115th-congress/house-bill/253" target="_blank" rel="noopener noreferrer">Family First Prevention Services Act</a>, which uses federal dollars to help fund state-level intervention programs that are not already covered by the federal government.
    <br /><br />
    This database contains information for each program for which states have sought reimbursement from the federal government through the Family First Act. Where possible, data was provided directly from state public information officers. For those that did not respond, data was obtained through publicly accessible state spending plans shared online. Not all states participate in the reimbursement program, and not all states had readily available spending information. <strong>Data may be incomplete.</strong>
  </p>
  <div class="controls-grid">
    <DropdownInput
      label="Program"
      placeholder="All programs..."
      options={programOptions}
      value={selectedProgram}
      onchange={(e) => {
        selectedProgram = e.target.value;
      }}
    />
    <DropdownInput
      label="State"
      placeholder="All states..."
      options={stateOptions}
      value={selectedState}
      onchange={(e) => {
        selectedState = e.target.value;
        selectedProgram = '';
      }}
    />
    <div class="sort-control">
      <span class="sort-control-label" aria-hidden="true">Sort</span>
      <button
        type="button"
        class="sort-button"
        onclick={() => {
          sortBySpending = !sortBySpending;
        }}
        aria-pressed={sortBySpending}
      >
        Sort by spending
      </button>
    </div>
  </div>
</DatabaseHeader>

<div class="container">
  <RankingList title="Click on a program to learn more">
    {#snippet headerRight()}
      <div class="pagination-controls" aria-label="Results pagination">
        <button type="button" onclick={goToPreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" onclick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    {/snippet}

    {#if selectedState && !selectedStateHasPrograms}
      <div class="empty-state-row">{selectedState} has not sought federal reimbursement for any programs through the Family First Act.</div>
    {:else}
      {#each pagedResults as record (record.id)}
        <RankingCard
          rank={record.stateAbbreviation}
          title={record.program}
          description={record.rating ? `Program Rating: ${record.rating}` : ''}
          href={getEntryHref(record.id)}
          forceNavigation={true}
          value={record.totalSpending}
          valueLabel={record.totalSpendingLabel}
          valueSubLabel={record.totalSpendingAsOf}
        />
      {/each}
    {/if}
  </RankingList>

  <p class="entries-summary">{pagedResults.length} of {filtered.length} entries</p>

  <MethodologyBox>
    <p>
      The data on this page comes from the Family First dataset in
      <strong>FFA-data.csv</strong>, with one row per state-program entry.
    </p>
    <p>
      Use the dropdowns to filter by program and state.
    </p>
  </MethodologyBox>

</div>

<style>
  .container {
    max-width: var(--max-width-wide);
    margin: 0 auto;
  }

  .controls-grid {
    display: grid;
    gap: var(--spacing-sm);
  }

  @media (min-width: 900px) {
    .controls-grid {
      grid-template-columns: 1fr 1fr auto;
      align-items: end;
    }
  }

  .sort-button {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    background: var(--color-white);
    color: var(--color-text);
    padding: var(--spacing-xs) var(--spacing-lg) var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-sans);
    font-size: var(--font-size-base);
    line-height: var(--leading-normal);
    cursor: pointer;
    white-space: nowrap;
  }

  .sort-button[aria-pressed='true'] {
    background: var(--color-light-gray, #f5f5f5);
    border-color: var(--color-medium-gray, #999);
  }

  .sort-control {
    width: 100%;
  }

  .sort-control-label {
    display: block;
    margin-bottom: var(--spacing-xxs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-wider);
    text-transform: uppercase;
    color: transparent;
    user-select: none;
  }

  .data-note {
    margin: var(--spacing-lg) 0;
    font-size: var(--font-size-sm);
    line-height: var(--leading-normal);
    color: var(--color-text-secondary, #555);
    opacity: 0.85;
    width: 100%;
    max-width: none;

    a {
      color: inherit;
      text-decoration: underline;
    }
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: 0;
  }

  .pagination-controls button {
    border: 1px solid var(--color-border);
    background: var(--color-white);
    color: var(--color-text);
    padding: var(--spacing-xxs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    cursor: pointer;
  }

  .pagination-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .entries-summary {
    margin: 0 0 var(--spacing-md);
    width: 100%;
    box-sizing: border-box;
    padding: var(--spacing-xxs) var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary, #555);
    line-height: var(--leading-normal);
    text-align: right;
    background: var(--color-light-gray, #f5f5f5);
    border: 1px solid var(--color-border, #ddd);
    border-top: 0;
    border-radius: 0 0 4px 4px;
  }

  .empty-state-row {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-light-gray, #f5f5f5);
    color: var(--color-text-secondary, #555);
    border-bottom: 1px solid var(--color-border, #ddd);
    line-height: var(--leading-normal);
  }
</style>