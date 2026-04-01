<script>
  let { data } = $props();
  let record = $derived(data.record);
</script>

<div class="container">
  <h1>{record.state} — {record.program}</h1>

  <ul>
    <li><strong>Index:</strong> {record.index || '—'}</li>
    <li><strong>State:</strong> {record.state || '—'}</li>
    <li><strong>Program:</strong> {record.program || '—'}</li>
    <li><strong>Sub-Program:</strong> {record.subProgram || '—'}</li>
    <li><strong>Abbreviation:</strong> {record.abbreviation || '—'}</li>
    <li><strong>Target Age Min:</strong> {record.targetAgeMin || '—'}</li>
    <li><strong>Target Age Max:</strong> {record.targetAgeMax || '—'}</li>
    <li><strong>Clearinghouse Rating:</strong> {record.clearinghouseRating || '—'}</li>
    <li><strong>State Title-IV Spending:</strong> {record.stateTitleIVSpending || '—'}</li>
    <li><strong>Federal Matching:</strong> {record.federalMatching || '—'}</li>
    <li><strong>Total Spending:</strong> {record.totalSpending || '—'}</li>
    <li><strong>Date Info Was Provided:</strong> {record.dateInfoProvided || '—'}</li>
    <li><strong>Project Relevance:</strong> {record.projectRelevance || '—'}</li>
    <li><strong>Note 1:</strong> {record.note1 || '—'}</li>
    <li><strong>Note 2:</strong> {record.note2 || '—'}</li>
    <li>
      <strong>Plan URL:</strong>
      {#if record.planUrl}
        <a href={record.planUrl} target="_blank" rel="noopener noreferrer">{record.planUrl}</a>
      {:else}
        —
      {/if}
    </li>
  </ul>
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--spacing-lg) var(--spacing-md);
  }

  h1 {
    margin-bottom: var(--spacing-md);
  }

  ul {
    padding-left: 1.25rem;
    line-height: 1.6;
  }
</style>
