<script lang="ts">
	import {
		Image as ImageIcon,
		Link,
		AlertCircle,
		HardDrive,
		CloudUpload,
		Search,
		Grid2X2,
		List,
		Trash2,
		RefreshCw,
		ChevronRight,
		ChevronLeft,
		Check,
		ExternalLink,
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card";
	import * as Select from "$lib/components/ui/select";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { Progress } from "$lib/components/ui/progress";
	import * as Dialog from "$lib/components/ui/dialog";
	import { toast } from "svelte-sonner";
	import { fade, fly, slide, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import Empty from "$lib/components/Empty.svelte";
	import { KpiCard } from "$lib/components";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import { enhance } from '$app/forms';

	let { data } = $props();

	// --- State Management (Svelte 5) ---
	// svelte-ignore state_referenced_locally
	let media = $state(data.media);
	// svelte-ignore state_referenced_locally
	let questions = $state(data.questions);

	let searchQuery = $state("");
	let selectedSubject = $state("All subjects");
	let filterStatus = $state("all"); // all, attached, orphan, today
	let viewMode = $state("grid"); // grid, list
	let currentPage = $state(1);
	const itemsPerPage = 12;

	let selectedIds = $state(new Set<number>());
	let activeDetailId = $state<number | null>(null);

	let showAttachModal = $state(false);
	let attachingId = $state<number | null>(null);
	let attachingQuestionId = $state<number | null>(null);
	let attachSearch = $state("");

	let isUploading = $state(false);
	let isSyncing = $state(false);
	let isClearingAll = $state(false);
	let uploadQueue = $state<any[]>([]);
	let uploadFormEl = $state<HTMLFormElement | null>(null);

	// --- Confirmation modal shared state ---
	let confirmOpen = $state(false);
	let confirmState = $state<{
		title: string;
		description: string;
		confirmText: string;
		confirmBtnClass: string;
		onConfirm: () => void;
	}>({
		title: '',
		description: '',
		confirmText: 'Confirm',
		confirmBtnClass: 'bg-[#e44d4d] hover:bg-[#d43d3d] shadow-lg shadow-red-500/20 text-white',
		onConfirm: () => {},
	});

	function openConfirm(opts: typeof confirmState) {
		confirmState = opts;
		confirmOpen = true;
	}

	// --- Derived State ---
	const filteredMedia = $derived(
		(media || []).filter((m) => {
			if (!m) return false;
			const matchesSearch =
				searchQuery === "" ||
				(m.name || "").toLowerCase().includes(searchQuery.toLowerCase());
			const matchesSubject =
				selectedSubject === "All subjects" || m.subject === selectedSubject;
			const matchesStatus =
				filterStatus === "all" ||
				(filterStatus === "attached" && (m.attachedTo?.length || 0) > 0) ||
				(filterStatus === "orphan" && m.orphan) ||
				(filterStatus === "today" &&
					m.uploadedAt &&
					new Date().getTime() - new Date(m.uploadedAt).getTime() < 86400000);
			return matchesSearch && matchesSubject && matchesStatus;
		}),
	);

	const paginatedMedia = $derived(
		(filteredMedia || []).slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage,
		),
	);

	const totalPages = $derived(
		Math.max(1, Math.ceil((filteredMedia?.length || 0) / itemsPerPage)),
	);

	const kpis = $derived([
		{
			label: "Total images",
			value: media?.length || 0,
			sub: "in R2 bucket",
			icon: ImageIcon,
			color: "text-blue-500",
			bg: "bg-blue-50",
			badge: "Cloudflare R2",
		},
		{
			label: "Attached",
			value: (media || []).filter((m) => (m.attachedTo?.length || 0) > 0)
				.length,
			sub: "linked to questions",
			icon: Link,
			color: "text-emerald-500",
			bg: "bg-emerald-50",
			badge: "In use",
		},
		{
			label: "Orphaned",
			value: (media || []).filter((m) => m.orphan).length,
			sub: "no linked question",
			icon: AlertCircle,
			color: "text-rose-500",
			bg: "bg-rose-50",
			badge: "Review Required",
		},
		{
			label: "Storage used",
			value: `${((media || []).reduce((acc, m) => acc + (m.size || 0), 0) / 1024 / 1024).toFixed(1)} MB`,
			sub: "of 10 GB bucket",
			icon: HardDrive,
			color: "text-amber-500",
			bg: "bg-amber-50",
			badge: "Free Tier",
		},
		{
			label: "Uploaded today",
			value: (media || []).filter(
				(m) =>
					m.uploadedAt &&
					new Date().getTime() - new Date(m.uploadedAt).getTime() < 86400000,
			).length,
			sub: "new files",
			icon: CloudUpload,
			color: "text-indigo-500",
			bg: "bg-indigo-50",
			badge: "Session",
		},
	]);
	// Fix: kpis was using a filtered count as the value property for the last item incorrectly in the logic above

	const storageUsed = $derived(
		(media || []).reduce((acc, m) => acc + (m.size || 0), 0),
	);
	const storagePercentage = $derived(
		(storageUsed / (10 * 1024 * 1024 * 1024)) * 100,
	);

	const typeBreakdown = $derived(
		Object.entries(
			(media || []).reduce(
				(acc, m) => {
					if (m.type) {
						acc[m.type] = (acc[m.type] || 0) + 1;
					}
					return acc;
				},
				{} as Record<string, number>,
			),
		).map(([type, count]) => ({
			type,
			count,
			pct: (count / (media?.length || 1)) * 100,
		})),
	);

	const activeDetail = $derived(media.find((m) => m.id === activeDetailId));

	// --- Helper Functions ---
	function formatSize(bytes: number) {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
		return (bytes / 1048576).toFixed(1) + " MB";
	}

	function formatDate(date: Date | string) {
		const d = new Date(date);
		const now = new Date();
		const diff = Math.floor((now.getTime() - d.getTime()) / 3600000);
		if (diff < 1) return "Just now";
		if (diff < 24) return diff + "h ago";
		return Math.floor(diff / 24) + "d ago";
	}

	// --- Action Functions ---
	function toggleSelect(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
			if (activeDetailId === id) activeDetailId = null;
		} else {
			selectedIds.add(id);
			activeDetailId = id;
		}
		selectedIds = new Set(selectedIds);
	}

	async function deleteMedia(ids: number[]) {
		const toDelete = media.filter((m) => ids.includes(m.id));
		let deletedCount = 0;

		for (const item of toDelete) {
			try {
				const res = await fetch(`/api/admin/media/${encodeURIComponent(item.key)}`, {
					method: 'DELETE',
					credentials: 'include',
				});
				const json = await res.json();
				if (!res.ok || !json?.success) {
					toast.error(`Failed to delete ${item.name}`);
					continue;
				}
				deletedCount++;
			} catch {
				toast.error(`Network error deleting ${item.name}`);
			}
		}

		if (deletedCount > 0) {
			// Remove only successfully deleted items from local state
			const deletedIds = toDelete.slice(0, deletedCount).map((m) => m.id);
			media = media.filter((m) => !deletedIds.includes(m.id));
			selectedIds = new Set([...selectedIds].filter((id) => !deletedIds.includes(id)));
			if (activeDetailId && deletedIds.includes(activeDetailId)) activeDetailId = null;
			toast.success(`${deletedCount} image${deletedCount !== 1 ? 's' : ''} deleted from R2 ✓`);
		}
	}

	async function deleteOrphans() {
		try {
			const res = await fetch('/api/admin/media/orphans', {
				method: 'DELETE',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok || !json?.success) {
				toast.error(json?.message ?? json?.error?.message ?? 'Failed to delete orphans');
				return;
			}
			// Remove all orphans from local state
			media = media.filter((m) => !m.orphan);
			toast.success(`Orphaned images cleared ✓`);
		} catch {
			toast.error('Network error while deleting orphans');
		}
	}

	function promptDeleteOrphans() {
		openConfirm({
			title: 'Delete Orphaned Images?',
			description: 'This will permanently remove all images not linked to any question from the R2 bucket. This cannot be undone.',
			confirmText: 'Delete Orphans',
			confirmBtnClass: 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-white',
			onConfirm: deleteOrphans,
		});
	}

	function promptClearAll() {
		openConfirm({
			title: 'Clear All Images?',
			description: 'This will permanently delete every image from the R2 bucket and unlink them from all questions. This cannot be undone.',
			confirmText: 'Yes, Clear Everything',
			confirmBtnClass: 'bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-500/20 text-white',
			onConfirm: clearAllImages,
		});
	}

	function promptSyncToQuestions() {
		openConfirm({
			title: 'Sync Images to Questions?',
			description: 'This will scan all R2 images and auto-link each one to its matching question by filename. Existing links may be overwritten.',
			confirmText: 'Sync Now',
			confirmBtnClass: 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white',
			onConfirm: syncToQuestions,
		});
	}

	async function syncToQuestions() {
		isSyncing = true;
		try {
			const res = await fetch('/api/admin/media/sync', {
				method: 'POST',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok || !json?.success) {
				toast.error(json?.message ?? json?.error?.message ?? 'Sync failed');
			} else {
				const d = json.data;
				const linked = d?.linked ?? 0;
				const unmatched = d?.unmatched ?? 0;
				if (linked > 0) {
					toast.success(`✓ ${linked} question${linked !== 1 ? 's' : ''} linked to images. ${unmatched} images unmatched.`);
				} else {
					toast.info(`No new links created. ${unmatched} images still unmatched.`);
				}
				// Refresh page data to reflect new image_url links
				window.location.reload();
			}
		} catch (e) {
			toast.error('Network error during sync');
		} finally {
			isSyncing = false;
		}
	}

	async function clearAllImages() {
		isClearingAll = true;
		try {
			const res = await fetch('/api/admin/media/all', {
				method: 'DELETE',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok || !json?.success) {
				toast.error(json?.message ?? json?.error?.message ?? 'Clear failed');
			} else {
				const deleted = json?.data?.deleted ?? 0;
				toast.success(`✓ ${deleted} image${deleted !== 1 ? 's' : ''} cleared from R2.`);
				media = [];
			}
		} catch (e) {
			toast.error('Network error during clear');
		} finally {
			isClearingAll = false;
		}
	}

	function openAttach(id: number) {
		attachingId = id;
		showAttachModal = true;
	}

	function confirmAttach() {
		if (!attachingQuestionId || !attachingId) return;
		const m = media.find((x) => x.id === attachingId);
		if (m) {
			if (!m.attachedTo.includes(attachingQuestionId))
				m.attachedTo.push(attachingQuestionId);
			m.orphan = false;
			const q = questions.find(
				(question) => question.id === attachingQuestionId,
			);
			if (q) m.subject = q.subject;
		}
		media = [...media];
		showAttachModal = false;
		toast.success("Image attached to question");
	}

	function handleFileUpload(files: FileList | null) {
		if (!files || files.length === 0) return;
		const fileArr = Array.from(files);

		fileArr.forEach((file) => {
			const tmpId = Date.now() + Math.random();
			uploadQueue = [...uploadQueue, { id: tmpId, name: file.name, progress: 0 }];
			isUploading = true;

			const fd = new FormData();
			fd.append('file', file, file.name);

			// Call the backend API directly — SvelteKit form action responses use
			// devalue serialization (not plain JSON) so we bypass the action layer.
			fetch('/api/admin/media', {
				method: 'POST',
				body: fd,
				credentials: 'include',
			})
				.then((res) => res.json())
				.then((json) => {
					if (!json?.success || !json?.data?.key) {
						throw new Error(json?.message ?? json?.error?.message ?? 'Upload failed');
					}
					const d = json.data;
					const newItem = {
						id: tmpId,
						key: d.key,
						name: file.name,
						url: d.url,
						size: d.size ?? file.size,
						type: file.name.split('.').pop() || 'img',
						subject: null,
						attachedTo: [],
						uploadedAt: new Date(),
						orphan: true,
					};
					media = [newItem, ...media];
					uploadQueue = uploadQueue.filter((u) => u.id !== tmpId);
					toast.success(`${file.name} uploaded to R2 ✓`);
				})
				.catch((err) => {
					uploadQueue = uploadQueue.filter((u) => u.id !== tmpId);
					toast.error(`Failed to upload ${file.name}: ${err.message}`);
				})
				.finally(() => {
					if (uploadQueue.length === 0) isUploading = false;
				});
		});
	}
</script>


{#snippet MediaItem(item: any)}
	{#if viewMode === "grid"}
		<div
			class="group relative bg-white rounded-2xl border border-gray-100 shadow-[2px_8px_16px_-8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand/40 cursor-pointer {selectedIds.has(
				item.id,
			)
				? 'ring-2 ring-brand border-none shadow-brand/10'
				: ''}"
			onclick={() => toggleSelect(item.id)}
			onkeydown={(e) => e.key === "Enter" && toggleSelect(item.id)}
			role="button"
			tabindex="0"
			in:scale={{ duration: 300, start: 0.95, easing: quintOut }}
		>
			<!-- Selection Overlay -->
			<div
				class="absolute top-2 left-2 z-10 transition-opacity {selectedIds.has(
					item.id,
				)
					? 'opacity-100'
					: 'opacity-0 group-hover:opacity-100'}"
			>
				<div
					class="w-6 h-6 rounded-full flex items-center justify-center border-2 {selectedIds.has(
						item.id,
					)
						? 'bg-brand border-brand text-white'
						: 'bg-white/80 border-white text-brand backdrop-blur-md'} shadow-sm"
				>
					<Check class="w-3.5 h-3.5" />
				</div>
			</div>

			{#if item.orphan}
				<div class="absolute top-2 right-2 z-10">
					<div
						class="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
					></div>
				</div>
			{/if}

			<!-- Image -->
			<div class="aspect-square bg-gray-50 overflow-hidden relative">
				<img
					src={item.url}
					alt={item.name}
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
			</div>

			<!-- Body -->
			<div class="p-3 flex flex-col gap-1.5">
				<p class="text-[11px] font-bold text-gray-700 truncate tracking-tight">
					{item.name}
				</p>
				<div class="flex items-center justify-between">
					<span class="text-[10px] text-gray-400 font-medium"
						>{formatSize(item.size)} · {formatDate(item.uploadedAt)}</span
					>
					{#if item.subject}
						<Badge
							variant="outline"
							class="text-[8px] font-bold px-1.5 py-0 border-gray-100 text-gray-500 bg-gray-50"
							>{item.subject}</Badge
						>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div
			class="group flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-[2px_8px_16px_-8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all cursor-pointer {selectedIds.has(
				item.id,
			)
				? 'ring-2 ring-brand border-none'
				: ''}"
			onclick={() => toggleSelect(item.id)}
			onkeydown={(e) => e.key === "Enter" && toggleSelect(item.id)}
			role="button"
			tabindex="0"
			in:fly={{ y: 20 }}
		>
			<div class="relative shrink-0">
				<div
					class="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
				>
					<img
						src={item.url}
						alt={item.name}
						class="w-full h-full object-cover"
					/>
				</div>
				<div
					class="absolute -top-1.5 -left-1.5 transition-opacity {selectedIds.has(
						item.id,
					)
						? 'opacity-100'
						: 'opacity-0 group-hover:opacity-100'}"
				>
					<div
						class="w-5 h-5 rounded-full bg-brand border-2 border-white text-white flex items-center justify-center shadow-sm"
					>
						<Check class="w-2.5 h-2.5" />
					</div>
				</div>
			</div>

			<div class="flex-1 flex flex-col gap-0.5 min-w-0">
				<div class="flex items-center gap-2">
					<span class="text-sm font-bold text-gray-700 truncate"
						>{item.name}</span
					>
					{#if item.orphan}
						<div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
					{/if}
				</div>
				<div
					class="flex items-center gap-3 text-[10px] text-gray-400 font-medium tracking-tight"
				>
					<span>{formatSize(item.size)}</span>
					<span class="w-1 h-1 rounded-full bg-gray-200"></span>
					<span>{item.type.toUpperCase()}</span>
					<span class="w-1 h-1 rounded-full bg-gray-200"></span>
					<span>{formatDate(item.uploadedAt)}</span>
					{#if item.subject}
						<span class="w-1 h-1 rounded-full bg-gray-200"></span>
						<span class="text-brand font-bold">#{item.subject}</span>
					{/if}
				</div>
			</div>

			<div
				class="flex items-center gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<Button
					variant="outline"
					size="sm"
					class="h-8 rounded-lg text-[10px] font-bold border-gray-100"
					onclick={(e) => {
						e.stopPropagation();
						openAttach(item.id);
					}}
				>
					Attach
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50"
					onclick={(e) => {
						e.stopPropagation();
						deleteMedia([item.id]);
					}}
				>
					<Trash2 class="w-3.5 h-3.5" />
				</Button>
			</div>
		</div>
	{/if}
{/snippet}

{#snippet DetailRow({
	label,
	value,
	mono = false,
	isSubject = false,
}: {
	label: string;
	value: string;
	mono?: boolean;
	isSubject?: boolean;
})}
	<div
		class="flex items-center justify-between py-1 border-b border-gray-50/50 last:border-0"
	>
		<span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
			>{label}</span
		>
		<span
			class="text-[12px] font-semibold text-[#141522] truncate max-w-[180px] {mono
				? 'font-mono text-[10px] text-gray-500'
				: ''} {isSubject && value !== 'Not tagged' ? 'text-brand' : ''}"
		>
			{value}
		</span>
	</div>
{/snippet}

