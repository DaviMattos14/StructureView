import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData } from "./graph.js";
import { dfsAlgorithm } from "./algorithms/dfs.js";

// --- Configuração ---
const ALGORITHM_TO_RUN = dfsAlgorithm;
const START_NODE = "A";

// --- Elementos da UI ---
let statusEl, finishedVectorEl, playPauseBtn, prevBtn, nextBtn, resetBtn, speedSlider;

// --- Estado da Aplicação ---
let algorithmSteps = []; // O histórico completo de snapshots
let currentStep = 0;
let isPlaying = false;
let animationTimer = null;
let animationSpeed = 1200; // Valor inicial do slider

// --- Função de Renderização Principal ---
// "Burra": apenas lê o estado de um índice e o exibe
function renderStep(index) {
    if (index < 0 || index >= algorithmSteps.length) {
        return; // Impede erros de índice
    }
    
    const step = algorithmSteps[index];

    // 1. Destaque do Código
    highlightLine(step.line);
    
    // 2. Atualiza o Status
    statusEl.textContent = step.status;
    
    // 3. Atualiza o Vetor de Finalização
    finishedVectorEl.textContent = `[${step.finishedOrder.join(', ')}]`;
    
    // 4. Desenha o Grafo
    drawGraph(step.visited, step.finished, step.node);
    
    currentStep = index;
    
    // Habilita/Desabilita botões
    prevBtn.disabled = (currentStep === 0);
    nextBtn.disabled = (currentStep === algorithmSteps.length - 1);
}

// --- Controles de Playback ---

function stepForward() {
    if (currentStep < algorithmSteps.length - 1) {
        renderStep(currentStep + 1);
    }
}

function stepBackward() {
    if (currentStep > 0) {
        renderStep(currentStep - 1);
    }
}

function playLoop() {
    // Se o play foi pausado ou chegou ao fim, pare.
    if (!isPlaying || currentStep >= algorithmSteps.length - 1) {
        if(isPlaying) togglePlayPause(); // Para automaticamente
        return;
    }
    
    stepForward();
    
    // O slider vai de 100 (rápido) a 2000 (lento)
    // Invertemos para o delay: 2100 - valor
    animationTimer = setTimeout(playLoop, 2100 - animationSpeed);
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        playPauseBtn.textContent = "❚❚ Pause";
        
        // Se estiver no fim, reinicie antes de tocar
        if (currentStep >= algorithmSteps.length - 1) {
            currentStep = 0;
        }
        
        playLoop();
    } else {
        playPauseBtn.textContent = "▶ Play";
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }
    }
}

function onSpeedChange(event) {
    animationSpeed = event.target.valueAsNumber;
}

function reset() {
    // Para qualquer animação
    if (isPlaying) togglePlayPause(); 
    
    // Reseta o ponteiro e renderiza o estado 0
    currentStep = 0;
    renderStep(0);
}

// --- Inicialização ---
function initialize() {
    // 1. Obter Elementos da UI
    statusEl = document.getElementById("statusText");
    finishedVectorEl = document.getElementById("finishedVector");
    playPauseBtn = document.getElementById("btn-play-pause");
    prevBtn = document.getElementById("btn-prev");
    nextBtn = document.getElementById("btn-next");
    resetBtn = document.getElementById("resetBtn");
    speedSlider = document.getElementById("speedSlider");

    // 2. Definir Título e Pseudocódigo
    document.getElementById("algorithmTitle").textContent = ALGORITHM_TO_RUN.name;
    renderPseudoCode(ALGORITHM_TO_RUN.pseudoCode);
    
    // 3. Gerar os Passos (Gravador)
    algorithmSteps = ALGORITHM_TO_RUN.getSteps(graphData.graph, START_NODE);
    
    // 4. Vincular Eventos
    playPauseBtn.onclick = togglePlayPause;
    prevBtn.onclick = stepBackward;
    nextBtn.onclick = stepForward;
    resetBtn.onclick = reset;
    speedSlider.oninput = onSpeedChange;
    animationSpeed = speedSlider.valueAsNumber; // Definir velocidade inicial

    // 5. Renderizar o Estado Inicial (Passo 0)
    reset();
}

// Inicia o app quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initialize);