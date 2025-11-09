<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	let { content }: { content: string } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class="max-w-96 truncate">{content}</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{content}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
