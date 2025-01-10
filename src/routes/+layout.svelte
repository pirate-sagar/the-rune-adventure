<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(*) {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	:global(*::-webkit-scrollbar) {
		display: none;
	}
</style>
