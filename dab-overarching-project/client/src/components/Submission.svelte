<script>
	let inputString = $state('');
	let numberOfCharacters = $state(null);
	let numberOfIfs = $state(null);
	
  const handleSubmit = () => {
    if (inputString) {
      numberOfCharacters = inputString.length;
			numberOfIfs = (inputString.match(/if/g) || []).length;
    }
  };
</script>

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