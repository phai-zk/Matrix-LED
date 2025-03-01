<script lang="ts">
	let { children } = $props();
</script>

<div class="max-w-full h-full rounded-xl border-2 border-black">
	<div class="max-w-full h-full p-2 overflow-x-hidden overflow-y-auto d-flex justify-center items-center flex-col">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>