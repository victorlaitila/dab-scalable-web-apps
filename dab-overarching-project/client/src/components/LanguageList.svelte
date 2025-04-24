<script>
  import { onMount } from 'svelte';

  let languageList = $state([]);

  onMount(async () => {
    const response = await fetch("/api/languages");
    const jsonData = await response.json();
    languageList = jsonData;
  });
</script>

<h1>Available languages</h1>
<ul>
  {#each languageList as lang}
    <li><a href="/languages/{lang.id}">{lang.name}</a></li>
  {/each}
</ul>