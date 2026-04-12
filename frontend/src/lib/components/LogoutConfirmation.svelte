<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { LogOut } from "lucide-svelte";
	import { fade, scale } from "svelte/transition";

	let { open = $bindable(false), onConfirm } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
		<div class="bg-white p-8 flex flex-col items-center text-center">
			<!-- Icon Circle -->
			<div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
				<LogOut class="w-8 h-8" stroke-width={1.5} />
			</div>

			<Dialog.Header class="space-y-3 mb-8">
				<Dialog.Title class="text-2xl font-bold text-[#141522]">Are you sure?</Dialog.Title>
				<Dialog.Description class="text-[15px] font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
					Are you sure you want to log out? This action will end your current session.
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex gap-4 w-full px-2">
				<Dialog.Close 
					class="flex-1 h-12 rounded-xl font-bold text-[15px] border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
				>
					Cancel
				</Dialog.Close>
				<Button 
					variant="destructive" 
					class="flex-1 h-12 rounded-xl font-bold text-[15px] bg-[#e44d4d] hover:bg-[#d43d3d] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
					onclick={() => {
						open = false;
						onConfirm?.();
					}}
				>
					Log Out
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
