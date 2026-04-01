<!--
@component
RankingList.svelte — A container for RankingCard items with an optional title.
-->
<script>
  let {
    title = '',
    headerRight,
    children,
  } = $props();
</script>

<div class="ranking-list">
  {#if title || headerRight}
    <div class="ranking-list-header">
      {#if title}
        <h2 class="ranking-list-title">{title}</h2>
      {/if}
      {#if headerRight}
        <div class="ranking-list-header-right">
          {@render headerRight()}
        </div>
      {/if}
    </div>
  {/if}
  <div class="ranking-list-items">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .ranking-list {
    border: 1px solid var(--color-border, #ddd);
    border-radius: 4px;
    overflow: hidden;
    background: var(--color-white, #fff);
  }

  .ranking-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
    background: var(--color-light-gray, #f5f5f5);
    border-bottom: 1px solid var(--color-border, #ddd);
    gap: var(--spacing-sm, 0.75rem);
  }

  .ranking-list-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ranking-list-header-right {
    margin-left: auto;
  }

  .ranking-list-items {
    :global(> :last-child) {
      border-bottom: none;
    }
  }
</style>
