<script lang="ts">
	import type { HSL, HUE_S, RGB } from "$lib/type/Color";
	import type { Possition } from "$lib/type/Coordinate";
	import { onMount } from "svelte";

	const {
		size = 300,
		b_value,
		rgbColor = {
			r: 255,
			g: 255,
			b: 255,
		} as RGB,
		setColor,
	} = $props();
	let color: HSL = $state({ h: 0, s: 100, l: 100 });
	let radius = size / 2;
	let colorWheel: any;
	let handle: any;
	let handlePos: Possition = $state({ x: 0, y: 0 });
	let isDragging = false;
	let handleSize: any = 0;

	$effect(()=>{
		if (!isDragging)
			rgbChange();
	})

	function rgbChange() {
		console.log("WORK");

		let hsl: HSL = rgbToHsl(calculateRGBWithBValue(rgbColor));
		let pos: Possition = hslToPos(hsl);
		const rect = colorWheel.getBoundingClientRect();
		const center: Possition = { x: rect.width / 2, y: rect.height / 2 };
		moveHandle(pos, center);
	}

	function calculateRGBWithBValue(rgb: RGB): RGB {
		const factor = b_value / 50;
		return {
			r: Math.round(rgb.r * factor),
			g: Math.round(rgb.g * factor),
			b: Math.round(rgb.b * factor)
		} as RGB;
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

	function posToHSL(x: number, y: number, distance: number) {
		const angle = Math.atan2(y, x) * (180 / Math.PI);
		color.h = (angle + 90 + 360) % 360;
		color.s = Math.min(distance / radius, 1) * 100;
		color.l = 100 - Math.min(distance / radius, 1) * 50;

		setColor(hslToRGB(color), color);
	}

	function hslToRGB(color: HSL) {
		const h = color.h / 360;
		const s = color.s / 100;
		const l = color.l / 100;
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

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		} as RGB;
	}

	onMount(() => {
		const rect = colorWheel.getBoundingClientRect();
		handleSize = handle.getBoundingClientRect();
		handlePos.x = rect.width / 2 - handleSize.width / 2;
		handlePos.y = rect.height / 2 - handleSize.height / 2;
		document.body.addEventListener("pointerup", onpointerup);
		document.body.addEventListener("pointerleave", onpointerup);
		document.body.addEventListener("pointermove", onpointermove);
		console.log("Work");

		if (!isDragging)
			rgbChange();
	});

	function onpointerdown(event: any) {
		isDragging = true;
		console.log(isDragging);

	}

	function onpointerup(event: any) {
		isDragging = false;
		console.log(isDragging);
	}

	function onclick(event: any) {
		isDragging = true;
		console.log(isDragging);
		onpointermove(event);
	}

	function onpointermove(event: any) {
		if (!isDragging) return;
		console.log(isDragging);

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
</script>

<div
	{onpointermove}
	class="rounded-full size-full flex justify-center align-middle items-center"
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
				background: hsl({color.h}, {color.s}%, {color.l}%);
				border: 2px solid #000;
				top: {handlePos.y}px; left: {handlePos.x}px;
			"
		></div>
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
</style>
