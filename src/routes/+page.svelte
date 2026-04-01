<script>
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import RankingList from '$lib/components/RankingList.svelte';
  import RankingCard from '$lib/components/RankingCard.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import DropdownInput from '$lib/components/DropdownInput.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import { base } from '$app/paths';

  let { data } = $props();

  function shuffleRecords(records) {
    const copy = [...records];

    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  let randomizedRecords = $derived(shuffleRecords(data.records));

  let search = $state('');
  let selectedState = $state('');
  let selectedProgram = $state('');
  let currentPage = $state(1);
  const pageSize = 15;

  let stateOptions = $derived(
    [...new Set(randomizedRecords.map((record) => record.state))]
      .sort((a, b) => a.localeCompare(b))
      .map((state) => ({ value: state, label: state }))
  );

  let programOptions = $derived(
    [...new Set(
      randomizedRecords
        .filter((record) => !selectedState || record.state === selectedState)
        .map((record) => record.program)
    )]
      .sort((a, b) => a.localeCompare(b))
      .map((program) => ({ value: program, label: program }))
  );

  let filtered = $derived(
    randomizedRecords
      .filter((record) => {
        const query = search.toLowerCase().trim();
        const matchesSearch = !query || [
          record.state,
          record.program,
          record.subProgram,
          record.abbreviation,
          record.rating,
          record.relevance,
        ].some((value) => (value || '').toLowerCase().includes(query));

        const matchesState = !selectedState || record.state === selectedState;
        const matchesProgram = !selectedProgram || record.program === selectedProgram;

        return matchesSearch && matchesState && matchesProgram;
      })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));

  let pagedResults = $derived(
    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  $effect(() => {
    search;
    selectedState;
    selectedProgram;
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
</script>

<DatabaseHeader
  headline="What are states spending to keep families together?"
  description="The Family First Prevention Service Act sets aside federal dollars to help states reduce foster care entry rates. Here’s a look at what programs each state is using their funds on, and how they aim to keep kids out of foster care."
  byline="Jack Walker"
    bylineHref="https://jackwalker.xyz"
  date="April 1, 2026"
>
  <div class="controls-grid">
    <div class="search-wrapper">
      <SearchInput bind:value={search} placeholder="Search by state, program, or rating..." />
    </div>
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
    <DropdownInput
      label="Program"
      placeholder="All programs..."
      options={programOptions}
      value={selectedProgram}
      onchange={(e) => {
        selectedProgram = e.target.value;
      }}
    />
  </div>
  <p class="data-note">
    Entering the foster care system can pose new emotional, educational and financial hurdles for the nation’s youth. Passed in 2018, the <a href="https://www.congress.gov/bill/115th-congress/house-bill/253" target="_blank" rel="noopener noreferrer">Family First Prevention Services Act</a> lets states create a spending plan for intervention programs not already covered with federal money, like Medicaid spending. The federal government then partially reimburses states.
    <br /><br />
    Data may be incomplete. Program information was obtained through spending plans each state listed online, plus the Title IV-E Prevention Services Clearinghouse, a government agency that reviews the efficacy of foster care intervention programs.
    <br /><br />
    Most states did not have the amount of information they spent on each program listed online. Where obtained through state public information officers, total spending on each program through the act has been listed. This data is likely incomplete, and does not account for other avenues that states use to fund these programs beyond the reimbursement process under the act.
  </p>
</DatabaseHeader>

<div class="container">
  <RankingList title="States fund 265 programs through the Family First Act. Here are 15.">
    {#snippet headerRight()}
      <div class="pagination-controls" aria-label="Results pagination">
        <button type="button" onclick={goToPreviousPage} disabled={currentPage === 1}>Previous 15</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" onclick={goToNextPage} disabled={currentPage === totalPages}>Next 15</button>
      </div>
    {/snippet}

    {#each pagedResults as record (record.id)}
      <RankingCard
        rank={record.stateAbbreviation}
        title={record.program}
        description={`${record.state}${record.subProgram ? ` • ${record.subProgram}` : ''}${record.rating ? ` • ${record.rating}` : ''}`}
        href={`${base}/${record.id}`}
        value={record.totalSpending}
        valueLabel={record.totalSpendingLabel}
        valueSubLabel={record.totalSpendingAsOf}
      />
    {/each}
  </RankingList>

  <MethodologyBox>
    <p>
      The data on this page comes from the Family First dataset in
      <strong>FFA-data.csv</strong>, with one row per state-program entry.
    </p>
    <p>
      Use the search field to match text across state, program, sub-program,
      abbreviation, rating, and relevance. Use the dropdowns to filter by
      state and program.
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
      grid-template-columns: 1.5fr 1fr 1fr;
      align-items: end;
    }
  }


  .search-wrapper {
    width: 100%;
  }

  .data-note {
    margin: var(--spacing-lg) 0;
    font-size: var(--font-size-sm);
    line-height: var(--leading-normal);
    color: var(--color-text-secondary, #555);
    opacity: 0.7;
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
    margin-top: var(--spacing-sm);
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
</style>