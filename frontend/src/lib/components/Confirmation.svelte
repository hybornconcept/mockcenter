<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { LogOut } from "lucide-svelte";
	import { fade, scale } from "svelte/transition";

	let { 
		open = $bindable(false), 
		title = "Are you sure?",
		description = "Are you sure you want to proceed?",
		confirmText = "Confirm",
		cancelText = "Cancel",
		icon: Icon = LogOut,
		iconColorClass = "text-red-500",
		iconBgClass = "bg-red-50",
		confirmBtnClass = "bg-[#e44d4d] hover:bg-[#d43d3d] shadow-lg shadow-red-500/20 text-white",
		disabled = false,
		onConfirm 
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
		<div class="bg-white p-8 flex flex-col items-center text-center">
			<!-- Icon Circle -->
			{#if Icon}
				<div class="w-16 h-16 {iconBgClass} rounded-full flex items-center justify-center mb-6 {iconColorClass}">
					<Icon class="w-8 h-8" strokeWidth={1.5} />
				</div>
			{/if}

			<Dialog.Header class="space-y-3 mb-8">
				<Dialog.Title class="text-2xl font-bold text-[#141522]">{title}</Dialog.Title>
				<Dialog.Description class="text-[15px] font-medium text-slate-500 leading-relaxed mx-auto max-w-xs">
					{description}
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex gap-4 w-full px-2">
				<Dialog.Close 
					disabled={disabled}
					class="flex-1 h-12 flex items-center justify-center rounded-xl font-bold text-[15px] border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
				>
					{cancelText}
				</Dialog.Close>
				<Button 
					{disabled}
					class="flex-1 h-12 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] {confirmBtnClass}"
					onclick={() => {
						open = false;
						onConfirm?.();
					}}
				>
					{confirmText}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
