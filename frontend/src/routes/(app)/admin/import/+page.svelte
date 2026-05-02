<script lang="ts">
	import {
		UploadCloud,
		FileSpreadsheet,
		FileText,
		CheckCircle2,
		AlertCircle,
		ArrowRight,
		Trash2,
		CreditCard,
		History,
		Bell,
		RotateCcw,
		Zap,
		ClipboardList,
		FileUp,
		Info,
		Check,
		X,
		Layers,
		FilePenLine,
		MessageSquareText,
		Type,
		CircleDashed,
		BookOpen,
		GraduationCap,
		Star,
		Clock,
		Calendar,
		Hash,
		Trophy,
		Plus,
	} from "@lucide/svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import { toast } from "svelte-sonner";
	import { fade, fly, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import Empty from "$lib/components/Empty.svelte";

	let { data } = $props();

	// --- Constants (Derived from server data) ---
	let colDefs = $derived(data.colDefs);

	// --- Local Constants ---
	const colIconMap: Record<string, any> = {
		question: MessageSquareText,
		type: Type,
		opt_a: CircleDashed,
		opt_b: CircleDashed,
		opt_c: CircleDashed,
		opt_d: CircleDashed,
		correct: CheckCircle2,
		subject: BookOpen,
		exam: GraduationCap,
		difficulty: Zap,
		marks: Star,
		time_secs: Clock,
		year: Calendar,
		explanation: Info,
		credit_cost: CreditCard,
		bulk: Layers,
	};

	// --- State ---
	let currentStep = $state(1); // 1: Upload, 2: Map, 3: Validate, 4: Preview, 5: Finish
	let parsedRows = $state<any[]>([]);
	let fileHeaders = $state<string[]>([]);
	let fileName = $state("");
	let fileSize = $state(0);
	let fileRowsCount = $state(0);
	let columnMap = $state<Record<string, string>>({});
	let validationResults = $state({
		valid: [] as any[],
		errors: [] as any[],
		warnings: [] as any[],
		duplicates: [] as any[],
	});

	let importProgressValue = $state(0);
	let isImporting = $state(false);
	let defaultSubjectId = $state("");
	let defaultExamId = $state("");
	let defaultDifficulty = $state("Medium");

	// Results from the real API call
	let importedCount = $state(0);
	let importErrors = $state<{ row: number; error: string }[]>([]);

	let importHistory = $state<any[]>([]);

	let subjectsList = $state(data.subjects || []);
	let showAddSubjectModal = $state(false);
	let newSubName = $state("");
	let newSubExamId = $state("");
	let isSavingSub = $state(false);

	let subExistsLocally = $derived(
		subjectsList.some((s: any) => s.name.toLowerCase() === newSubName.toLowerCase().trim())
	);

	async function quickAddSubject() {
		if (!newSubName.trim() || !newSubExamId) {
			toast.error("Please provide both name and exam");
			return;
		}
		if (subExistsLocally) {
			const match = subjectsList.find((s: any) => s.name.toLowerCase() === newSubName.toLowerCase().trim());
			toast.error(`Course already exists as "${match.name}"`);
			return;
		}

		isSavingSub = true;
		try {
			const res = await fetch("/api/admin/subjects", {
				method: "POST",
				body: JSON.stringify({ name: newSubName.trim(), examId: newSubExamId }),
				headers: { "Content-Type": "application/json" }
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to create course");

			// Update local list
			subjectsList = [...subjectsList, json.data];
			defaultSubjectId = json.data.id;
			showAddSubjectModal = false;
			newSubName = "";
			toast.success(`Course "${json.data.name}" added successfully`);
		} catch (e: any) {
			toast.error(e.message);
		} finally {
			isSavingSub = false;
		}
	}
	
	function downloadTemplate(type: string) {
		const headers = colDefs.map((d: any) => d.key);
		let rows: string[][] = [];

		if (type === 'full') {
			rows = [
				headers,
				['What is the capital of France?', 'MCQ', 'Paris', 'London', 'Berlin', 'Madrid', 'A', 'Geography', 'JAMB', '2023', 'Paris is the capital of France.', '1'],
				['The earth is flat.', 'TF', '', '', '', '', 'False', 'Geography', 'JAMB', '2023', 'The earth is a sphere.', '1']
			];
		} else if (type === 'mcq') {
			rows = [
				['question', 'type', 'opt_a', 'opt_b', 'opt_c', 'opt_d', 'correct', 'subject'],
				['Example question?', 'MCQ', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'Biology']
			];
		} else if (type === 'tf') {
			rows = [
				['question', 'type', 'correct', 'subject'],
				['Example True/False question?', 'TF', 'True', 'Physics']
			];
		} else if (type === 'theory') {
			rows = [
				['question', 'type', 'explanation', 'subject'],
				['Explain the theory of relativity.', 'THEORY', 'The explanation goes here...', 'Physics']
			];
		}

		const csvContent = rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `mockcenter_${type}_template.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`${type.toUpperCase()} template downloaded`);
	}

	// --- Actions ---
	function mainAction() {
		if (currentStep === 1 && parsedRows.length > 0) currentStep = 2;
		else if (currentStep === 2) runValidation();
		else if (currentStep === 3) currentStep = 4;
		else if (currentStep === 4) startImport();
		else if (currentStep === 5) resetWizard();
	}

	function resetWizard() {
		currentStep = 1;
		parsedRows = [];
		fileHeaders = [];
		columnMap = {};
		fileName = "";
	}

	function removeFile() {
		parsedRows = [];
		fileHeaders = [];
		columnMap = {};
		fileName = "";
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		const file = input.files[0];
		fileName = file.name;
		fileSize = file.size;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const lines = text.split(/\r?\n/).filter((line) => line.trim());
			if (lines.length < 2) {
				toast.error("File is empty or has no data.");
				return;
			}

			// Simple CSV parsing
			const parseCSV = (line: string) => {
				const result = [];
				let cell = "";
				let inQuotes = false;
				for (let i = 0; i < line.length; i++) {
					const char = line[i];
					if (char === '"') inQuotes = !inQuotes;
					else if (char === "," && !inQuotes) {
						result.push(cell.trim());
						cell = "";
					} else {
						cell += char;
					}
				}
				result.push(cell.trim());
				return result;
			};

			fileHeaders = parseCSV(lines[0]);
			parsedRows = lines
				.slice(1)
				.map((line) => {
					const values = parseCSV(line);
					const row: any = {};
					fileHeaders.forEach((h, i) => {
						row[h] = values[i] || "";
					});
					return row;
				})
				.filter((r) => Object.values(r).some((v) => v));

			fileRowsCount = parsedRows.length;
			autoMap();
			toast.success(`File loaded: ${fileRowsCount} rows detected`);
		};
		reader.readAsText(file);
	}

	function autoMap() {
		const aliases: Record<string, string[]> = {
			question: ["question", "q", "question_text", "text", "stem"],
			type: ["type", "question_type", "qtype"],
			opt_a: ["opt_a", "option_a", "a", "opta", "choice_a"],
			opt_b: ["opt_b", "option_b", "b", "optb", "choice_b"],
			opt_c: ["opt_c", "option_c", "c", "optc", "choice_c"],
			opt_d: ["opt_d", "option_d", "d", "optd", "choice_d"],
			correct: ["correct", "answer", "correct_answer", "ans"],
			subject: ["subject", "sub", "topic", "category"],
			exam: ["exam", "exam_type", "examtype"],
			difficulty: ["difficulty", "diff", "level"],
			marks: ["marks", "mark", "score", "points"],
			time_secs: ["time_secs", "time", "duration", "seconds"],
			year: ["year", "exam_year"],
			explanation: ["explanation", "explain", "rationale", "reason"],
		};

		const newMap: Record<string, string> = {};
		fileHeaders.forEach((header) => {
			const lowered = header.toLowerCase().replace(/[^a-z0-9]/g, "_");
			for (const [key, alts] of Object.entries(aliases)) {
				if (alts.includes(lowered)) {
					newMap[header] = key;
					break;
				}
			}
		});
		columnMap = newMap;
	}

	function runValidation() {
		const errors: any[] = [];
		const warnings: any[] = [];
		const duplicates: any[] = [];
		const valid: any[] = [];

		parsedRows.forEach((row, i) => {
			const dataRow: Record<string, string> = {};
			Object.entries(columnMap).forEach(([header, internalKey]) => {
				if (internalKey) dataRow[internalKey] = row[header];
			});

			const q = (dataRow.question || "").trim();
			const ans = (dataRow.correct || "").trim();

			if (!q) {
				errors.push({
					row: i + 2,
					msg: `Row ${i + 2}: Missing question text`,
					type: "error",
				});
				return;
			}
			if (!ans) {
				errors.push({
					row: i + 2,
					msg: `Row ${i + 2}: Missing correct answer`,
					type: "error",
				});
				return;
			}

			let isDup = false;
			if (
				data.existingQuestions?.some((eq: string) =>
					q.toLowerCase().startsWith(eq.toLowerCase().substring(0, 30)),
				)
			) {
				isDup = true;
				duplicates.push({
					row: i + 2,
					msg: `Row ${i + 2}: Possible duplicate — "${q.slice(0, 50)}…"`,
					type: "dup",
				});
			}

			const subName = (dataRow.subject || "").trim();
			const examName = (dataRow.exam || "").trim();

			if (subName) {
				const match = subjectsList.find((s: any) => s.name.toLowerCase() === subName.toLowerCase());
				if (match && match.name !== subName) {
					errors.push({
						row: i + 2,
						msg: `Row ${i + 2}: Course "${subName}" already exists as "${match.name}". Please fix the casing in your file.`,
						type: "error",
					});
					return;
				}
			}

			if (examName) {
				const match = data.exams?.find((e: any) => e.name.toLowerCase() === examName.toLowerCase());
				if (match && match.name !== examName) {
					errors.push({
						row: i + 2,
						msg: `Row ${i + 2}: Exam "${examName}" already exists as "${match.name}". Please fix the casing in your file.`,
						type: "error",
					});
					return;
				}
			}

			const diff = dataRow.difficulty || defaultDifficulty;
			let isWarn = false;
			if (diff && !["Easy", "Medium", "Hard"].includes(diff)) {
				isWarn = true;
				warnings.push({
					row: i + 2,
					msg: `Row ${i + 2}: Unknown difficulty "${diff}" — will default to Medium`,
					type: "warn",
				});
			}

			valid.push({ rowNum: i + 2, data: dataRow, isDup, isWarn });
		});

		validationResults = { valid, errors, warnings, duplicates };
		currentStep = 3;
	}

	async function startImport() {
		if (!defaultSubjectId || !defaultExamId) {
			toast.error('Please go back and select a Default Subject and Default Exam before importing.');
			return;
		}

		currentStep = 5;
		isImporting = true;
		importProgressValue = 0;

		// Animate progress while waiting for the real API response
		const progressInterval = setInterval(() => {
			if (importProgressValue < 88) importProgressValue = Math.min(88, importProgressValue + 3);
		}, 180);

		try {
			// Build rows from validated data — each row.data already has the mapped column keys
			const rows = validationResults.valid.map((v) => v.data);

			const formData = new FormData();
			formData.set('rows', JSON.stringify(rows));
			formData.set('defaultSubjectId', defaultSubjectId);
			formData.set('defaultExamId', defaultExamId);

			const res = await fetch('?/importCsv', {
				method: 'POST',
				body: formData,
				headers: {
					// Required for SvelteKit to return JSON instead of an HTML redirect
					'x-sveltekit-action': 'true',
					'accept': 'application/json',
				},
			});

			clearInterval(progressInterval);

			const json = await res.json();

			// SvelteKit action failure: { type: 'failure', status, data: { error } }
			// SvelteKit action success: { type: 'success', status, data: { inserted, errors } }
			if (!res.ok || json.type === 'failure') {
				const errMsg =
					json?.data?.error ??
					json?.error ??
					`Server error (${res.status}). Please try again.`;
				toast.error(errMsg);
				isImporting = false;
				currentStep = 4;
				return;
			}

			importProgressValue = 100;

			// Unwrap the SvelteKit action data envelope
			const actionData = json?.data ?? json;
			const inserted: number = actionData?.inserted ?? validationResults.valid.length;
			const backendErrors: { row: number; error: string }[] = actionData?.errors ?? [];

			importedCount = inserted;
			importErrors = backendErrors;

			importHistory = [
				{
					date: new Date(),
					fileName,
					total: inserted,
					errors: backendErrors.length,
				},
				...importHistory,
			];

			if (backendErrors.length > 0) {
				toast.warning(`${inserted} questions saved. ${backendErrors.length} rows had errors.`);
			} else {
				toast.success(`${inserted} questions saved to database ✓`);
			}
		} catch (e) {
			clearInterval(progressInterval);
			console.error('[Import Error]', e);
			toast.error('Network error during import. Check your connection and try again.');
			isImporting = false;
			currentStep = 4;
		} finally {
			isImporting = false;
		}
	}

	function rollback() {
		if (
			!confirm(
				"Roll back this import? This will remove all questions added in this session.",
			)
		)
			return;
		toast.info("Import rolled back");
		resetWizard();
	}

	function formatBytes(bytes: number) {
		if (bytes < 1024) return bytes + " B";
		else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
		else return (bytes / 1048576).toFixed(1) + " MB";
	}

	let mainBtnText = $derived(
		currentStep === 1
			? "Next →"
			: currentStep === 2
				? "Validate →"
				: currentStep === 3
					? "Preview →"
					: currentStep === 4
						? `⬆ Import ${validationResults.valid.length} questions`
						: "Done",
	);

	let isMainBtnDisabled = $derived(
		(currentStep === 1 && parsedRows.length === 0) ||
		(currentStep === 2 && (!defaultSubjectId || !defaultExamId)),
	);
</script>

<main class="max-w-[1280px] mx-auto pb-10 px-8">
	<!-- STEPS INDICATOR -->
	<div class="mt-2"></div>
	<div class="flex items-center max-w-4xl mx-auto mb-6 relative px-4">
		<!-- Connecting Line Track -->
		<div
			class="absolute top-[18px] left-12 right-12 h-px bg-gray-100 -z-0"
		></div>

		{#each [{ i: 1, label: "Upload file" }, { i: 2, label: "Map columns" }, { i: 3, label: "Validate" }, { i: 4, label: "Preview" }, { i: 5, label: "Import", isDone: currentStep === 5 }] as step}
			<div class="flex-1 flex flex-col items-center">
				<div
					class="w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white text-[13px] font-normal transition-all mb-2 shadow-sm relative z-0
					{currentStep === step.i
						? 'border-brand text-brand scale-110 shadow-md ring-4 ring-brand/5'
						: currentStep > step.i || step.isDone
							? 'border-brand bg-brand text-white'
							: 'border-gray-100 text-gray-300'}"
				>
					{#if currentStep > step.i || step.isDone}
						<Check size={16} strokeWidth={3} />
					{:else}
						{step.i}
					{/if}
				</div>
				<span
					class="text-[10px] font-bold uppercase tracking-wider
					{currentStep === step.i ? 'text-brand' : 'text-gray-400'}"
				>
					{step.label}
				</span>
			</div>
		{/each}
	</div>

	<!-- GRID LAYOUT -->
	<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
		<!-- WIZARD AREA -->
		<div class="flex flex-col gap-4">
			{#if currentStep === 1}
				<div
					class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all"
					in:fade={{ duration: 200 }}
				>
					<div
						class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white"
					>
						<span class="text-[14px] font-bold text-gray-800"
							>Upload your file</span
						>
						<Badge
							variant="outline"
							class="bg-[#FAEEDA] text-[#854F0B] border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
						>
							Step 1 of 5
						</Badge>
					</div>

					<div class="p-5 flex flex-col">
						{#if !fileName}
							<div
								class="border-2 border-dashed border-gray-200 rounded-xl py-6 px-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-brand/5 hover:border-brand/40 transition-colors cursor-pointer relative group"
							>
								<input
									type="file"
									class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
									accept=".csv,.xlsx,.xls"
									onchange={handleFileUpload}
								/>
								<div
									class="w-14 h-14 rounded-xl flex items-center justify-center text-slate-300 mb-3 group-hover:text-brand transition-colors"
								>
									<FileUp size={40} strokeWidth={1} />
								</div>
								<h3
									class="text-[15px] font-bold text-gray-800 tracking-tight mb-1"
								>
									Drop your CSV or Excel file here
								</h3>
								<p class="text-[12px] text-gray-400 mb-4">
									or click to browse from your computer
								</p>

								<div class="flex gap-2 justify-center">
									<span
										class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-500"
										>.csv</span
									>
									<span
										class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-500"
										>.xlsx</span
									>
									<span
										class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-500"
										>.xls</span
									>
									<span
										class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-500"
										>max 500 rows</span
									>
									<span
										class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-500"
										>UTF-8</span
									>
								</div>
							</div>
						{:else}
							<div
								class="flex items-center gap-4 p-4 bg-brand/10 border border-brand/20 rounded-xl mb-6"
							>
								<div class="text-3xl">📄</div>
								<div class="flex-1">
									<div class="text-[14px] font-bold text-brand truncate">
										{fileName}
									</div>
									<div class="text-[12px] text-brand/60 mt-0.5 font-medium">
										{fileRowsCount} data rows · {formatBytes(fileSize)} · {fileHeaders.length}
										columns
									</div>
								</div>
								<button
									onclick={removeFile}
									class="px-3 py-1.5 bg-[#FCEBEB] text-[#A32D2D] border border-[#f3c2c2] hover:bg-[#A32D2D] hover:text-white rounded-lg text-[11px] font-bold transition-colors"
								>
									Remove
								</button>
							</div>
						{/if}

						<div class="my-4 h-px bg-gray-100"></div>

						<h4 class="text-[13px] font-bold text-gray-900 mb-3">
							Or start from a template:
						</h4>
						<div class="grid grid-cols-2 gap-4">
							<div
								onclick={() => downloadTemplate('full')}
								class="p-3.5 border border-gray-200 rounded-xl hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-colors group"
							>
								<div
									class="text-brand mb-3 opacity-60 group-hover:opacity-100 transition-all"
								>
									<ClipboardList size={28} strokeWidth={1} />
								</div>
								<h5
									class="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-brand"
								>
									Full template (all fields)
								</h5>
								<p class="text-[11px] text-gray-500 leading-tight">
									All supported columns including optional fields like
									explanation and year
								</p>
							</div>
							<div
								onclick={() => downloadTemplate('mcq')}
								class="p-3.5 border border-gray-200 rounded-xl hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-colors group"
							>
								<div
									class="text-brand mb-3 opacity-60 group-hover:opacity-100 transition-all"
								>
									<Zap size={28} strokeWidth={1} />
								</div>
								<h5
									class="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-brand"
								>
									Simple MCQ template
								</h5>
								<p class="text-[11px] text-gray-500 leading-tight">
									Minimal required columns for quickly adding MCQ questions
								</p>
							</div>
							<div
								onclick={() => downloadTemplate('tf')}
								class="p-3.5 border border-gray-200 rounded-xl hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-colors group"
							>
								<div
									class="text-brand mb-3 opacity-60 group-hover:opacity-100 transition-all"
								>
									<Check size={28} strokeWidth={1} />
								</div>
								<h5
									class="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-brand"
								>
									True / False template
								</h5>
								<p class="text-[11px] text-gray-500 leading-tight">
									Optimised for bulk True/False question import
								</p>
							</div>
							<div
								onclick={() => downloadTemplate('theory')}
								class="p-3.5 border border-gray-200 rounded-xl hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-colors group"
							>
								<div
									class="text-brand mb-3 opacity-60 group-hover:opacity-100 transition-all"
								>
									<FilePenLine size={28} strokeWidth={1} />
								</div>
								<h5
									class="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-brand"
								>
									Theory / Essay template
								</h5>
								<p class="text-[11px] text-gray-500 leading-tight">
									Includes marking scheme and model answer columns
								</p>
							</div>
						</div>

						<!-- STEP FOOTER ACTIONS -->
						<div
							class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between"
						>
							<button
								onclick={resetWizard}
								class="px-5 py-2 text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2"
							>
								<RotateCcw class="w-3.5 h-3.5" strokeWidth={1} /> Start over
							</button>
							<button
								onclick={mainAction}
								disabled={isMainBtnDisabled}
								class="px-8 py-2.5 text-[13px] font-bold text-white bg-brand border border-brand/20 rounded-lg shadow-sm transition-all hover:bg-brand-dark hover:shadow-md disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{mainBtnText}
							</button>
						</div>
					</div>
				</div>
			{:else if currentStep === 2}
				<div
					class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all"
					in:fly={{ x: 15, duration: 300 }}
				>
					<div
						class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white"
					>
						<span class="text-[14px] font-bold text-gray-800"
							>Map your columns</span
						>
						<Badge
							variant="outline"
							class="bg-[#FAEEDA] text-[#854F0B] border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
							>Step 2 of 5</Badge
						>
					</div>
					<div class="p-5">
						<div
							class="bg-[#E6F1FB] text-[#185FA5] text-[12px] font-medium p-3 rounded-xl mb-4 border border-[#c4e0fa]"
						>
							Match your file's columns with our internal database fields to
							ensure data integrity.
						</div>

						<div class="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
							{#each fileHeaders as header}
								<div
									class="flex items-center justify-between py-2 border-b border-gray-50"
								>
									<div class="flex flex-col">
										<span
											class="text-[13px] font-bold text-gray-800 truncate max-w-[150px]"
											>{header}</span
										>
										<span class="text-[10px] text-gray-400 font-medium"
											>from file</span
										>
									</div>
									<ArrowRight size={14} class="text-gray-300" />
									<select
										bind:value={columnMap[header]}
										class="w-[180px] text-[12px] font-semibold rounded-lg px-3 py-2 border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand/40 cursor-pointer"
									>
										<option value="">— Ignore —</option>
										{#each colDefs as def}
											<option value={def.key} class="capitalize"
												>{def.label} {def.required ? "*" : ""}</option
											>
										{/each}
									</select>
								</div>
							{/each}
						</div>

						<div
							class="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4"
						>
							<!-- Default Subject (required by API) -->
							<div class="flex flex-col gap-2">
								<div class="flex items-center justify-between">
									<label
										for="defSubject"
										class="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
										>Default Course <span class="text-red-500">*</span></label
									>
									<button 
										onclick={() => showAddSubjectModal = true}
										class="text-[10px] font-bold text-brand hover:underline flex items-center gap-1"
									>
										<Plus size={10} /> New Course
									</button>
								</div>
								<select
									id="defSubject"
									bind:value={defaultSubjectId}
									class="w-full text-[12px] font-semibold rounded-lg px-3 py-2 border {!defaultSubjectId ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-gray-50'} text-gray-800 focus:outline-none focus:border-brand/40"
								>
									<option value="">— Select a course —</option>
									{#each subjectsList ?? [] as s}
										<option value={s.id}>{s.name}</option>
									{/each}
								</select>
							</div>
							<!-- Default Exam (required by API) -->
							<div class="flex flex-col gap-2">
								<label
									for="defExam"
									class="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
									>Default Exam <span class="text-red-500">*</span></label
								>
								<select
									id="defExam"
									bind:value={defaultExamId}
									class="w-full text-[12px] font-semibold rounded-lg px-3 py-2 border {!defaultExamId ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-gray-50'} text-gray-800 focus:outline-none focus:border-brand/40"
								>
									<option value="">— Select an exam —</option>
									{#each data.exams ?? [] as e}
										<option value={e.id}>{e.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<!-- STEP FOOTER ACTIONS -->
						<div
							class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between"
						>
							<button
								onclick={resetWizard}
								class="px-5 py-2 text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2"
							>
								<RotateCcw class="w-3.5 h-3.5" /> Start over
							</button>
							<button
								onclick={mainAction}
								disabled={isMainBtnDisabled}
								class="px-8 py-2.5 text-[13px] font-bold text-white bg-brand border border-brand/20 rounded-lg shadow-sm transition-all hover:bg-brand-dark hover:shadow-md disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{mainBtnText}
							</button>
						</div>
					</div>
				</div>
			{:else if currentStep === 3}
				<div
					class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all"
					in:fly={{ x: 15, duration: 300 }}
				>
					<div
						class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white"
					>
						<span class="text-[14px] font-bold text-gray-800"
							>Validation report</span
						>
						<Badge
							variant="outline"
							class="bg-[#FAEEDA] text-[#854F0B] border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
							>Step 3 of 5</Badge
						>
					</div>
					<div class="p-5 flex flex-col items-center">
						<div class="grid grid-cols-4 gap-3 w-full mb-5">
							<div
								class="bg-brand/10 rounded-xl p-4 text-center border border-brand/20"
							>
								<div class="flex justify-center mb-1 text-brand">
									<Check size={18} strokeWidth={1} />
								</div>
								<div class="text-[20px] font-bold text-brand leading-none mb-1">
									{validationResults.valid.length}
								</div>
								<div
									class="text-[10px] font-bold text-brand uppercase tracking-tight"
								>
									Valid rows
								</div>
							</div>
							<div
								class="bg-[#FCEBEB] rounded-xl p-4 text-center border border-[#f3c2c2]"
							>
								<div class="flex justify-center mb-1 text-[#A32D2D]">
									<X size={18} strokeWidth={1} />
								</div>
								<div
									class="text-[20px] font-bold text-[#A32D2D] leading-none mb-1"
								>
									{validationResults.errors.length}
								</div>
								<div
									class="text-[10px] font-bold text-[#A32D2D] uppercase tracking-tight"
								>
									Errors
								</div>
							</div>
							<div
								class="bg-[#FEF3C7] rounded-xl p-4 text-center border border-[#FDE68A]"
							>
								<div class="flex justify-center mb-1 text-[#92400E]">
									<AlertCircle size={18} strokeWidth={1} />
								</div>
								<div
									class="text-[20px] font-bold text-[#92400E] leading-none mb-1"
								>
									{validationResults.warnings.length}
								</div>
								<div
									class="text-[10px] font-bold text-[#92400E] uppercase tracking-tight"
								>
									Warnings
								</div>
							</div>
							<div
								class="bg-slate-100 rounded-xl p-4 text-center border border-slate-200"
							>
								<div class="flex justify-center mb-1 text-slate-400">
									<History size={18} strokeWidth={1} />
								</div>
								<div
									class="text-[20px] font-bold text-slate-500 leading-none mb-1"
								>
									{validationResults.duplicates.length}
								</div>
								<div
									class="text-[10px] font-bold text-slate-400 uppercase tracking-tight"
								>
									Duplicates
								</div>
							</div>
						</div>

						<div
							class="w-full bg-slate-50 border border-gray-100 rounded-xl overflow-hidden mb-6"
						>
							<div class="max-h-[300px] overflow-y-auto custom-scrollbar">
								<table class="w-full text-left text-[11px] border-collapse">
									<thead
										class="sticky top-0 bg-slate-100 border-b border-gray-200"
									>
										<tr
											class="font-bold text-slate-500 uppercase tracking-widest"
										>
											<th class="p-3">Row</th>
											<th class="p-3">Message</th>
											<th class="p-3">Type</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-100">
										{#each [...validationResults.errors, ...validationResults.warnings, ...validationResults.duplicates] as alert}
											<tr class="bg-white">
												<td class="p-3 font-bold text-gray-400">{alert.row}</td>
												<td class="p-3 font-medium text-gray-700"
													>{alert.msg}</td
												>
												<td class="p-3">
													<span
														class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase
														{alert.type === 'error'
															? 'bg-red-50 text-red-600'
															: alert.type === 'warn'
																? 'bg-amber-50 text-amber-600'
																: 'bg-slate-50 text-slate-600'}"
													>
														{alert.type}
													</span>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<!-- STEP FOOTER ACTIONS -->
						<div
							class="mt-4 pt-6 w-full border-t border-gray-100 flex items-center justify-between"
						>
							<button
								onclick={() => (currentStep = 2)}
								class="px-5 py-2 text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2"
							>
								<RotateCcw class="w-3.5 h-3.5" /> Back
							</button>
							<button
								onclick={mainAction}
								class="px-8 py-2.5 text-[13px] font-bold text-white bg-brand border border-brand/20 rounded-lg shadow-sm"
							>
								{mainBtnText}
							</button>
						</div>
					</div>
				</div>
			{:else if currentStep === 4}
				<div
					class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all"
					in:fly={{ x: 15, duration: 300 }}
				>
					<div
						class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white"
					>
						<span class="text-[14px] font-bold text-gray-800"
							>Final Preview</span
						>
						<div class="flex items-center gap-2">
							<Badge
								variant="outline"
								class="bg-blue-50 text-blue-600 border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
								>{validationResults.valid.length} rows</Badge
							>
							<Badge
								variant="outline"
								class="bg-[#FAEEDA] text-[#854F0B] border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
								>Step 4 of 5</Badge
							>
						</div>
					</div>
					<div class="p-5">
						<div
							class="w-full bg-slate-50 border border-gray-100 rounded-xl overflow-hidden mb-6"
						>
							<div class="max-h-[400px] overflow-y-auto custom-scrollbar">
								<table class="w-full text-left text-[11px] border-collapse">
									<thead
										class="sticky top-0 bg-slate-100 border-b border-gray-200"
									>
										<tr
											class="font-bold text-slate-500 uppercase tracking-widest"
										>
											{#each Object.values(columnMap).filter((v) => v) as key}
												<th class="p-3 whitespace-nowrap">{key}</th>
											{/each}
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-100">
										{#each validationResults.valid.slice(0, 50) as row}
											<tr class="bg-white hover:bg-brand/5 transition-colors">
												{#each Object.values(columnMap).filter((v) => v) as key}
													<td
														class="p-3 max-w-[200px] truncate font-medium text-gray-700"
														>{row.data[key]}</td
													>
												{/each}
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<div
							class="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 flex items-start gap-3"
						>
							<Info class="w-4 h-4 mt-0.5 shrink-0" />
							<p class="text-[12px] font-medium leading-relaxed">
								You are about to import <span class="font-bold"
									>{validationResults.valid.length}</span
								> questions. Make sure all columns were mapped correctly. Duplicates
								and rows with errors will be skipped.
							</p>
						</div>

						<!-- STEP FOOTER ACTIONS -->
						<div
							class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between"
						>
							<button
								onclick={() => (currentStep = 3)}
								class="px-5 py-2 text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2"
							>
								<ArrowRight size={14} class="rotate-180" /> Back
							</button>
							<button
								onclick={mainAction}
								class="px-8 py-2.5 text-[13px] font-bold text-white bg-brand border border-brand/20 rounded-lg shadow-sm hover:bg-brand-dark transition-all"
							>
								{mainBtnText}
							</button>
						</div>
					</div>
				</div>
			{:else if currentStep === 5}
				<div
					class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all"
					in:fly={{ y: 20, duration: 400 }}
				>
					<div
						class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white"
					>
						<span class="text-[14px] font-bold text-gray-800">Importing...</span
						>
						<Badge
							variant="outline"
							class="bg-[#FAEEDA] text-[#854F0B] border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full"
							>Step 5 of 5</Badge
						>
					</div>
					<div class="p-10 flex flex-col items-center">
						{#if isImporting}
							<div class="w-full max-w-sm flex flex-col items-center gap-6">
								<div
									class="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center relative"
								>
									<div
										class="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"
									></div>
									<UploadCloud class="text-brand w-8 h-8" />
								</div>
								<div class="flex flex-col items-center gap-2 w-full">
									<span
										class="text-[15px] font-black text-slate-800 tracking-tight"
										>Syncing to Database</span
									>
									<span
										class="text-[12px] text-slate-400 font-bold uppercase tracking-widest"
										>{importProgressValue}% Complete</span
									>
								</div>
								<Progress
									value={importProgressValue}
									class="w-full h-2 bg-slate-100 shadow-inner"
								/>
							</div>
						{:else}
							<div
								class="flex flex-col items-center text-center animate-in zoom-in duration-500"
							>
								<div
									class="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 scale-110"
								>
									<CheckCircle2 size={40} />
								</div>
								<h2
									class="text-[22px] font-black text-slate-800 tracking-tight mb-2"
								>
									Import Successful!
								</h2>
								<p class="text-[14px] text-slate-500 font-medium mb-2 max-w-xs">
									Successfully saved <span class="text-brand font-bold"
										>{importedCount}</span
									> questions to the database.
								</p>
								{#if importErrors.length > 0}
									<div class="mb-6 w-full max-w-xs bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
										<p class="text-[11px] font-bold text-amber-700 mb-2">{importErrors.length} row(s) had errors:</p>
										<ul class="text-[11px] text-amber-600 space-y-1 list-disc list-inside">
											{#each importErrors.slice(0, 5) as e}
												<li>Row {e.row}: {e.error}</li>
											{/each}
											{#if importErrors.length > 5}<li>...and {importErrors.length - 5} more</li>{/if}
										</ul>
									</div>
								{:else}
									<p class="text-[12px] text-emerald-600 font-semibold mb-6">No errors — all rows saved cleanly ✓</p>
								{/if}

								<div class="flex gap-4">
									<button
										onclick={resetWizard}
										class="px-8 py-3 bg-brand text-white font-black text-[13px] rounded-2xl shadow-lg shadow-brand/20 hover:scale-105 transition-all"
										>Done, Back Home</button
									>
									<button
										onclick={rollback}
										class="px-6 py-3 bg-red-50 text-red-600 border border-red-100 font-bold text-[13px] rounded-2xl hover:bg-red-500 hover:text-white transition-all"
										>Rollback</button
									>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Column Reference Card -->
		<div class="flex flex-col gap-4">
			<div
				class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm sticky top-6"
			>
				<div
					class="flex items-center justify-between mb-4 border-b border-gray-200 pb-3"
				>
					<h3
						class="text-[13px] font-bold text-gray-800 uppercase tracking-tight"
					>
						Column Reference
					</h3>
					<Info class="w-4 h-4 text-brand" />
				</div>
				<p class="text-[12px] text-gray-500 mb-5 leading-relaxed font-medium">
					Available fields for import. Fields marked with <span
						class="text-red-500 font-bold">*</span
					> are required.
				</p>
				<div class="flex flex-col">
					{#each colDefs as def}
						{@const Icon = colIconMap[def.key] || Info}
						<div
							class="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0 group transition-all"
						>
							<div
								class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-brand/5 group-hover:border-brand/20 transition-all"
							>
								{#if Icon}
									<Icon
										class="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors"
									/>
								{:else}
									<Hash class="w-4 h-4 text-slate-400" />
								{/if}
							</div>
							<div class="flex flex-col grow min-w-0">
								<div class="flex items-center justify-between gap-2">
									<span
										class="text-[13px] font-bold text-slate-800 tracking-tight leading-none group-hover:text-brand transition-colors capitalize"
									>
										{def.label.toLowerCase()}
									</span>
									{#if def.required}
										<Badge
											class="bg-red-50 text-red-600 border-none text-[8px] font-black uppercase tracking-tighter h-4 px-1.5 shadow-none"
											>Required *</Badge
										>
									{/if}
								</div>
								<p
									class="text-[11px] font-medium text-slate-400 mt-1.5 truncate"
								>
									{def.values}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-8 pt-6 border-t border-gray-100">
					<h4
						class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4"
					>
						Import History
					</h4>
					{#if importHistory.length === 0}
						<div class="py-10 border-2 border-dashed border-gray-50 rounded-xl">
							<Empty
								title="No history"
								message="Your import history will appear here"
								icon={History}
								compact={true}
							/>
						</div>
					{:else}
						<div class="flex flex-col gap-4">
							{#each importHistory.slice(0, 3) as session}
								<div class="flex items-start gap-3 group">
									<div
										class="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100"
									>
										<Check size={14} />
									</div>
									<div class="flex flex-col min-w-0">
										<span class="text-[11px] font-bold text-gray-800 truncate"
											>{session.fileName}</span
										>
										<div class="flex items-center gap-2 mt-0.5">
											<Badge
												class="bg-blue-50 text-blue-600 border-none text-[8px] font-black px-1 h-3.5"
												>{session.total}</Badge
											>
											<span class="text-[9px] text-gray-400 font-bold uppercase"
												>{session.date.toLocaleDateString()}</span
											>
											{#if session.errors > 0}
												<Badge
													class="bg-red-50 text-red-600 border-none text-[8px] font-black px-1 h-3.5"
													>{session.errors}</Badge
												>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<Dialog.Root bind:open={showAddSubjectModal}>
		<Dialog.Content class="sm:max-w-[425px] rounded-2xl">
			<Dialog.Header>
				<Dialog.Title class="text-[18px] font-black tracking-tight">Add New Course</Dialog.Title>
				<Dialog.Description class="text-[13px] font-medium text-slate-500">
					Create a new course and link it to an exam. Duplicate names (case-insensitive) are flagged to prevent duplicates.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-5 py-4">
				<div class="grid gap-2">
					<Label for="name" class="text-[12px] font-bold text-slate-700">Course Name</Label>
					<Input
						id="name"
						bind:value={newSubName}
						placeholder="e.g. Physics"
						class="rounded-xl h-11 {subExistsLocally ? 'border-red-500 ring-red-50' : ''}"
					/>
					{#if subExistsLocally}
						<p class="text-[11px] font-bold text-red-500 flex items-center gap-1">
							<AlertCircle size={12} /> This course name already exists
						</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="exam" class="text-[12px] font-bold text-slate-700">Associated Exam</Label>
					<select
						id="exam"
						bind:value={newSubExamId}
						class="w-full text-[13px] font-medium rounded-xl h-11 px-3 py-2 border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
					>
						<option value="">— Select an exam —</option>
						{#each data.exams ?? [] as e}
							<option value={e.id}>{e.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<Dialog.Footer class="gap-2">
				<Button
					variant="outline"
					class="rounded-xl h-11 font-bold text-[13px]"
					onclick={() => {
						showAddSubjectModal = false;
						newSubName = "";
					}}
				>
					Cancel
				</Button>
				<Button 
					class="rounded-xl h-11 font-bold text-[13px] bg-brand hover:bg-brand-dark transition-all"
					onclick={quickAddSubject} 
					disabled={isSavingSub || !newSubName.trim() || !newSubExamId || subExistsLocally}
				>
					{#if isSavingSub}
						Adding...
					{:else}
						Add Course
					{/if}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</main>

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 4px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #e2e8f0;
		border-radius: 10px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #cbd5e1;
	}
</style>
