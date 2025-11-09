import type { ColumnDef } from '@tanstack/table-core';
import DataTableCheckbox from './data-table-checkbox.svelte';
import { renderComponent, renderSnippet } from '../ui/data-table';
import { createRawSnippet } from 'svelte';
import DataTableNoteButton from './data-table-note-button.svelte';
import DataTableHover from './data-table-hover.svelte';

type Card = {
	id: string;
	noteName: string;
	question: string;
	lastReview: number | null;
	nextReview: number | null;
};

function formatDate(rawTimestamp: number | null) {
	if (!rawTimestamp) return;
	const date = new Date(rawTimestamp * 1000);
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});
	const timeFormatter = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}

export const columns: ColumnDef<Card>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'noteName',
		header: ({ column }) =>
			renderComponent(DataTableNoteButton, {
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const noteSnippet = createRawSnippet<[{ note: string }]>((getNote) => {
				const { note } = getNote();
				return {
					render: () => `<div class="">${note}</div>`
				};
			});
			return renderSnippet(noteSnippet, {
				note: row.original.noteName
			});
		}
	},

	{
		accessorKey: 'question',
		header: 'Question',

		cell: ({ row }) => {
			return renderComponent(DataTableHover, {
				content: row.original.question
			});
		}
	},
	{
		accessorKey: 'lastReview',
		header: 'Last Review',

		cell: ({ row }) => {
			const lastReviewSnippet = createRawSnippet<[{ lastReviewDate: number | null }]>(
				(lastReview) => {
					const { lastReviewDate } = lastReview();
					const formatted = formatDate(lastReviewDate);
					return {
						render: () => `<div class="text-left font-medium">${formatted ?? ''}</div>`
					};
				}
			);

			return renderSnippet(lastReviewSnippet, {
				lastReviewDate: row.original.lastReview
			});
		}
	},

	{
		accessorKey: 'nextReview',
		header: 'Next Review',

		cell: ({ row }) => {
			const nextReviewSnippet = createRawSnippet<[{ nextReviewDate: number | null }]>(
				(nextReview) => {
					const { nextReviewDate } = nextReview();
					const formatted = formatDate(nextReviewDate);
					return {
						render: () => `<div class="text-left font-medium">${formatted ?? ''}</div>`
					};
				}
			);

			return renderSnippet(nextReviewSnippet, {
				nextReviewDate: row.original.nextReview
			});
		}
	}
];
