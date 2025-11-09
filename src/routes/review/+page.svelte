<script lang="ts">
	let { data } = $props();
	import Card from '$lib/components/cards/card.svelte';
	import { flip } from 'svelte/animate';

	let questions = $state(data.questions);

	let popItem = (id: string) => {
		questions = questions.filter((item) => {
			return item.id !== id;
		});
	};
</script>

<div class="flex h-full flex-col gap-2 p-4">
	{#each questions as question (question.id)}
		<div animate:flip={{ duration: 300 }}>
			<Card {...question} {popItem} />
		</div>
	{/each}
</div>
