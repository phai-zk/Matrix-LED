<script lang="ts">
	import { fly } from "svelte/transition";
	let isOpen = $state(true);
	const View = {
		Top: "Top View",
		Front: "Front View",
		Side: "Side View",
	};
	let selectedView = $state(View.Side);
	let { setPersective, setViewGrid, viewGrid } = $props();

	function updateView(view: any) {
		switch (view) {
			case View.Top:
				setPersective(-80, 0, -150, 0);
				selectedView = View.Top;
				break;
			case View.Front:
				setPersective(0, 0, 0, 0);
				selectedView = View.Front;
				break;
			case View.Side:
				setPersective(-30, 30, -50, -50);
				selectedView = View.Side;
				break;
			default:
				break;
		}
	}
</script>

{#if isOpen}
	<div
		in:fly={{ x: -200 }}
		out:fly={{ x: -200 }}
		id="ViewPanel"
		class="panel relative z-20 flex flex-col md:w-[200px] w-[150px]"
	>
		<div class="view w-full text-center md:text-md text-sm py-1">View</div>
		<button
			id="Top"
			class="py-1 {selectedView === View.Top ? 'active' : ''}"
			onclick={() => {
				updateView(View.Top);
			}}
		>
			<div class="md:text-md text-sm">Top View</div>
		</button>
		<button
			id="Front"
			class="py-1 {selectedView === View.Front ? 'active' : ''}"
			onclick={() => {
				updateView(View.Front);
			}}
		>
			<div class="md:text-md text-sm">Front View</div>
		</button>
		<button
			id="Side"
			class="py-1 {selectedView === View.Side ? 'active' : ''}"
			onclick={() => {
				updateView(View.Side);
			}}
		>
			<div class="md:text-md text-sm">Side View</div>
		</button>
		<button
			class="toggle"
			onclick={() => {
				viewGrid = !viewGrid;
				setViewGrid(viewGrid);
			}}
		>
			<div class="flex justify-center align-middle py-1">
				<div class="md:text-md text-sm pr-1">Show Grid :</div>
				<div class="md:text-md text-sm">{viewGrid ? "On" : "Off"}</div>
			</div>
		</button>
		<div class=" absolute top-0 w-0 h-0 p-1">
			<button
				class=" bg-transparent w-0 h-0"
				onclick={() => (isOpen = !isOpen)}
			>
				✖
			</button>
		</div>
	</div>
{:else}
	<div
		in:fly={{ x: -200, delay: 350 }}
		id="openNav"
		class=" md:bottom-[8rem] bottom-[8rem] md:-left-8 -left-5 absolute z-20"
	>
		<button
			class="flex items-center w-0 h-0"
			onclick={() => (isOpen = !isOpen)}
		>
			<div class="md:text-[5rem] text-[3rem]">
				<span class="text-[#8c49f9]">▸</span>
			</div>
		</button>
	</div>
{/if}

<style>
	:root {
		--panel-C: #e3cbff;
		--panel-HC: #b97cff;
		--panel-Border: #8c49f9;
		--panel-HBorder: #5819bd;
	}

	.panel {
		border: 2px solid var(--panel-Border);
		border-radius: 10px;
		color: var(--panel-Border);
	}

	.view {
		border-bottom: 2px solid var(--panel-Border);
	}

	button {
		border-bottom: 2px solid var(--panel-Border);
		color: var(--panel-Border);
		background: var(--panel-C);
	}

	button:hover {
		background: var(--panel-Border);
		color: var(--panel-C);
	}

	.active {
		background: var(--panel-Border);
		color: var(--panel-C);
	}

	.toggle {
		background: var(--panel-Border);
		color: var(--panel-C);
		border-radius: 0 0 8px 8px;
	}
</style>
