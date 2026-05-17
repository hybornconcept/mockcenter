<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { X, Delete, Percent, Divide, Plus, Minus, Equal, Hash, FlaskConical, ChevronRight, ChevronLeft } from "@lucide/svelte";
	import { fly, slide } from "svelte/transition";

	let { onClose }: { onClose?: () => void } = $props();

	let display = $state("0");
	let history = $state("");
	let newNumberInput = $state(true);
	let operator = $state<string | null>(null);
	let operandA = $state<number | null>(null);
	let scientificMode = $state(false);

	function updateDisplay(val: string) {
		if (newNumberInput) {
			display = val;
			newNumberInput = false;
		} else {
			display = display === "0" ? val : display + val;
		}
	}

	function handleOperator(op: string) {
		if (operator && !newNumberInput) {
			calculate();
		}
		operandA = parseFloat(display);
		operator = op;
		history = `${operandA} ${op}`;
		newNumberInput = true;
	}

	function calculate() {
		if (operator === null || operandA === null) return;

		const operandB = parseFloat(display);
		let result = 0;

		switch (operator) {
			case "+": result = operandA + operandB; break;
			case "-": result = operandA - operandB; break;
			case "*": result = operandA * operandB; break;
			case "/": result = operandB !== 0 ? operandA / operandB : 0; break;
			case "^": result = Math.pow(operandA, operandB); break;
		}

		history = `${operandA} ${operator} ${operandB} =`;
		display = Number(result.toFixed(8)).toString();
		operandA = result;
		operator = null;
		newNumberInput = true;
	}

	function clear() {
		display = "0";
		history = "";
		operandA = null;
		operator = null;
		newNumberInput = true;
	}

	function backspace() {
		if (display.length > 1) {
			display = display.slice(0, -1);
		} else {
			display = "0";
		}
	}

	function toggleSign() {
		display = (parseFloat(display) * -1).toString();
	}

	function sciFn(fn: string) {
		const val = parseFloat(display);
		let result = 0;
		const rad = (val * Math.PI) / 180;

		switch(fn) {
			case 'sin': result = Math.sin(rad); break;
			case 'cos': result = Math.cos(rad); break;
			case 'tan': result = Math.tan(rad); break;
			case 'sqrt': result = Math.sqrt(val); break;
			case 'log': result = Math.log10(val); break;
			case 'ln': result = Math.log(val); break;
			case 'pow2': result = Math.pow(val, 2); break;
			case 'pi': result = Math.PI; break;
		}

		history = `${fn}(${val}) =`;
		display = Number(result.toFixed(8)).toString();
		newNumberInput = true;
	}
</script>

<div
	class="shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200 transition-all duration-300 {scientificMode ? 'w-[520px]' : 'w-[320px]'}"
	in:fly={{ y: 20, duration: 400 }}
