<script>
  let { data } = $props();
  let record = $derived(data.record);

  let detailItems = $derived([
    { label: 'Sub-Program', value: record.subProgram },
    { label: 'Abbreviation', value: record.abbreviation },
    { label: 'Target Age Min', value: record.targetAgeMin },
    { label: 'Target Age Max', value: record.targetAgeMax },
    { label: 'Clearinghouse Rating', value: record.clearinghouseRating },
    { label: 'State Title-IV Spending', value: record.stateTitleIVSpendingFormatted },
    { label: 'Federal Matching', value: record.federalMatchingFormatted },
  ].filter((item) => item.value));
</script>

<div class="container">
  <h1>{record.program}</h1>
  <h2>{record.state}</h2>

  <div class="spending-box">
    {#if record.totalSpending}
      <p class="spending-line">{record.state} has spent {record.totalSpending} on this program under the Family First Act.</p>
      {#if record.dateInfoProvided}
        <p class="spending-date">Data provided on {record.dateInfoProvided}</p>
      {/if}
    {:else}
      <p class="spending-line">Spending Data Not Available.</p>
    {/if}
  </div>

  <ul>
    {#each detailItems as item (item.label)}
      <li><strong>{item.label}:</strong> {item.value}</li>
    {/each}
  </ul>

  {#if record.planUrl}
    <p class="plan-link-row">
      <a href={record.planUrl} target="_blank" rel="noopener noreferrer">Access {record.state}'s full Family First Act spending plan at this link.</a>
    </p>
  {/if}
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--spacing-lg) var(--spacing-md);
  }

  h1 {
    margin-bottom: var(--spacing-xxs);
  }

  h2 {
    margin: 0 0 var(--spacing-md);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary, #555);
  }

  .spending-box {
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm, 4px);
    overflow: hidden;
    background: var(--color-white, #fff);
  }

  .spending-line {
    margin: 0;
    padding: var(--spacing-sm) var(--spacing-md);
    font-weight: var(--font-weight-semibold, 600);
  }

  .spending-date {
    margin: 0;
    padding: var(--spacing-xxs) var(--spacing-md) var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary, #555);
    border-top: 1px solid var(--color-border);
  }

  ul {
    padding-left: 1.25rem;
    line-height: 1.6;
  }

  .plan-link-row {
    margin-top: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .plan-link-row a {
    color: var(--color-text);
    text-decoration: underline;
  }
</style>
