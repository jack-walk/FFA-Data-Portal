<script>
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import RankingList from '$lib/components/RankingList.svelte';
  import RankingCard from '$lib/components/RankingCard.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import DropdownInput from '$lib/components/DropdownInput.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';

  let { data } = $props();

  let search = $state('');
  let selectedState = $state('');
  let selectedProgram = $state('');

  let stateOptions = $derived(
    [...new Set(data.records.map((record) => record.state))]
      .sort((a, b) => a.localeCompare(b))
      .map((state) => ({ value: state, label: state }))
  );

  let programOptions = $derived(
    [...new Set(
      data.records
        .filter((record) => !selectedState || record.state === selectedState)
        .map((record) => record.program)
    )]
      .sort((a, b) => a.localeCompare(b))
      .map((program) => ({ value: program, label: program }))
  );

  let filtered = $derived(
    data.records
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
      .slice(0, 100)
  );
</script>

<DatabaseHeader
  headline="Family First Programs Explorer"
  description="Search and filter state prevention programs from FFA-data.csv"
  byline="NYCity News Service"
  date="Updated March 2026"
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
</DatabaseHeader>

<div class="container">
  <RankingList title={`Showing ${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`}>
    {#each filtered as record, index (record.id)}
      <RankingCard
        rank={index + 1}
        title={record.program}
        description={`${record.state}${record.subProgram ? ` • ${record.subProgram}` : ''}${record.rating ? ` • ${record.rating}` : ''}`}
        href={record.planUrl}
        value={record.relevance || '—'}
        valueLabel="relevance"
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
</style>