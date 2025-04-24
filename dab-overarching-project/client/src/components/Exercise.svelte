<script>
  import { onMount } from 'svelte';

  const { id } = $props();
  let exercise = $state(null);
	let inputString = $state('');
	let numberOfCharacters = $state(null);
	let numberOfIfs = $state(null);

  onMount(async () => {
    const response = await fetch(`/api/exercises/${id}`);
    const jsonData = await response.json();
    exercise = jsonData;
  });
	
  const handleSubmit = () => {
    if (inputString) {
      numberOfCharacters = inputString.length;
			numberOfIfs = (inputString.match(/if/g) || []).length;
    }
  };
</script>

{#if exercise !== null}
  <h1>{exercise.title}</h1>
  <p>{exercise.description}</p>
{/if}

<div>
	<textarea rows="4" cols="50" bind:value={inputString}></textarea>
</div>
<div>
	<button onclick={handleSubmit}>Submit</button>	
</div>

{#if numberOfCharacters !== null}
  <p>Characters: {numberOfCharacters}</p>
{/if}
{#if numberOfIfs !== null}
  <p>ifs: {numberOfIfs}</p>
{/if}