<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import CircleCheck from '@tabler/icons-svelte/icons/circle-check';
	import CircleX from '@tabler/icons-svelte/icons/xbox-x';
	import { fade } from 'svelte/transition';
	import { updateReviews } from '$lib/remote/reviews.remote';
	import { toast } from 'svelte-sonner';

	type Props = {
		id: string;
		question: string;
		noteName: string;
		cardId: string;
		options:
			| {
					option: string;
					value: string;
			  }[]
			| null;
		lastReview: number;
		answer: string;
		popItem: (id: string) => void;
	};
	let { ...data }: Props = $props();

	let selectedAnswer = $state('');
	let isCorrect: boolean | undefined = $state();
	let loading = $state(false);
	let checkedAnswer = $state(false);
	let disabled = $derived.by(() => {
		if (checkedAnswer || selectedAnswer === '' || !value) {
			return true;
		} else {
			return false;
		}
	});

	const selectOptions = [
		{ value: '5', label: 'Very Hard (10m)' },
		{ value: '4', label: 'Hard (1h)' },
		{ value: '3', label: 'Basic (1d)' },
		{ value: '2', label: 'Easy (3d)' },
		{ value: '1', label: 'Very Easy (2w)' }
	];

	let value = $state('');

	const triggerContent = $derived(
		selectOptions.find((f) => f.value === value)?.label ?? 'Select difficulty'
	);

	function calculateNextReview(difficulty: string): number {
		const now = Date.now();
		switch (difficulty) {
			case '5':
				return now + 10 * 60 * 1000;
			case '4':
				return now + 1 * 60 * 60 * 1000;
			case '3':
				return now + 1 * 24 * 60 * 60 * 1000;
			case '2':
				return now + 3 * 24 * 60 * 60 * 1000;
			case '1':
				return now + 2 * 7 * 24 * 60 * 60 * 1000;
			default:
				return now;
		}
	}

	async function checkAnswer() {
		loading = true;
		checkedAnswer = false;

		setTimeout(async () => {
			loading = false;
			if (selectedAnswer == data.answer) {
				isCorrect = true;
				checkedAnswer = true;
			} else {
				isCorrect = false;
				checkedAnswer = true;
			}
			let response = await updateReviews({
				id: data.id,
				lastReview: Math.floor(Date.now() / 1000),
				nextReview: Math.floor(calculateNextReview(value) / 1000),
				scoreValue: isCorrect,
				difficulty: parseInt(value),
				cardId: data.cardId
			});

			if (response?.error) {
				toast.error('There was an issue updating the database');
			} else {
				toast.success('Review has been submitted');
			}
		}, 750);
	}
</script>

<div out:fade={{ duration: 150 }}>
	<Card.Root class="h-1/8 w-full">
		<Card.Header>
			<Card.Title>{data.question}</Card.Title>
			<Card.Description>Note: {data.noteName}</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if !data.options}
				<p>No Options Listed</p>
			{:else}
				<RadioGroup.Root onValueChange={(v) => (selectedAnswer = v)}>
					{#each data.options as option (option.value)}
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={option.option} id={`${option.value}`} />
							<Label for={`${option.value}`}>{option.value}</Label>
						</div>
					{/each}
				</RadioGroup.Root>
			{/if}
		</Card.Content>
		<Card.Footer>
			<Card.Action class="flex gap-2">
				<Select.Root type="single" bind:value>
					<Select.Trigger class="w-[180px]">{triggerContent}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Difficulty</Select.Label>
							{#each selectOptions as selection (selection.value)}
								<Select.Item value={selection.value} label={selection.label}>
									{selection.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Button variant="default" onclick={checkAnswer} {disabled}>
					{#if loading === true}
						<span class="flex items-center gap-1"><Spinner></Spinner>Checking...</span>
					{:else if loading === false && selectedAnswer === '' && !checkedAnswer}
						Select Option
					{:else if loading === false && selectedAnswer !== '' && !checkedAnswer}
						Check Answer
					{:else if loading === false && isCorrect === true && checkedAnswer}
						<span class="flex items-center gap-1"
							><CircleCheck class="text-green-400"></CircleCheck>Correct</span
						>
					{:else if loading === false && isCorrect === false && checkedAnswer}
						<span class="flex items-center gap-1"
							><CircleX class="text-red-400"></CircleX>Incorrect</span
						>
					{/if}
				</Button>

				{#if checkedAnswer && !loading && value != ''}
					<Button variant="destructive" onclick={() => data.popItem(data.id)}>Clear Item</Button>
				{/if}
			</Card.Action>
		</Card.Footer>
	</Card.Root>
</div>

{#snippet dropdown()}{/snippet}