>
	<Card.Header class="p-4 bg-slate-900 text-white flex flex-row items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="p-1.5 rounded-lg bg-brand text-white shadow-lg shadow-brand/20">
				<Hash class="w-4 h-4" />
			</div>
			<div class="flex flex-col">
				<span class="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Tools</span>
				<span class="text-sm font-bold text-white leading-none">Calculator</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				class="h-8 px-3 gap-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all {scientificMode ? 'text-brand bg-brand/10' : ''}"
				onclick={() => scientificMode = !scientificMode}
			>
				<FlaskConical class="w-3.5 h-3.5" />
				<span class="text-[10px] font-bold uppercase tracking-wider">{scientificMode ? 'Scientific' : 'Standard'}</span>
			</Button>
			<Separator orientation="vertical" class="h-4 bg-slate-700 mx-1" />
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
				onclick={onClose}
			>
				<X class="w-4 h-4" />
			</Button>
		</div>
	</Card.Header>

	<Card.Content class="p-0">
		<!-- Display Area -->
		<div class="bg-slate-900 p-8 flex flex-col items-end justify-end gap-2 min-h-[140px] relative overflow-hidden">
			<!-- Background Glow -->
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 blur-[80px] rounded-full"></div>
			
			<span class="text-sm font-bold text-brand font-mono h-5 opacity-80 z-10">{history}</span>
			<div class="text-5xl font-black text-white font-mono tracking-tighter truncate w-full text-right overflow-hidden z-10">
				{display}
			</div>
		</div>

		<div class="flex">
			<!-- Scientific Panel -->
			{#if scientificMode}
				<div 
					class="w-[200px] p-4 bg-slate-50 border-r border-slate-100 grid grid-cols-2 gap-2"
					transition:slide={{ axis: 'x' }}
				>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('sin')}>SIN</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('cos')}>COS</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('tan')}>TAN</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('sqrt')}>&radic;</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('log')}>LOG</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('ln')}>LN</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('pow2')}>x&sup2;</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => handleOperator('^')}>x&yuml;</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => sciFn('pi')}>&pi;</Button>
					<Button variant="outline" class="h-12 font-bold text-slate-500 hover:text-brand border-slate-200 rounded-xl text-xs hover:bg-white shadow-sm" onclick={() => updateDisplay('(')}>(</Button>
				</div>
			{/if}

			<!-- Standard Grid -->
			<div class="flex-1 p-4 bg-white grid grid-cols-4 gap-2">
				<!-- Row 1 -->
				<Button variant="outline" class="h-14 font-bold text-slate-400 hover:text-brand border-slate-100 rounded-2xl text-lg hover:bg-slate-50" onclick={clear}>C</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-400 hover:text-brand border-slate-100 rounded-2xl text-lg hover:bg-slate-50" onclick={toggleSign}>+/-</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-400 hover:text-brand border-slate-100 rounded-2xl text-lg hover:bg-slate-50" onclick={() => sciFn('pi')}>&pi;</Button>
				<Button variant="outline" class="h-14 font-bold text-brand bg-brand/5 border-brand/20 rounded-2xl text-lg hover:bg-brand/10" onclick={() => handleOperator("/")}>
					<Divide class="w-5 h-5" />
				</Button>

				<!-- Row 2 -->
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("7")}>7</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("8")}>8</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("9")}>9</Button>
				<Button variant="outline" class="h-14 font-bold text-brand bg-brand/5 border-brand/20 rounded-2xl text-lg hover:bg-brand/10" onclick={() => handleOperator("*")}>
					<X class="w-5 h-5" />
				</Button>

				<!-- Row 3 -->
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("4")}>4</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("5")}>5</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("6")}>6</Button>
				<Button variant="outline" class="h-14 font-bold text-brand bg-brand/5 border-brand/20 rounded-2xl text-lg hover:bg-brand/10" onclick={() => handleOperator("-")}>
					<Minus class="w-5 h-5" />
				</Button>

				<!-- Row 4 -->
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("1")}>1</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("2")}>2</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("3")}>3</Button>
				<Button variant="outline" class="h-14 font-bold text-brand bg-brand/5 border-brand/20 rounded-2xl text-lg hover:bg-brand/10" onclick={() => handleOperator("+")}>
					<Plus class="w-5 h-5" />
				</Button>

				<!-- Row 5 -->
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay("0")}>0</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-700 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={() => updateDisplay(".")}>.</Button>
				<Button variant="outline" class="h-14 font-bold text-slate-400 border-slate-100 rounded-2xl text-xl hover:bg-slate-50" onclick={backspace}>
					<Delete class="w-5 h-5" />
				</Button>
				<Button class="h-14 font-black bg-brand hover:bg-brand/90 text-white rounded-2xl text-xl shadow-lg shadow-brand/20 border-none" onclick={calculate}>
					<Equal class="w-6 h-6" />
				</Button>
			</div>
		</div>
	</Card.Content>

	<div class="p-3 bg-slate-50 border-t border-slate-100 text-center">
		<span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">mockcenter engineering tools</span>
	</div>
</div>
