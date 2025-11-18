// Este é um "Módulo de Algoritmo"

const pseudoCode = [
    "DFS(u):", // Linha 0
    "  marcar u como visitado (cinza)", // Linha 1
    "  para cada v em vizinhos(u):", // Linha 2
    "    se v não visitado (branco):", // Linha 3
    "      DFS(v)", // Linha 4
    "  marcar u como finalizado (preto)" // Linha 5
];

// O "Gravador"
function getSteps(graph, start) {
    const history = []; // Onde salvaremos todos os estados
    
    // O estado inicial da aplicação
    const state = {
        visited: new Set(),
        finished: new Set(),
        finishedOrder: [],
        node: null,
        line: -1,
        status: "Pronto para iniciar."
    };

    // Função que clona o estado atual e salva no histórico
    function pushStep(line, status, node) {
        // Criamos um *novo* snapshot do estado
        const newState = {
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    // A lógica recursiva do DFS
    function dfs(u) {
        
        pushStep(0, `Iniciando DFS(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        for (const v of graph[u]) {
            pushStep(2, `Checando vizinho ${v}`, v);
            
            if (!state.visited.has(v)) {
                pushStep(3, `Vizinho ${v} é branco.`, v);
                pushStep(4, `Chamando DFS(${v})`, v);
                dfs(v);
                pushStep(2, `Retornando para ${u} (após ${v})`, u);
            } else {
                pushStep(3, `Vizinho ${v} já visitado.`, v);
            }
        }

        pushStep(5, `Não há mais vizinhos brancos para ${u}.`, u);

        // Muta o estado ANTES de salvar o passo
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (estado: preto)`, u);
    }

    // --- Início ---
    // Salva o Estado 0 (inicial)
    history.push(JSON.parse(JSON.stringify(state))); // Um clone "deep" para o estado 0

    if(graph[start]) {
       dfs(start);
    }
    
    // Salva o Estado Final
    pushStep(-1, "Animação concluída.", null);
    
    return history;
}

// Exportamos o pacote completo do algoritmo
export const dfsAlgorithm = {
    name: "Busca em Profundidade",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};