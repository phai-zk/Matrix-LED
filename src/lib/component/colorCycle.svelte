<script lang="ts">
	import type { HSL, RGB } from "$lib/type/Color";
	import type { Possition } from "$lib/type/Coordinate";
	import { onMount } from "svelte";
	let colorHSL: HSL = $state({
		h: 0,
		s: 0,
		l: 100,
	});
	let colorRGB: RGB = $state({
		r: 255,
		g: 255,
		b: 255,
	});
	let light: number = $state(50);
	let { setColor, closeEidting } = $props();
	let handlePos: Possition = $state({ x: 0, y: 0 });
	let isDragging = false;
	const size = 200;
	const radius = size / 2;
	let colorWheel: HTMLElement;
	let handle: HTMLElement;
	let handleSize: any = 0;

	let colorList: string[] = $state([]);

	import { getCookie, addCookie } from "$lib/utils/cookie";
	function loadColorListFromCookie() {
		const savedColors = getCookie("colorList") ?? [];
		colorList = savedColors.slice(-35);
		while (colorList.length < 35) {
			colorList.unshift("");
		}
		colorList.reverse();
	}

	onMount(() => {
		loadColorListFromCookie();
		console.log("HI");

		const rect = colorWheel.getBoundingClientRect();
		handleSize = handle.getBoundingClientRect();
		handlePos.x = rect.width / 2 - handleSize.width / 2;
		handlePos.y = rect.height / 2 - handleSize.height / 2;
		document.body.addEventListener("pointerup", onpointerup);
		document.body.addEventListener("pointerleave", onpointerup);
		document.body.addEventListener("pointermove", onpointermove);
	});

	// #region Event Mouse
	function onpointerdown(event: any) {
		isDragging = true;
	}
	function onpointerup(event: any) {
		isDragging = false;
	}
	function onclick(event: any) {
		isDragging = true;
		onpointermove(event);
	}
	//#endregion
	function onpointermove(event: any) {
		if (!isDragging) return;

		const rect = colorWheel.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		let x = event.clientX - rect.left - centerX;
		let y = event.clientY - rect.top - centerY;
		const distance = Math.sqrt(x * x + y * y);
		if (distance > radius) {
			const angle = Math.atan2(y, x);
			x = Math.cos(angle) * radius;
			y = Math.sin(angle) * radius;
		}
		moveHandle({ x, y }, { x: centerX, y: centerY });
		posToHSL(x, y, distance);
	}

	function moveHandle(pos: Possition, center: Possition) {
		handlePos.x = center.x + pos.x - handleSize.width / 2;
		handlePos.y = center.y + pos.y - handleSize.height / 2;
	}

	function hslToRGB(color: HSL) {
		const h = color.h / 360;
		const s = color.s / 100;
		const l = (color.l * (light / 50)) / 100;
		let r, g, b;

		if (s === 0) {
			r = g = b = l;
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		colorRGB = {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		};
		return colorRGB;
	}

	function posToHSL(x: number, y: number, distance: number) {
		const angle = Math.atan2(y, x) * (180 / Math.PI);
		colorHSL.h = (angle + 90 + 360) % 360;
		colorHSL.s = Math.min(distance / radius, 1) * 100;
		colorHSL.l = 100 - Math.min(distance / radius, 1) * 50;
		hslToRGB(colorHSL);
	}

	function hslToPos(hsl: HSL): Possition {
		const angle = (hsl.h - 90) * (Math.PI / 180);
		const distance = (hsl.s / 100) * radius;
		const x = Math.cos(angle) * distance;
		const y = Math.sin(angle) * distance;

		return { x, y } as Possition;
	}

	function rgbToHsl({ r, g, b }: RGB): HSL {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number = 0;
		let s: number = 0;
		let l: number = Math.min((max + min) / 2, 0.5);

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return { h: h * 360, s: s * 100, l: l * 100 } as HSL;
	}
</script>

<div
	class=" absolute p-3 bg-white z-20 sm:top-10 sm:right-10 sm:bottom-10 bottom-0 left-5 right-5 top-[50vh] flex flex-col"
	style="border-radius: 20px;border: 2px solid #000;"
>
	<div class=" overflow-y-auto">
		<div
			{onpointermove}
			class="rounded-full flex justify-center align-middle items-center my-3"
		>
			<div
				bind:this={colorWheel}
				onpointerdown={(e) => {
					onclick(e);
				}}
				class="color-wheel relative cursor-pointer z-0"
				style="width: {size}px; height: {size}px;"
			>
				<div
					bind:this={handle}
					{onpointerdown}
					class="absolute size-4 rounded-full cursor-pointer z-10"
					style="
				background: hsl({colorHSL.h}, {colorHSL.s}%, {colorHSL.l}%);
				border: 2px solid #000;
				top: {handlePos.y}px; left: {handlePos.x}px;
			"
				></div>
			</div>
		</div>
		<input
			id="slider"
			class="cursor-pointer custom-slider my-2"
			style="
			background: linear-gradient(to right, rgb(0, 0, 0), hsl({colorHSL.h}, {colorHSL.s}%, {colorHSL.l}%));
		"
			type="range"
			bind:value={light}
			oninput={(e) => {
				hslToRGB(colorHSL);
			}}
			min={0}
			max={50}
			step={1}
		/>
		<div
			class="my-2 flex flex-row justify-center align-middle items-center"
		>
			<div
				class="size-6 border-2 rounded-full border-black mx-2"
				style="background: rgb({colorRGB.r},{colorRGB.g},{colorRGB.b});"
			></div>
			<label for="R">R</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.r}
				oninput={(e) => {
					if (colorRGB.r > 255) colorRGB.r = 255;
					else if (colorRGB.r < 0) colorRGB.r = 0;
				}}
				onblur={(e) => {
					colorRGB.r = colorRGB.r ?? 0;
				}}
				max={255}
				min={0}
			/>
			<label for="G">G</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.g}
				oninput={(e) => {
					if (colorRGB.g > 255) colorRGB.g = 255;
					else if (colorRGB.g < 0) colorRGB.g = 0;
				}}
				onblur={(e) => {
					colorRGB.g = colorRGB.g ?? 0;
				}}
				max={255}
				min={0}
			/>
			<label for="B">B</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.b}
				oninput={(e) => {
					if (colorRGB.b > 255) colorRGB.b = 255;
					else if (colorRGB.b < 0) colorRGB.b = 0;
				}}
				onblur={(e) => {
					colorRGB.b = colorRGB.b ?? 0;
				}}
				max={255}
				min={0}
			/>
		</div>
		<div
			class="grid grid-cols-7 gap-2 my-5 place-content-center justify-center"
		>
			{#each colorList as c}
				<button
					class=" mx-auto {c ? 'cursor-pointer' : 'cursor-default'}"
					aria-label="Color button"
					onclick={(e) => {}}
				>
					<div
						class="size-6 rounded-full"
						style={`background: ${!c ? "#eee" : c}; border: 2px solid ${!c ? "#aaa" : "#222"};`}
					></div>
				</button>
			{/each}
		</div>
	</div>

	<div class="flex flex-row justify-around sm:mt-auto sm:mb-5 m-3">
		<button
			onclick={(e) => {
				closeEidting();
			}}
		>
			<div
				class="py-2 w-32 text-[16px] bg-[#ddd] hover:bg-[#ccc] rounded-xl text-[#8c49f9]"
			>
				<b>Cancle</b>
			</div>
		</button>
		<button
			onclick={(e) => {
				const color: RGB = hslToRGB(colorHSL);
				let rgb: string = `rgb(${color.r}, ${color.g}, ${color.b})`;
				addCookie("colorList", rgb, 7);
				setColor(color);
			}}
		>
			<div
				class="py-2 w-32 text-[16px] bg-[#8c49f9] hover:bg-[#713bc8] rounded-xl text-white"
			>
				<b>Save</b>
			</div>
		</button>
	</div>
</div>

<style>
	.color-wheel {
		border-radius: 50%;
		box-shadow: 0 0 10px #525252;
		background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
		position: relative;
	}

	.color-wheel::after {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(white, rgba(255, 255, 255, 0));
	}

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
