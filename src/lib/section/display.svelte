<script lang="ts">
	import { onMount } from "svelte";
	import { fade, slide } from "svelte/transition";
	import ViewPanel from "$lib/component/viewPanel.svelte";
	import ColorCycle from "$lib/component/colorCycle.svelte";
	import { getCookie, setCookie } from "$lib/utils/cookie";
	import type { RGB } from "$lib/type/Color";

	interface Cube {
		[key: string]: string | null;
	}

	//#region Cube Initialization
	const size: number = 8;
	const BORDER_COLOR: string = "#c595ff";
	let cubeSize: number = $state(20);
	let cube: Cube = {};
	//#endregion

	//#region State Variables
	let openNav: boolean = $state(true);
	let selectedLayer: number = $state(0);
	let viewGrid: boolean = $state(true);
	let clicked: boolean = $state(false);
	let selectedCube: string[] = $state([]);
	let editing: boolean = $state(false);
	//#endregion

	//#region Cube Data Handling
	/** loading a cube data from cookies */
	function loadCube(): void {
		for (let row = 0; row < 8; row++) {
			const rowCube: string[] = getCookie(`cube-${row}`);

			if (rowCube) {
				rowCube.forEach((color: string | null, index: number) => {
					const x: number = Math.floor(index / 8);
					const y: number = index % 8;
					const z: number = row;
					cube[`cube-${x}-${y}-${z}`] = color;
				});
			} else {
				// make Array of key name
				const keys = Array.from({ length: size }, (_, x) =>
					Array.from({ length: size }, (_, y) =>
						Array.from(
							{ length: size },
							(_, z) => `cube-${x}-${y}-${z}`,
						),
					),
				).flat(2); // turn 3D Array to 1D Array
				// initialize a cube (set object)
				keys.forEach((key) => (cube[key] = null));
			}
		}
	}

	/** saving a cube data to cookies */
	function saveCube(): void {
		const rowCube = [];
		let row = 0;
		for (let i = 0; i < 512; i += 64) {
			rowCube.push(Object.values(cube).slice(i, i + 64));
			setCookie(`cube-${row}`, JSON.stringify(rowCube[row]), 7);
			row++;
		}
	}

	/** responsive a cube size when width and height of the screen is change */
	function updateCubeSize(): void {
		const viewportWidth = window.innerWidth;
		const isMobile = viewportWidth <= 768;
		cubeSize = isMobile ? viewportWidth / 20 : viewportWidth / 40;
		document.documentElement.style.setProperty(
			"--cube-size",
			`${cubeSize}px`,
		);
		document.documentElement.style.setProperty(
			"--container-size",
			`calc(${size} * (${cubeSize}px))`,
		);
	}
	//#endregion

	//#region Lifecycle & Effects
	// like a start, run when the component is mounted
	onMount(() => {
		loadCube();
		saveCube();
		updateCubeSize();
		window.addEventListener("resize", updateCubeSize);
		document.body.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				resetData();
			}
		});
		document.getElementById("bg")?.addEventListener("dblclick", (e) => {
			if (editing) return;
			resetData();
		});
	});

	// like an update, run when the value in a $state is change
	$effect(() => {
		if (selectedLayer == 0) {
			setPerspective(-30, 30, -50, -50);
			resetData();
		} else {
			setPerspective(0, 0, 0, 0);
			resetData();
		}
	});
	//#endregion

	//#region Cube Controls
	/** change perspective of cube */
	function setPerspective(x: number, y: number, t: number, l: number): void {
		document.documentElement.style.setProperty("--BoxX", x + "deg");
		document.documentElement.style.setProperty("--BoxY", y + "deg");
		document.documentElement.style.setProperty("--TopPos", t + "px");
		document.documentElement.style.setProperty("--LeftPos", l + "px");
	}

	/** on/off the black line */
	function setViewGrid(b: boolean): void {
		viewGrid = b;
	}

	/** set color of the sub cube */
	function setColor(color: RGB | null): void {
		selectedCube.forEach((e) => {
			cube[e] = color ? `rgb(${color.r}, ${color.g}, ${color.b})` : null;
		});
		saveCube();
		resetData();
	}

	/** get all of the cube that click */
	function cubeClick(e: MouseEvent, x: number, y: number, z: number): void {
		if (selectedLayer === 0) return;
		clicked = true;
		const cubeId = `cube-${x}-${y}-${z}`;
		if (!selectedCube.includes(cubeId)) selectedCube.push(cubeId);
		else {
			selectedCube = selectedCube.filter((id) => id !== cubeId);
			if (selectedCube.length == 0) {
				resetData();
			}
		}
	}
	//#endregion

	//#region UI state
	/** show editing UI (color wheel)*/
	function onEditing(): void {
		editing = true;
	}

	/** reset a event variable */
	function resetData(): void {
		selectedCube = [];
		clicked = false;
		closeEidting();
	}

	/** close editing UI (color wheel) */
	function closeEidting(): void {
		editing = false;
	}
	//#endregion
</script>

