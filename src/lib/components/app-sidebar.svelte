<script lang="ts">
	import ChartBarIcon from '@tabler/icons-svelte/icons/chart-bar';
	import DashboardIcon from '@tabler/icons-svelte/icons/dashboard';
	import DatabaseIcon from '@tabler/icons-svelte/icons/database';
	import FileWordIcon from '@tabler/icons-svelte/icons/file-word';
	import InnerShadowTopIcon from '@tabler/icons-svelte/icons/inner-shadow-top';
	import ListDetailsIcon from '@tabler/icons-svelte/icons/list-details';
	import ReportIcon from '@tabler/icons-svelte/icons/report';
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import SettingsIcon from '@tabler/icons-svelte/icons/settings';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: ''
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/',
				icon: DashboardIcon
			},
			{
				title: 'Review',
				url: '/review',
				icon: ListDetailsIcon
			},
			{
				title: 'Analytics',
				url: '#',
				icon: ChartBarIcon
			}
		],

		navSecondary: [
			{
				title: 'Settings',
				url: '#',
				icon: SettingsIcon
			},

			{
				title: 'Search',
				url: '#',
				icon: SearchIcon
			}
		],
		documents: [
			{
				name: 'Data Library',
				url: '#',
				icon: DatabaseIcon
			},
			{
				name: 'Reports',
				url: '#',
				icon: ReportIcon
			},
			{
				name: 'Word Assistant',
				url: '#',
				icon: FileWordIcon
			}
		]
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">Vellen</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
