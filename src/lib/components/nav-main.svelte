<script lang="ts">
	import CirclePlusFilledIcon from '@tabler/icons-svelte/icons/circle-plus-filled';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Icon } from '@tabler/icons-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { checkFile, uploadFile } from '$lib/remote/upload-file.remote.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { error } from '@sveltejs/kit';
	import Checkbox from './ui/checkbox/checkbox.svelte';
	let { items }: { items: { title: string; url: string; icon?: Icon }[] } = $props();
	let open = $state(false);
	let loading = $state(false);
	let filesLoaded = $state(false);
	import { toast } from 'svelte-sonner';
	import { generateQuestions } from '$lib/remote/generate-question-from-file.remote';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';

	let loadingAI = $state(false);
	let uploadProgress = $state(0);
	let progressMessage = $state('');

	let selectedFiles = $state<{ name: string; content: string; isUploaded: boolean }[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);
	async function handleFileSelect(event: Event) {
		loading = true;
		selectedFiles = [];
		filesLoaded = false;
		try {
			let files = (event.target as HTMLInputElement).files;
			if (!files) {
				return;
			}
			for (let i = 0; i < files.length; i++) {
				let file = files[i];
				const content = (await readFileContents(file)) as { name: string; content: string };
				if (!content) {
					continue;
				}

				if (content.name.includes('Map')) {
					continue;
				}
				selectedFiles.push({
					name: content.name,
					content: content.content,
					isUploaded: false
				});
			}

			let checkedFilesIfUploaded = await checkFile({
				notes: JSON.stringify(selectedFiles)
			});

			selectedFiles = selectedFiles.map((file, index) => {
				return {
					...file,
					isUploaded: checkedFilesIfUploaded[index].uploaded
				};
			});

			selectedFilesToUpload = selectedFiles
				.map((file) => {
					return {
						name: file.name,
						update: checkedItems.includes(file.name),
						upload: file.isUploaded == false,
						content: file.content
					};
				})
				.filter((file) => {
					return file.upload == true || file.update == true;
				});
		} finally {
			filesLoaded = true;
			loading = false;
			if (fileInput) {
				fileInput.value = '';
			}
		}
	}

	async function readFileContents(file: File) {
		if (!(file instanceof File)) {
			throw error(400, 'File is not a File');
		}

		const reader = new FileReader();
		let content = '';
		reader.onload = (event) => {
			content = event.target?.result as string;
		};

		reader.onerror = () => {
			throw error(500, `Failed to read file: ${file.name}`);
		};

		reader.readAsText(file);
		return new Promise((resolve, reject) => {
			reader.onload = (event) => {
				const content = event.target?.result as string;
				resolve({ name: file.name.split('.').slice(0, -1).join('.'), content: content });
			};
			reader.onerror = () => {
				reject(new Error(`Failed to read file: ${file.name}`));
			};
		});
	}

	let selectedFilesToUpload: {
		name: string;
		update: boolean;
		upload: boolean;
		content: string;
	}[] = $state([]);

	let checkedItems: string[] = $state([]);

	async function uploadFiles() {
		loadingAI = true;
		uploadProgress = 0;
		progressMessage = 'Starting upload...';

		if (selectedFilesToUpload.length === 0) {
			toast.warning('No files selected');
			loadingAI = false;
			progressMessage = '';
			return;
		}

		const totalFiles = selectedFilesToUpload.length;
		const uploadedNoteIds: { id: string }[] = [];
		let hasErrors = false;

		for (let i = 0; i < totalFiles; i++) {
			const file = selectedFilesToUpload[i];
			const fileProgress = (i / totalFiles) * 100;

			progressMessage = `Uploading ${file.name} (${i + 1}/${totalFiles})...`;
			uploadProgress = fileProgress + 5;

			const uploadResponse = await uploadFile({
				notes: JSON.stringify([file])
			});

			if (uploadResponse && uploadResponse.success === true && uploadResponse.data) {
				uploadedNoteIds.push(...uploadResponse.data);
				uploadProgress = fileProgress + 25;
				progressMessage = `Generating questions for ${file.name} (${i + 1}/${totalFiles})...`;

				if (uploadResponse.data.length > 0) {
					const questionsSuccess = await generateQuestions(JSON.stringify(uploadResponse.data));

					if (questionsSuccess.success === false) {
						hasErrors = true;
						toast.error(`Questions not generated for ${file.name}`);
					}
				}
			} else {
				hasErrors = true;
				toast.error(`Failed to upload ${file.name}`);
			}

			uploadProgress = ((i + 1) / totalFiles) * 100;
		}

		if (hasErrors) {
			toast.warning('Some files had errors during processing');
		} else {
			toast.success('All files processed successfully');
		}

		progressMessage = 'Complete!';
		uploadProgress = 100;

		setTimeout(() => {
			loadingAI = false;
			uploadProgress = 0;
			progressMessage = '';
		}, 500);
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			<Sidebar.MenuItem class="flex items-center gap-2">
				<Sidebar.MenuButton
					onclick={() => (open = !open)}
					class="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
					tooltipContent="Add cards"
				>
					<CirclePlusFilledIcon />
					<span>Add cards</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton tooltipContent={item.title}>
						{#snippet child({ props })}
							<a href={item.url} {...props}>
								{#if item.icon}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

<Dialog.Root bind:open onOpenChange={() => (open === false ? (selectedFiles = []) : null)}>
	<Dialog.Trigger></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Select a folder to create ANKI-style cards.</Dialog.Title>
			<Dialog.Description>
				This process will use AI to create ANKI-style cards from your notes.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex w-full max-w-md flex-col gap-6">
			<Item.Root variant="outline">
				<Item.Content>
					<Item.Title>Select a note or folder</Item.Title>
				</Item.Content>
				<Item.Actions>
					<Button variant="outline" size="sm" class="relative" disabled={loading}>
						<Label for="notes">Select</Label>
						<input
							bind:this={fileInput}
							id="notes"
							type="file"
							accept="text/markdown"
							class="absolute inset-0 cursor-pointer opacity-0"
							webkitdirectory
							multiple
							onchange={handleFileSelect}
						/>
					</Button>
				</Item.Actions>
			</Item.Root>
		</div>
		{#if selectedFiles.length > 0 && loading === false}
			<Card.Root class="max-h-[300px] overflow-y-auto">
				<Card.Content>
					<Card.Title>Selected Files</Card.Title>
				</Card.Content>
				<Card.Content class="flex flex-col gap-2">
					<Table.Root class="max-h-[300px] w-full overflow-y-auto">
						<Table.Header>
							<Table.Row>
								<Table.Head>Name</Table.Head>
								<Table.Head>Uploaded</Table.Head>
								<Table.Head>Insert/Update</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each selectedFiles as file}
								<Table.Row>
									<Table.Cell>{file.name}</Table.Cell>
									<Table.Cell class="text-center">{file.isUploaded ? 'Yes' : 'No'}</Table.Cell>
									<Table.Cell class="flex justify-center">
										<Checkbox
											checked={file.isUploaded == false || checkedItems.includes(file.name)}
											onCheckedChange={(checked) => {
												if (checked) {
													checkedItems.push(file.name);
													let item = selectedFiles.find((item) => item.name === file.name);
													if (item && item.isUploaded == true) {
														selectedFilesToUpload.push({
															name: file.name,
															update: true,
															upload: false,
															content: file.content
														});
													} else if (item && item.isUploaded == false) {
														selectedFilesToUpload.push({
															name: file.name,
															update: false,
															upload: true,
															content: file.content
														});
													}
												} else {
													checkedItems = checkedItems.filter((item) => item !== file.name);
													selectedFilesToUpload = selectedFilesToUpload.filter(
														(item) => item.name !== file.name
													);
												}
											}}
										></Checkbox>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-2">
					<Button variant="default" onclick={uploadFiles} disabled={loadingAI}>
						{#if loadingAI}
							<Spinner class="mr-2 h-4 w-4" />
						{/if}
						{loadingAI ? 'Processing...' : 'Upload'}
					</Button>
					{#if loadingAI}
						<div class="flex flex-col gap-1">
							<Progress value={uploadProgress} class="w-full" />
							{#if progressMessage}
								<p class="text-center text-xs text-muted-foreground">{progressMessage}</p>
							{/if}
						</div>
					{/if}
				</Card.Footer>
			</Card.Root>
		{/if}
	</Dialog.Content>
</Dialog.Root>
