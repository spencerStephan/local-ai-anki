<script lang="ts">
	import { type PageData } from './$types';
	import { columns } from '$lib/components/data-table/columns';
	import Dashboard from '$lib/components/data-table/dashboard.svelte';
	let { data }: { data: PageData } = $props();
</script>

<Dashboard {columns} data={data.reviews} />
