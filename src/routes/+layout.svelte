<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Toaster />
<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