<main class="w-full h-full pb-6 px-4 max-w-[1800px] mx-auto">
	<!-- Top Actions -->
	<div class="flex justify-end gap-2.5 mb-5 mt-2">
		{#if media.some((m) => m.orphan)}
			<Button
				variant="outline"
				class="h-9 px-3.5 text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 border-none shadow-md shadow-rose-100 rounded-xl"
				onclick={promptDeleteOrphans}
			>
				<Trash2 class="w-3.5 h-3.5 mr-2" />
				Delete Orphans
			</Button>
		{/if}
		<Button
			variant="outline"
			class="h-9 px-3.5 text-[11px] font-bold bg-slate-700 hover:bg-slate-800 text-white border-none shadow-md shadow-slate-200 rounded-xl disabled:opacity-60"
			onclick={promptClearAll}
			disabled={isClearingAll}
		>
			{#if isClearingAll}
				<RefreshCw class="w-3.5 h-3.5 mr-2 animate-spin" /> Clearing...
			{:else}
				<Trash2 class="w-3.5 h-3.5 mr-2" /> Clear All Images
			{/if}
		</Button>
		<Button
			variant="outline"
			class="h-9 px-3.5 text-[11px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 border-none shadow-md shadow-indigo-100 rounded-xl disabled:opacity-60"
			onclick={promptSyncToQuestions}
			disabled={isSyncing}
		>
			{#if isSyncing}
				<RefreshCw class="w-3.5 h-3.5 mr-2 animate-spin" /> Syncing...
			{:else}
				<RefreshCw class="w-3.5 h-3.5 mr-2" /> Sync to Questions
			{/if}
		</Button>
		<div class="relative group">
			<input
				type="file"
				multiple
				accept="image/*"
				class="absolute inset-0 opacity-0 cursor-pointer z-10"
				onchange={(e) => handleFileUpload(e.currentTarget.files)}
			/>
			<Button
				class="h-9 px-4.5 text-[11px] font-bold text-white bg-[#3B6D11] hover:bg-[#2D540D] transition-all shadow-md shadow-emerald-100 rounded-xl"
			>
				<CloudUpload class="w-3.5 h-3.5 mr-2" />
				Upload Images
			</Button>
		</div>
	</div>

	<!-- KPI Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 pb-[15px]">
		{#each kpis as kpi}
			<KpiCard
				title={kpi.label}
				value={kpi.value}
				Icon={kpi.icon}
				colorClass={kpi.color}
				subtext={kpi.sub}
				badgeText={kpi.badge}
			/>
		{/each}
	</div>

	<!-- Main Workspace Grid (70/30) -->
	<div
		class="w-full flex flex-col lg:grid lg:grid-cols-[minmax(0,7.3fr)_minmax(0,2.7fr)] gap-4 items-start"
	>
		<!-- Left: Gallery & Filters (70%) -->
		<div
			class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 transition-all duration-300 w-full p-6 flex flex-col gap-6 lg:min-w-0"
		>
			<!-- Title Row -->
			<div
				class="flex items-center justify-between pb-2 border-b border-slate-50"
			>
				<div class="flex flex-col gap-1">
					<h3 class="text-[17px] font-bold text-[#141522] tracking-tight">
						Image Gallery
					</h3>
					<p class="text-[12px] text-slate-400 font-medium">
						Browse and manage cloud-stored assets
					</p>
				</div>
				<Badge
					variant="outline"
					class="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[11px] font-semibold border-slate-200 shadow-sm whitespace-nowrap"
				>
					{filteredMedia.length} files
				</Badge>
			</div>

			<!-- Search Area -->
			<div class="flex items-center gap-4">
				<div class="relative flex items-center flex-1 group/search">
					<Search
						class="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/search:text-brand transition-colors"
						stroke-width={1.5}
					/>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by filename, subject..."
						class="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-full text-[13px] text-[#141522] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand focus:bg-white transition-all shadow-sm"
					/>
				</div>
				<div class="flex items-center gap-3">
					<select
						bind:value={selectedSubject}
						class="h-10 px-4 pr-10 rounded-full border border-slate-100 bg-slate-50/50 text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm"
					>
						{#each ["All subjects", "Mathematics", "Biology", "Physics", "Chemistry", "English", "History"] as subject}
							<option value={subject}>{subject}</option>
						{/each}
					</select>
					<div
						class="flex p-1 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm"
					>
						<button
							class="p-2 rounded-xl transition-all {viewMode === 'grid'
								? 'bg-white shadow-md text-brand border border-slate-100'
								: 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}"
							onclick={() => (viewMode = "grid")}
						>
							<Grid2X2 class="w-4 h-4" />
						</button>
						<button
							class="p-2 rounded-xl transition-all {viewMode === 'list'
								? 'bg-white shadow-md text-brand border border-slate-100'
								: 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}"
							onclick={() => (viewMode = "list")}
						>
							<List class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<!-- Status Chips -->
			<div class="flex flex-wrap items-center gap-2">
				{#each [{ label: "All files", value: "all" }, { label: "Attached", value: "attached" }, { label: "Orphaned", value: "orphan", isAlert: true }, { label: "Uploaded today", value: "today" }] as status}
					<button
						class="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all border {filterStatus ===
						status.value
							? status.isAlert
								? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-100'
								: 'bg-brand/10 border-brand/20 text-brand shadow-sm shadow-brand/10'
							: 'bg-white border-slate-200 text-slate-400 hover:border-brand/40 hover:text-brand'}"
						onclick={() => (filterStatus = status.value)}
					>
						{status.label}
					</button>
				{/each}
			</div>

			<!-- Bulk Bar -->
			{#if selectedIds.size > 0}
				<div
					class="flex items-center justify-between p-4 bg-[#0C447C] rounded-2xl shadow-lg shadow-blue-200/50"
					transition:fly={{ y: 20 }}
				>
					<span class="text-sm font-bold text-white pl-2"
						>{selectedIds.size} image{selectedIds.size !== 1 ? "s" : ""} selected</span
					>
					<div class="flex items-center gap-2">
						{#if selectedIds.size === 1}
							<button
								class="h-9 px-4 text-white hover:bg-white/10 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
								onclick={() => openAttach([...selectedIds][0])}
								><Link class="w-4 h-4" />Attach</button
							>
						{/if}
						<button
							class="h-9 px-4 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
							onclick={() => deleteMedia([...selectedIds])}
							><Trash2 class="w-4 h-4" />Delete</button
						>
						<div class="w-px h-6 bg-white/20 mx-1"></div>
						<button
							class="h-9 px-4 text-white/60 hover:text-white text-xs font-medium rounded-xl transition-colors"
							onclick={() => {
								selectedIds.clear();
								selectedIds = new Set(selectedIds);
							}}>Cancel</button
						>
					</div>
				</div>
			{/if}

			<!-- Media Grid -->
			<div
				class={viewMode === "grid"
					? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
					: "flex flex-col gap-3"}
			>
				{#if paginatedMedia.length > 0}
					{#each paginatedMedia as item (item.id)}
						{@render MediaItem(item)}
					{/each}
				{:else}
					<div
						class="py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 lg:col-span-full"
					>
						<Empty
							title="No images found"
							message="Adjust filters or upload new cloud assets"
							icon={ImageIcon}
						/>
					</div>
				{/if}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div
					class="flex items-center justify-between pt-6 border-t border-slate-100 mt-2"
				>
					<span
						class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
						>Page {currentPage} of {totalPages}</span
					>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							class="w-9 h-9 border-slate-100 bg-white text-slate-500 hover:text-brand rounded-xl shadow-sm"
							disabled={currentPage === 1}
							onclick={() => currentPage--}
							><ChevronLeft class="w-4 h-4" /></Button
						>
						<Button
							variant="outline"
							size="icon"
							class="w-9 h-9 border-slate-100 bg-white text-slate-500 hover:text-brand rounded-xl shadow-sm"
							disabled={currentPage === totalPages}
							onclick={() => currentPage++}
							><ChevronRight class="w-4 h-4" /></Button
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Details (30%) -->
		<div class="flex flex-col gap-6 sticky top-24 w-full lg:min-w-0">
			<Card.Root
				class="border border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white"
			>
				<Card.Header
					class="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30"
				>
					<span
						class="text-[12px] font-bold text-[#141522] uppercase tracking-widest"
						>Image Details</span
					>
					{#if activeDetailId}
						<Button
							variant="ghost"
							size="icon"
							class="w-8 h-8 text-rose-500 hover:bg-rose-50"
							onclick={() => deleteMedia([activeDetailId!])}
							><Trash2 class="w-3.5 h-3.5" /></Button
						>
					{/if}
				</Card.Header>
				<Card.Content class="p-6">
					{#if activeDetail}
						<div class="flex flex-col gap-5" in:fade>
							<div
								class="aspect-video relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group"
							>
								<img
									src={activeDetail.url}
									alt={activeDetail.name}
									class="w-full h-full object-contain"
								/>
								<div
									class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
								>
									<a
										href={activeDetail.url}
										target="_blank"
										class="p-2 bg-white rounded-full text-gray-900 shadow-lg transition-transform hover:scale-110"
										><ExternalLink class="w-4 h-4" /></a
									>
								</div>
							</div>
							<div class="flex flex-col gap-3">
								{@render DetailRow({
									label: "Filename",
									value: activeDetail.name,
								})}
								{@render DetailRow({
									label: "Size",
									value: formatSize(activeDetail.size),
								})}
								{@render DetailRow({
									label: "Subject",
									value: activeDetail.subject || "Not tagged",
									isSubject: true,
								})}
								{@render DetailRow({
									label: "Uploaded",
									value: formatDate(activeDetail.uploadedAt),
								})}
								<div
									class="flex items-center justify-between py-1 border-t border-slate-50 pt-3 mt-1"
								>
									<span
										class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
										>Status</span
									>
									<Badge
										variant="outline"
										class="{activeDetail.orphan
											? 'bg-rose-50 text-rose-600 border-rose-100'
											: 'bg-emerald-50 text-emerald-600 border-emerald-100'} text-[10px] font-bold px-2 py-0"
										>{activeDetail.orphan ? "Orphaned" : "Healthy"}</Badge
									>
								</div>
							</div>
							<Button
								class="w-full mt-2 bg-brand hover:bg-brand-dark text-white font-bold text-[13px] shadow-lg shadow-brand/10 rounded-xl h-11"
								onclick={() => openAttach(activeDetail!.id)}
							>
								<Link class="w-4 h-4 mr-2" />Attach to Question
							</Button>
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-16 gap-3">
							<div
								class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"
							>
								<ImageIcon class="w-5 h-5" />
							</div>
							<p
								class="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center leading-relaxed"
							>
								Select an image<br />to see metadata
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root
				class="border border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white"
			>
				<Card.Header class="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
					<div class="flex items-center justify-between">
						<span
							class="text-[12px] font-bold text-[#141522] uppercase tracking-widest"
							>R2 Storage</span
						><Badge
							class="bg-blue-50 text-blue-600 border-none px-2 text-[9px] font-bold"
							>ACTIVE</Badge
						>
					</div>
				</Card.Header>
				<Card.Content class="p-6">
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-1.5">
							<div class="flex justify-between items-baseline">
								<span
									class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
									>Capacity</span
								><span class="text-sm font-bold text-[#141522]"
									>{formatSize(storageUsed)}</span
								>
							</div>
							<Progress
								value={storagePercentage}
								class="h-2 rounded-full bg-slate-100"
							/>
						</div>
						<div class="space-y-3 pt-2">
							<span
								class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
								>File Types</span
							>
							<div class="space-y-4">
								{#each typeBreakdown as { type, count, pct }}
									<div class="space-y-1.5">
										<div
											class="flex justify-between items-center text-[11px] font-bold"
										>
											<span class="text-slate-500 uppercase tracking-tight"
												>.{type}</span
											><span class="text-[#141522]">{count} files</span>
										</div>
										<Progress
											value={pct}
											class="h-1 rounded-full bg-slate-50 overflow-hidden"
										/>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</main>

<!-- Modal -->
<Dialog.Root bind:open={showAttachModal}>
	<Dialog.Content
		class="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl"
	>
		<div
			class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10"
		>
			<Dialog.Title class="text-[16px] font-bold text-[#141522]"
				>Attach to Question</Dialog.Title
			>
			<button
				class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
				onclick={() => (showAttachModal = false)}><X class="w-4 h-4" /></button
			>
		</div>
		<div class="px-6 py-6 flex flex-col gap-5">
			{#if attachingId}
				{@const m = media.find((x) => x.id === attachingId)}
				<div
					class="p-3 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100"
				>
					<div
						class="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 shrink-0"
					>
						<img
							src={m?.url}
							alt={m?.name || "Preview"}
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="flex flex-col min-w-0">
						<span class="text-xs font-bold text-slate-700 truncate"
							>{m?.name}</span
						><span class="text-[10px] text-slate-400 tracking-tight"
							>{m?.type.toUpperCase()} • {formatSize(m?.size || 0)}</span
						>
					</div>
				</div>
			{/if}
			<div class="space-y-2">
				<label
					for="search-questions"
					class="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1"
					>Search Questions</label
				>
				<div class="relative group">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors"
					/>
					<Input
						id="search-questions"
						placeholder="Question text or subject..."
						class="pl-10 bg-slate-50 border-slate-100 focus:bg-white h-11 rounded-xl"
						bind:value={attachSearch}
					/>
				</div>
			</div>
			<div
				class="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1"
			>
				{#each questions.filter((q) => !attachSearch || q.text
							.toLowerCase()
							.includes(attachSearch.toLowerCase()) || q.subject
							.toLowerCase()
							.includes(attachSearch.toLowerCase())) as q (q.id)}
					<button
						class="text-left p-3 rounded-xl border transition-all duration-200 group {attachingQuestionId ===
						q.id
							? 'bg-brand/5 border-brand/20 shadow-sm'
							: 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}"
						onclick={() => (attachingQuestionId = q.id)}
					>
						<div class="flex gap-3">
							<div class="mt-0.5">
								<div
									class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors {attachingQuestionId ===
									q.id
										? 'border-brand bg-brand text-white'
										: 'border-slate-200'}"
								>
									{#if attachingQuestionId === q.id}<Check
											class="w-2.5 h-2.5"
										/>{/if}
								</div>
							</div>
							<div class="flex flex-col gap-1 min-w-0">
								<p
									class="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug"
								>
									{q.text}
								</p>
								<Badge
									variant="secondary"
									class="w-fit text-[9px] font-bold bg-white text-slate-500 border-none px-1.5 py-0"
									>#{q.subject}</Badge
								>
							</div>
						</div>
					</button>
				{/each}
			</div>
			<div class="pt-2 flex gap-3 mt-1">
				<Button
					variant="outline"
					class="flex-1 rounded-xl border-slate-200 font-bold h-11"
					onclick={() => (showAttachModal = false)}>Cancel</Button
				>
				<Button
					class="flex-1 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold shadow-lg shadow-brand/20 h-11"
					disabled={!attachingQuestionId}
					onclick={confirmAttach}>Attach Image</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Shared Confirmation Modal -->
<Confirmation
	bind:open={confirmOpen}
	title={confirmState.title}
	description={confirmState.description}
	confirmText={confirmState.confirmText}
	confirmBtnClass={confirmState.confirmBtnClass}
	icon={Trash2}
	onConfirm={confirmState.onConfirm}
/>

<style>
	:global(.bg-brand) {
		background-color: oklch(0.61 0.11 222);
	}
	:global(.bg-brand-muted) {
		background-color: oklch(0.61 0.11 222 / 0.1);
	}
	:global(.text-brand) {
		color: oklch(0.61 0.11 222);
	}
	:global(.border-brand) {
		border-color: oklch(0.61 0.11 222);
	}
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #cbd5e1;
	}
</style>
