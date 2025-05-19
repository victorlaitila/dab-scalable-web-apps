<script>
  import { onMount } from 'svelte';
  import { useUserState } from "../states/userState.svelte.js";
  const userState = useUserState();

  const { id } = $props();
  let exercise = $state(null);
  let inputString = $state('');
  let submissionId = $state(null);
  let pollingInterval = 500;
  let gradingStatus = $state(null);
  let grade = $state(null);
  let prediction = $state(null);
  let typingTimer = null;

  onMount(async () => {
    try {
      const response = await fetch(`/api/exercises/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exercise data");
      }
      const jsonData = await response.json();
      exercise = jsonData;
    } catch (error) {
      console.error(error);
      exercise = { title: "An error occurred.", description: "Unable to load exercise data." };
    }
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
          console.log("Failed to fetch grading status");
        }
      }
    }, pollingInterval);
  };

  const fetchPrediction = async (exercise, code) => {
    try {
      const response = await fetch("/inference-api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ exercise, code })
      });
      const data = await response.json();
      prediction = Math.round(data.prediction) + "%";
    } catch (error) {
      console.log("Failed to fetch prediction:", error);
      prediction = null;
    }
  };

  const handleInputChange = () => {
    if (!inputString.trim()) {
      return;
    }

    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    typingTimer = setTimeout(() => {
      fetchPrediction(id, inputString);
    }, 500);
  };
</script>

{#if exercise !== null}
  <h1>{exercise.title}</h1>
  <p>{exercise.description}</p>
{/if}

{#if userState.email !== null}
  <div>
    <textarea
      rows="4"
      cols="50"
      bind:value={inputString}
      oninput={handleInputChange}
    ></textarea>
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
  {#if prediction !== null}
    <p>Correctness estimate: {prediction}</p>
  {/if}
{:else}
  <p>Login or register to complete exercises.</p>
{/if}