<!-- Navigator Bar -->
{#if openNav}
	<div
		in:slide={{ duration: 300 }}
		out:slide={{ duration: 300 }}
		class="Nav z-20 flex bg-[#eee]"
	>
		<button
			class="w-fit"
			disabled={selectedLayer == 0 || !clicked}
			onclick={() => {
				onEditing();
			}}
		>
			<div class="md:h-[30px] mx-1 md:text-md text-sm">Edit</div>
		</button>
		<button
			class="w-fit"
			disabled={selectedLayer == 0 || !clicked}
			onclick={(e) => {
				setColor(null);
			}}
		>
			<div class="md:h-[30px] mx-1 md:text-md text-sm">Clear</div>
		</button>
		<div
			id="select"
			class="select mx-1 md:w-[200px] w-fit md:h-[30px] relative flex flex-row items-center"
		>
			<span class="pr-2 text-sm text-nowrap sm:flex hidden">Layer :</span>
			<select
				id="layer-select"
				class=" cursor-pointer text-sm"
				bind:value={selectedLayer}
			>
				{#each Array(size + 1) as _, i}
					<option value={i}>
						{i != 0 ? i : "Overview"}
					</option>
				{/each}
			</select>
		</div>
		<button class="pr-2" onclick={() => (openNav = !openNav)}>
			<h1 class="text-[#8c49f9] md:text-2xl text-lg"><b>✖</b></h1>
		</button>
	</div>
{:else}
	<div
		in:slide={{ duration: 300, delay: 350 }}
		id="openNav"
		class="z-20 top-0 left-1/2 absolute"
	>
		<button
			class="flex items-center cursor-pointer"
			onclick={() => (openNav = !openNav)}
		>
			<div class="md:text-[2rem] text-[1.5rem]">
				<span class="text-[#8c49f9]">▼</span>
			</div>
		</button>
	</div>
{/if}
<!-- Navigator Bar -->
<!-- Cube -->
<div
	class=" absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center h-full"
>
	<div class="cube-container absolute">
		{#each Array(size) as _, x}
			{#each Array(size) as _, y}
				{#each Array(size) as _, z}
					{#if selectedLayer == 0 || selectedLayer - 1 == z}
						<div
							in:fade
							out:fade
							id="cube-{z}"
							class="cube cube-{x}-{y}-{z}"
							style="transform: translate3d(
							{x * cubeSize}px,
							{y * cubeSize}px,
							{(size - z) * cubeSize}px);
							border: 2px solid {selectedCube.includes(`cube-${x}-${y}-${z}`)
								? BORDER_COLOR
								: viewGrid || selectedLayer != 0
									? '#000'
									: '#d3d3d344'};
							background: {cube[`cube-${x}-${y}-${z}`] ?? 'transparent'}
							"
						>
							<button
								class="size-full {selectedLayer == 0
									? 'cursor-default'
									: 'cursor-pointer'}"
								aria-label={`Cube at position ${x}, ${y}, ${z}`}
								onpointerdown={(e) => {
									cubeClick(e, x, y, z);
								}}
							>
							</button>
						</div>
					{/if}
				{/each}
			{/each}
		{/each}
	</div>
</div>
<!-- Cube -->
<!-- View Panel -->
{#if selectedLayer == 0}
	<div class=" absolute bottom-5 left-5">
		<ViewPanel {setPerspective} {setViewGrid} {viewGrid} />
	</div>
{/if}
<!-- View Panel -->
<!-- bg -->
<div id="bg" class="absolute top-0 left-0 size-full z-0"></div>
<!-- bg -->
<!-- Eiditing UI -->
{#if editing}
	<ColorCycle {setColor} closeEidting={resetData} />
{/if}

<!-- Eiditing UI -->

<style>
	* {
		outline: none;
	}

	:root {
		--cube-size: 10%;
		--container-size: calc(8 * (25px + 0px));
		--BoxX: -30deg;
		--BoxY: 30deg;
		--TopPos: -50px;
		--LeftPos: -50px;
		--font-C: #c595ff;
		--btn-pL: #8c49f9;
		--d: #d3d3d344;
	}

	.cube-container {
		position: relative;
		width: var(--container-size);
		height: var(--container-size);
		transform-style: preserve-3d;
		transform: rotateX(var(--BoxX)) rotateY(var(--BoxY));
		animation: rotate 5s infinite linear;
		top: var(--TopPos);
		left: var(--LeftPos);
		transition: 1s;
	}

	.cube {
		position: absolute;
		width: var(--cube-size);
		height: var(--cube-size);
		background: rgba(255, 255, 255, 0.8);
		border: 2px solid #000;
	}

	.Nav {
		position: relative;
		top: 20px;
		width: fit-content;
		height: fit-content;
		border: 3px solid #000;
		padding: 5px;
		border-radius: 15px;
		margin: 0 auto;
	}

	.Nav > div,
	.Nav > button > div {
		border: 3px solid #000;
		padding: 2px 20px;
		border-radius: 10px;
		color: var(--font-C);
		background: #000;
	}

	.Nav > button > div {
		background: var(--btn-pL);
		color: #ffffff;
	}

	.Nav > button:disabled > div {
		background: #6d6a84;
		color: #ffffff;
	}

	select:focus,
	select {
		border: none;
		width: 100px;
		padding: 0px;
		outline: none;
		box-shadow: none;
		margin-right: -18px;
		appearance: none;
		background: #000;
	}

	.select::before {
		content: "▼";
		position: absolute;
		font-size: 10px;
		top: 5px;
		right: 20px;
		width: 0;
		height: 0;
		color: var(--font-C);
		z-index: 0;
	}

	option {
		background: #000;
		color: var(--font-C);
	}
</style>
