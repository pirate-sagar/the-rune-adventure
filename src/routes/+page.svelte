<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		await Promise.all([
			import('$lib/data/l_BackgroundSkySea.js'),
			import('$lib/data/l_SecondaryBackgroundForest.js'),
			import('$lib/data/l_Decoration.js'),
			import('$lib/data/l_Ground.js'),
			import('$lib/data/l_Collisions.js'),
			import('$lib/data/l_Gems.js'),
			import('$lib/data/l_Cherries.js'),
			import('$lib/data/collisions.js'),

			import('$lib/classes/CollisionBlock.js'),
			import('$lib/classes/Player.js'),
			import('$lib/classes/Platform.js'),

			import('$lib/utils.js'),
			import('$lib/index.js'),
			import('$lib/eventListeners.js')
		]);
	});
</script>

<canvas class="h-svh" style="image-rendering: pixelated"></canvas>
