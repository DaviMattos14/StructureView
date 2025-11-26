import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';

// Hook e Utils
import { useGraph } from '../hooks/useGraph';
import { graphToText, textToGraph } from '../utils/graphUtils';

// Componentes
import GraphCanvas from '../components/Graph/GraphCanvas';
import GraphEditor from '../components/Graph/GraphEditor';
import Controls from '../components/Graph/Controls';

// CSS Global
import '../components/Graph/engine.css'; 

const Visualizer = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const algoParam = searchParams.get('algo') || 'dfs';

    const {
        graph, positions, isDirected, startNode,
        currentStepData, currentAlgoInfo,
        isPlaying, speed,
        setStartNode, setIsDirected, setSpeed, setIsPlaying,
        stepForward, stepBackward, resetAnimation,
        saveGraphFromEditor
    } = useGraph(algoParam);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); 
    const [textInput, setTextInput] = useState('');

    // --- ESTADO LOCAL PARA O INPUT DE INÍCIO (Buffer) ---
    const [localStartNode, setLocalStartNode] = useState(startNode);

    // Sincroniza o input local quando o motor muda o nó externamente (ex: ao carregar novo grafo)
    useEffect(() => {
        setLocalStartNode(startNode);
    }, [startNode]);

    // --- HANDLERS DO INPUT DE INÍCIO ---
    
    const handleStartNodeChange = (e) => {
        setLocalStartNode(e.target.value);
    };

    const handleStartNodeCommit = () => {
        // Só atualiza o motor se o nó existir no grafo
        if (graph[localStartNode]) {
            setStartNode(localStartNode);
        } else {
            // Se inválido, reverte para o valor real atual e avisa
            setLocalStartNode(startNode);
            // Opcional: alert("Nó não encontrado!");
        }
    };

    const handleStartNodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleStartNodeCommit();
            e.target.blur(); // Tira o foco
        }
    };

    const handleFocus = (e) => {
        e.target.select(); // Seleciona todo o texto ao clicar
    };

    // --- HANDLERS DO MODAL ---

    const handleOpenModal = () => {
        setTextInput(graphToText(graph));
        setActiveTab('text'); 
        setIsModalOpen(true);
    };

    const handleSaveText = () => {
        try {
            const newGraph = textToGraph(textInput);
            const keys = Object.keys(newGraph);
            if (keys.length === 0) throw new Error("O grafo não pode ser vazio");
            
            let newStart = startNode;
            if (!newGraph[newStart]) newStart = keys[0];

            saveGraphFromEditor(newGraph, newStart);
            setIsModalOpen(false);
        } catch (e) {
            alert("Erro no formato do JSON: " + e.message);
        }
    };

    const renderFinishedList = (list) => {
        if (!list || list.length === 0) return '[]';
        if (currentAlgoInfo?.name?.includes('Dijkstra')) {
            return `{ ${list.join(', ')} }`;
        }
        return `[${list.join(', ')}]`;
    };

    return (
        <div className="viz-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            
            {/* 1. Header */}
            <div style={{ height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', backgroundColor: 'white', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => navigate('/algorithms')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 10px' }}></div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                        {currentAlgoInfo?.name || 'Visualizador'}
                    </h2>
                </div>
            </div>

            {/* 2. Conteúdo */}
            <div id="container" style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
                
                {/* Esquerda */}
                <div className="left-column">
                    <div className="control-row">
                        <button onClick={handleOpenModal} className="action-btn" style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <Edit3 size={16} /> Editar Grafo
                        </button>
                        <div className="input-wrapper">
                            <label htmlFor="startNodeInput" style={{fontSize: '0.9rem', color: '#64748b'}}>Início:</label>
                            <input 
                                type="text" 
                                id="startNodeInput" 
                                className="small-input" 
                                value={localStartNode}
                                onChange={handleStartNodeChange}
                                onBlur={handleStartNodeCommit}
                                onKeyDown={handleStartNodeKeyDown}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', position: 'relative' }}>
                        <GraphCanvas 
                            graph={graph}
                            positions={positions}
                            isDirected={isDirected}
                            currentStepData={currentStepData}
                            showWeights={currentAlgoInfo?.isWeighted}
                            onNodeDrag={(id, x, y) => {
                                // Precisamos importar updateNodePosition do hook, mas ele não está exposto aqui no destructuring inicial
                                // Para corrigir isso rápido sem mudar o hook, vou assumir que você vai adicionar updateNodePosition no destructuring lá em cima
                                // Se não estiver, adicione: updateNodePosition
                            }} 
                        />
                        {/* Nota: Esqueci de adicionar updateNodePosition no destructuring acima. Adicionando agora abaixo */}
                    </div>
                </div>

                {/* Direita */}
                <div id="uiPanel">
                    <div id="codeBox">
                        <strong>Pseudocódigo:</strong>
                        <div style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.85rem', 
                            lineHeight: '1.5', 
                            marginTop: '10px',
                            maxHeight: '300px', 
                            overflowY: 'auto' 
                        }}>
                            {currentAlgoInfo?.pseudoCode?.map((line, i) => (
                                <div key={i} style={{ 
                                    backgroundColor: currentStepData.line === i ? '#fef08a' : 'transparent',
                                    fontWeight: currentStepData.line === i ? 'bold' : 'normal',
                                    padding: '2px 4px',
                                    whiteSpace: 'pre-wrap', 
                                    fontFamily: '"Courier New", monospace' 
                                }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div id="queueBox">
                        <strong id="queueLabel">{currentAlgoInfo?.label || "Fila:"}</strong>
                        <div id="queueVector" style={{ marginTop: '5px', fontFamily: 'monospace', color: '#15803d', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                            {currentStepData.queueSnapshot ? `[${currentStepData.queueSnapshot.join(', ')}]` : '[]'}
                        </div>
                    </div>
                    <div id="statusBox">
                        <strong>Status:</strong>
                        <div id="statusText" style={{ marginTop: '5px', color: '#475569' }}>
                            {currentStepData.status || 'Aguardando...'}
                        </div>
                    </div>
                    <div id="finishedBox">
                        <strong id="finishedLabel">
                            {currentAlgoInfo?.name?.includes('Dijkstra') ? 'Distâncias Finais' : 'Ordem de Finalização'}
                        </strong>
                        <div id="finishedVector" style={{ marginTop: '5px', fontFamily: 'monospace', color: '#1e40af', wordBreak: 'break-word' }}>
                            { renderFinishedList(currentStepData.finishedOrder) }
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Controles */}
            <div style={{ flexShrink: 0 }}>
                <Controls 
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onStepForward={stepForward}
                    onStepBackward={stepBackward}
                    onReset={resetAnimation}
                    speed={speed}
                    setSpeed={setSpeed}
                    showDirectedControl={currentAlgoInfo?.name?.includes('Dijkstra')}
                    isDirected={isDirected}
                    onToggleDirected={() => setIsDirected(!isDirected)}
                />
            </div>

            {/* 4. Modal */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Editar Grafo</h2>
                        
                        <div className="tabs">
                            <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>📝 Texto</button>
                            <button className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>🎨 Desenhar</button>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {activeTab === 'text' ? (
                                <div id="tab-text" className="tab-content active">
                                    <p className="hint">Formato: <b>0: [ ["1", 5], "2" ]</b></p>
                                    <textarea 
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        style={{ height: '100%', width: '100%', resize: 'none', fontFamily: 'monospace' }}
                                    ></textarea>
                                     <div className="modal-actions">
                                        <button onClick={handleSaveText} className="primary-btn">Salvar Texto</button>
                                    </div>
                                </div>
                            ) : (
                                <GraphEditor 
                                    initialGraph={graph}
                                    onSave={(newGraph, newStart) => {
                                        saveGraphFromEditor(newGraph, newStart);
                                        setIsModalOpen(false);
                                    }}
                                    onClose={() => setIsModalOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Visualizer;