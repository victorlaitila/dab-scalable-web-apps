<script>
  import { onMount } from 'svelte';

  const { id } = $props();
  let exercise = $state(null);
	let inputString = $state('');
  let submissionId = $state(null);
  let pollingInterval = 500;
  let gradingStatus = $state(null);
  let grade = $state(null);

  onMount(async () => {
    const response = await fetch(`/api/exercises/${id}`);
    const jsonData = await response.json();
    exercise = jsonData;
  });
	
  const handleSubmit = async () => {
    if (inputString) {
      const response = await fetch(`/api/exercises/${id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_code: inputString }),
      });
      if (response.ok) {
        const jsonData = await response.json();
        submissionId = jsonData.id;
        startPolling();
      } else {
        console.error('Failed to submit the exercise');
      }
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      if (submissionId) {
        const response = await fetch(`/api/submissions/${submissionId}/status`);
        if (response.ok) {
          const jsonData = await response.json();
          gradingStatus = jsonData.grading_status;
          grade = jsonData.grade;

          if (gradingStatus === 'graded') {
            clearInterval(interval);
          }
        } else {
          console.error('Failed to fetch grading status');
        }
      }
    }, pollingInterval);
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

{#if gradingStatus !== null}
  <p>Grading status: {gradingStatus}</p>
{/if}
{#if grade !== null}
  <p>Grade: {grade}</p>
{/if}