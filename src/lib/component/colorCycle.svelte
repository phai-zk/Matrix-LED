<script lang="ts">
	import type { HSL, RGB } from "$lib/type/Color";
	import type { Possition } from "$lib/type/Coordinate";
	import { getCookie, addCookie } from "$lib/utils/cookie";
	import { onMount } from "svelte";

	//#region Props
	let { setColor, closeEidting } = $props();
	//#endregion

	//#region Color Variable
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
	let colorList: string[] = $state([]);
	//#endregion

	//#region Color Wheel initialize
	const size: number = 200;
	const radius: number = size / 2;
	let colorWheel: HTMLElement;
	let handle: HTMLElement;
	let handlePos: Possition = $state({ x: 0, y: 0 });
	let handleSize: DOMRect;
	let isDragging: boolean = $state(false);
	let isSlide: boolean = $state(false);
	//#endregion

	//#region Color Data Handling
	/** Loading lastest 35 color from cookie */
	function loadColorListFromCookie(): void {
		const savedColors: string[] = getCookie("colorList") ?? [];
		colorList = savedColors.slice(-35);
		while (colorList.length < 35) {
			colorList.unshift("");
		}
		colorList.reverse();
	}

	onMount(() => {
		const rect: DOMRect = colorWheel.getBoundingClientRect();
		handleSize = handle.getBoundingClientRect();

		loadColorListFromCookie();

		handlePos.x = rect.width / 2 - handleSize.width / 2;
		handlePos.y = rect.height / 2 - handleSize.height / 2;

		document.body.addEventListener("pointerup", onpointerup);
		document.body.addEventListener("pointerleave", onpointerup);
		document.body.addEventListener("pointermove", onpointermove);
	});
	//#endregion

	// #region Event Mouse
	function onpointerdown(event: any): void {
		isDragging = true;
	}

	function onpointerup(event: any): void {
		isDragging = false;
	}

	function onclick(event: any): void {
		isDragging = true;
		onpointermove(event);
	}

	function onpointermove(event: any): void {
		if (!isDragging) return;

		const rect: DOMRect = colorWheel.getBoundingClientRect();
		const centerX: number = rect.width / 2;
		const centerY: number = rect.height / 2;

		let x: number = event.clientX - rect.left - centerX;
		let y: number = event.clientY - rect.top - centerY;
		const distance: number = Math.sqrt(x * x + y * y);
		if (distance > radius) {
			const angle: number = Math.atan2(y, x);
			x = Math.cos(angle) * radius;
			y = Math.sin(angle) * radius;
		}
		moveHandle({ x, y });
		posToRGB(x, y, distance);
	}

	function moveHandle(pos: Possition): void {
		const rect: DOMRect = colorWheel.getBoundingClientRect();
		const centerX: number = rect.width / 2;
		const centerY: number = rect.height / 2;

		handlePos.x = centerX + pos.x - handleSize.width / 2;
		handlePos.y = centerY + pos.y - handleSize.height / 2;
	}
	//#endregion

	//#region Pos -> RGB
	/** calculate a hsl color from position and change hsl to rgb */
	function posToRGB(x: number, y: number, distance: number): void {
		const angle: number = Math.atan2(y, x) * (180 / Math.PI);
		colorHSL.h = (angle + 90 + 360) % 360;
		colorHSL.s = Math.min(distance / radius, 1) * 100;
		colorHSL.l = 100 - Math.min(distance / radius, 1) * 50;
		hslToRGB(colorHSL);
	}

	/** change hsl to rgb color*/
	function hslToRGB(color: HSL): RGB {
		const h: number = color.h / 360;
		const s: number = color.s / 100;
		const l: number = (color.l * (light / 50)) / 100;

		let r: number, g: number, b: number;

		if (s === 0) {
			r = g = b = l;
		} else {
			/** This is sub function to calculate a r, g and b */
			const hue2rgb = (p: number, q: number, t: number): number => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};

			const q: number = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p: number = 2 * l - q;
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
	//#endregion

	//#region RBG -> Pos
	/** get a r g b value form input and change it to position on wheel and light slider bar */
	function rgbToPos(color: RGB): void {
		const r: number = color.r / 255;
		const g: number = color.g / 255;
		const b: number = color.b / 255;
		colorRGB = color;

		const max: number = Math.max(r, g, b);
		const min: number = Math.min(r, g, b);
		let h: number = 0;
		let s: number = 100;
		let l: number = (max + min) / 2;
		if (l < 0.5) {
			light = l;
			l = 0.5;
		} else {
			light = 50;
		}

		if (max !== min) {
			const d: number = max - min;
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
		hslToPos({ h: h * 360, s: s * 100, l: l * 100 } as HSL);
	}

	/** calculate a hsl black to pos */
	function hslToPos(color: HSL): Possition {
		colorHSL = color;
		const angle: number = (colorHSL.h - 90 + 360) % 360;
		const distance: number = ((100 - colorHSL.l) / 50) * radius;
		const angleInRadians: number = (angle * Math.PI) / 180;
		const x: number = Math.cos(angleInRadians) * distance;
		const y: number = Math.sin(angleInRadians) * distance;

		moveHandle({ x, y } as Possition);
		return { x, y } as Possition;
	}
	//#endregion
</script>

<!-- Color Wheel Panel-->
<div
	class="p-3 bg-white z-20 lg:w-fit w-fit flex flex-col absolute lg:top-10 lg:right-10 lg:bottom-10 bottom-0 top-[50vh] md:right-0 right-[5%]"
	style="border-radius: 20px;border: 2px solid #000;"
>
	<!-- Color Wheel-->
	<div class="overflow-y-auto">
		<!-- Color Cycle-->
		<div
			{onpointermove}
			class="flex justify-center align-middle items-center my-3 rounded-full"
		>
			<div
				bind:this={colorWheel}
				onpointerdown={(e) => {
					onclick(e);
				}}
				class="color-wheel relative cursor-pointer z-0"
				style="width: {size}px; height: {size}px;"
			>
				<!-- Handle -->
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
				<!-- Handle -->
			</div>
		</div>
		<!-- Color Cycle-->
		<!-- Light Value Slider Bar -->
		<input
			id="slider"
			class="cursor-pointer custom-slider my-2"
			style="
			background: linear-gradient(to right, rgb(0, 0, 0), hsl({colorHSL.h}, {colorHSL.s}%, {colorHSL.l}%));
		"
			type="range"
			bind:value={light}
			onpointerdown={(e) => {
				isSlide = true;
			}}
			onpointerup={(e) => {
				isSlide = false;
			}}
			oninput={(e) => {
				hslToRGB(colorHSL);
			}}
			min={0}
			max={50}
			step={1}
		/>
		<!-- Light Value Slider Bar -->
		<!-- RGB Input Value -->
		<div
			class="my-2 flex flex-row justify-center align-middle items-center"
		>
			<div
				class="size-6 border-2 rounded-full border-black mx-2"
				style="background: rgb({colorRGB.r},{colorRGB.g},{colorRGB.b});"
			></div>
			<!-- R -->
			<label for="R">R</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.r}
				oninput={(e) => {
					if (colorRGB.r > 255) colorRGB.r = 255;
					else if (colorRGB.r < 0) colorRGB.r = 0;
					rgbToPos(colorRGB);
				}}
				onblur={(e) => {
					colorRGB.r = colorRGB.r ?? 0;
				}}
				max={255}
				min={0}
			/>
			<!-- R -->
			<!-- G -->
			<label for="G">G</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.g}
				oninput={(e) => {
					if (colorRGB.g > 255) colorRGB.g = 255;
					else if (colorRGB.g < 0) colorRGB.g = 0;
					rgbToPos(colorRGB);
				}}
				onblur={(e) => {
					colorRGB.g = colorRGB.g ?? 0;
				}}
				max={255}
				min={0}
			/>
			<!-- G -->
			<!-- B -->
			<label for="B">B</label>
			<input
				class="rounded-[5px] w-[68px] mx-2 py-1"
				type="number"
				bind:value={colorRGB.b}
				oninput={(e) => {
					if (colorRGB.b > 255) colorRGB.b = 255;
					else if (colorRGB.b < 0) colorRGB.b = 0;
					rgbToPos(colorRGB);
				}}
				onblur={(e) => {
					colorRGB.b = colorRGB.b ?? 0;
				}}
				max={255}
				min={0}
			/>
			<!-- B -->
		</div>
		<!-- RGB Input Value -->
		<!-- Latest Selected Color -->
		<div
			class="grid grid-cols-7 gap-2 my-5 place-content-center justify-center"
		>
			{#each colorList as c}
				<button
					class=" mx-auto {c ? 'cursor-pointer' : 'cursor-default'}"
					aria-label="Color button"
					onclick={(e) => {
						if (c) {
							const rgbValues = c.match(/\d+/g)?.map(Number);
							const rgbObject = {
								r: rgbValues?.[0],
								g: rgbValues?.[1],
								b: rgbValues?.[2],
							};
							rgbToPos(rgbObject as RGB);
						}
					}}
				>
					<div
						class="size-6 rounded-full"
						style={`background: ${!c ? "#eee" : c}; border: 2px solid ${!c ? "#aaa" : "#222"};`}
					></div>
				</button>
			{/each}
		</div>
		<!-- Latest Selected Color -->
	</div>
	<!-- Color Wheel-->
	<!-- BTN -->
	<div class="flex flex-row justify-around sm:mt-auto sm:mb-5 m-3">
		<!-- Cancel -->
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
		<!-- Cancel -->
		<!-- Save -->
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
		<!-- Save -->
	</div>
	<!-- BTN -->
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
