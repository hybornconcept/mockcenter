<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let { children, ...restProps }: PopoverPrimitive.PortalProps & { children?: Snippet } = $props();
</script>

<PopoverPrimitive.Portal {...restProps}>
	{@render children?.()}
</PopoverPrimitive.Portal>
