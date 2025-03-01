<script lang="ts">
	import Box from "$lib/component/panel.svelte";
	import ColorCycle from "$lib/ref/colorCycleOld.svelte";
	import { fade, fly } from "svelte/transition";
	import type { HSL, RGB } from "$lib/type/Color";
	import { onMount } from "svelte";
	let isOpen = $state(true);
	let color: RGB = $state({
		r: 255,
		g: 255,
		b: 255,
	});
	let colorHSL: HSL = $state({
		h: 0,
		s: 100,
		l: 100,
	});
	let b_value: number = $state(50);
	let slider: any = $state();
	const setColor = (rgb: RGB, hsl: HSL) => {
		color = rgb;
		colorHSL = hsl;
	};

	$effect(() => {
		updateThumbColor();
	});

	function updateThumbColor() {
		if (slider) {
			const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

			for (const sheet of document.styleSheets) {
				for (const rule of sheet.cssRules) {
					if (
						rule instanceof CSSStyleRule &&
						rule.selectorText ===
							".custom-slider.s-TNuiwfeo5ahq::-webkit-slider-thumb"
					) {
						rule.style.background = rgbColor;
						return;
					}
				}
			}
		}
	}
</script>

<div class="relative max-w-fit h-full">
	{#if isOpen}
		<div
			in:fly={{ duration: 500, x: 100 }}
			out:fly={{ duration: 500, x: 100 }}
			class="size-full"
		>
			<Box>
				<div class="w-full h-[300px] flex justify-center align-middle">
					<ColorCycle
						size={225}
						{b_value}
						rgbColor={color}
						{setColor}
					/>
				</div>
				<div class="py-5">
					<div
						class="flex flex-row justify-center align-middle items-center"
					>
						<label for="R">R</label>
						<input
							class="rounded-[5px] w-[75px] mx-2 px-2 py-1"
							type="number"
							bind:value={color.r}
							oninput={(e) => {
								if (color.r > 255) color.r = 255;
								else if (color.r < 0) color.r = 0;
							}}
							onblur={(e) => {
								color.r = color.r ?? 0;
							}}
							max={255}
							min={0}
						/>
						<label for="G">G</label>
						<input
							class="rounded-[5px] w-[75px] mx-2 px-2 py-1"
							type="number"
							bind:value={color.g}
							oninput={(e) => {
								if (color.g > 255) color.g = 255;
								else if (color.g < 0) color.g = 0;
							}}
							onblur={(e) => {
								color.g = color.g ?? 0;
							}}
							max={255}
							min={0}
						/>
						<label for="B">B</label>
						<input
							class="rounded-[5px] w-[75px] mx-2 px-2 py-1"
							type="number"
							bind:value={color.b}
							oninput={(e) => {
								if (color.b > 255) color.b = 255;
								else if (color.b < 0) color.b = 0;
							}}
							onblur={(e) => {
								color.b = color.b ?? 0;
							}}
							max={255}
							min={0}
						/>

						<div
							class="size-8 border-2 border-black rounded-md"
							style="background: rgb({color.r},{color.g},{color.b});"
						></div>
					</div>
					<input
						bind:this={slider}
						class="cursor-pointer custom-slider"
						style="
								background: linear-gradient(to right, rgb(0, 0, 0), hsl({colorHSL.h}, {colorHSL.s}%, {colorHSL.l}%));
							"
						type="range"
						bind:value={b_value}
						min={0}
						max={50}
						step={1}
					/>
				</div>
			</Box>
		</div>
	{/if}
	<button
		class="absolute top-1/2 -translate-y-1/2 -left-[45px] p-2 w-12 h-12"
		onclick={() => (isOpen = !isOpen)}
	>
		{#if isOpen}
			<img
				in:fade={{ duration: 500 }}
				out:fade={{ duration: 500 }}
				src="/Icon/LArrowClose.svg"
				alt="Not Load"
			/>
		{:else}
			<div
				in:fade={{ delay: 500, duration: 500 }}
				class="rounded-full bg-white p-1 border-2"
			>
				<img src="/Icon/LArrowOpen.svg" alt="Not Load" />
			</div>
		{/if}
	</button>
</div>

<style>
	.custom-slider {
		appearance: none;
		width: 100%;
		height: 8px;
		border-radius: 4px;
		border: 2px solid #000;
		outline: none;
		transition: 0.2s;
	}
	.custom-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: #fff;
		border: 2px solid #000;
		border-radius: 50%;
		cursor: pointer;
	}
</style>
