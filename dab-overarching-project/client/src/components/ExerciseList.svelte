<script>
  import { onMount } from 'svelte';

  const { id } = $props();
  let exerciseList = $state([]);

  onMount(async () => {
    const response = await fetch(`/api/languages/${id}/exercises`);
    const jsonData = await response.json();
    exerciseList = jsonData;
  });
</script>

<ul>
  {#each exerciseList as exercise}
    <li><a href="/exercises/{exercise.id}">{exercise.title}</a></li>
  {/each}
</ul>