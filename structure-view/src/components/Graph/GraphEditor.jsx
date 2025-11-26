import React, { useRef, useEffect, useState } from 'react';
import { calculateLayout } from '../../utils/layout';

const GraphEditor = ({ initialGraph, onSave, onClose }) => {
  const canvasRef = useRef(null);
  
  // Estado Local de Edição
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // Estado de Interação
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragStartNode, setDragStartNode] = useState(null); 
  const [mousePos, setMousePos] = useState({x:0, y:0});
  
  // Ref para detecção de duplo clique direito (não causa re-render)
  const lastRightClick = useRef(0);

  // 1. Inicialização
  useEffect(() => {
    const keys = Object.keys(initialGraph).sort();
    
    if (keys.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
    }

    const layout = calculateLayout(initialGraph, keys[0], 800, 500);
    
    const newNodes = keys.map(k => ({ 
      id: k, 
      x: layout[k]?.x || 100, 
      y: layout[k]?.y || 100 
    }));

    const newEdges = [];
    keys.forEach(u => {
        initialGraph[u].forEach(edge => {
            newEdges.push({ from: u, to: edge.target, weight: edge.weight });
        });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialGraph]); 

  // 2. Loop de Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Correção DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Arestas
    edges.forEach(edge => {
        const u = nodes.find(n => n.id === edge.from);
        const v = nodes.find(n => n.id === edge.to);
        if (!u || !v) return;
        
        ctx.strokeStyle = '#64748b';
        ctx.fillStyle = '#64748b';
        drawArrow(ctx, u.x, u.y, v.x, v.y);
        
        // Peso
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 10, midY - 10, 20, 20);
        ctx.fillStyle = 'black';
        ctx.fillText(edge.weight, midX, midY);
        ctx.restore();
    });

    // Linha temporária
    if (dragStartNode) {
        ctx.beginPath();
        ctx.moveTo(dragStartNode.x, dragStartNode.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#3b82f6'; 
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        drawArrowHead(ctx, dragStartNode.x, dragStartNode.y, mousePos.x, mousePos.y);
    }

    // Nós
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        if (node.id === draggedNode?.id) ctx.strokeStyle = '#3b82f6'; 
        else if (node.id === dragStartNode?.id) ctx.strokeStyle = '#3b82f6'; 
        else ctx.strokeStyle = '#000';
        
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillText(node.id, node.x, node.y);
    });

  }, [nodes, edges, dragStartNode, mousePos, draggedNode]);

  // --- HELPERS DE DESENHO ---
  
  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const r = 20; 
    
    const endX = toX - r * Math.cos(angle);
    const endY = toY - r * Math.sin(angle);
    const startX = fromX + r * Math.cos(angle);
    const startY = fromY + r * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    drawArrowHead(ctx, startX, startY, endX, endY); // Reutiliza função
  };

  const drawArrowHead = (ctx, fromX, fromY, toX, toY) => {
      const headLength = 10;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(toX, toY);
      ctx.fill();
  };

  // --- HELPERS DE MATEMÁTICA E COLISÃO (RESTAURADOS) ---

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getNodeAt = (x, y) => {
    return nodes.find(n => Math.sqrt((n.x - x)**2 + (n.y - y)**2) < 25);
  };

  // Distância de ponto a segmento (para clicar na linha)
  const getDistanceToSegmentSquared = (p, v, w) => {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 === 0) return (p.x - v.x)**2 + (p.y - v.y)**2;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return (p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2;
  };

  const getEdgeAt = (x, y) => {
      const clickPoint = {x, y};
      return edges.find(e => {
          const u = nodes.find(n => n.id === e.from);
          const v = nodes.find(n => n.id === e.to);
          if(!u || !v) return false;
          // Tolerância de 15px para facilitar o clique
          return Math.sqrt(getDistanceToSegmentSquared(clickPoint, u, v)) < 15;
      });
  };

  // --- EVENT HANDLERS ---

  const handleMouseDown = (e) => {
    const { x, y } = getCoords(e);
    const clickedNode = getNodeAt(x, y);
    const clickedEdge = getEdgeAt(x, y);

    // SHIFT + ESQ: Editar Peso
    if (e.button === 0 && e.shiftKey && clickedEdge) {
        const newWeight = prompt(`Novo peso para aresta ${clickedEdge.from}->${clickedEdge.to}:`, clickedEdge.weight);
        if (newWeight !== null) {
            const w = parseInt(newWeight);
            if (!isNaN(w)) {
                const newEdges = edges.map(ed => ed === clickedEdge ? { ...ed, weight: w } : ed);
                setEdges(newEdges);
            }
        }
        return;
    }

    // ESQ: Criar Nó / Iniciar Aresta
    if (e.button === 0) {
        if (clickedNode) {
            setDragStartNode(clickedNode);
        } else {
            // Cria nó se não estiver clicando em nada
            if (!clickedNode) {
                const newId = (nodes.length > 0 ? Math.max(...nodes.map(n=>parseInt(n.id))) + 1 : 0).toString();
                setNodes([...nodes, { id: newId, x, y }]);
            }
        }
    }

    // DIREITO: Mover Nó OU Deletar Aresta (Duplo Clique Simulado)
    if (e.button === 2) {
        const now = Date.now();
        // Se o tempo entre cliques for < 300ms, é duplo clique
        if (now - lastRightClick.current < 300) {
            if (clickedEdge) {
                setEdges(edges.filter(e => e !== clickedEdge));
                return;
            }
        }
        lastRightClick.current = now;

        if (clickedNode) {
            setDraggedNode(clickedNode);
        }
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCoords(e);
    setMousePos({x, y});

    if (draggedNode) {
        // Limites visuais
        const rect = canvasRef.current.getBoundingClientRect();
        const newNodes = nodes.map(n => 
            n.id === draggedNode.id ? { 
                ...n, 
                x: Math.max(20, Math.min(rect.width-20, x)), 
                y: Math.max(20, Math.min(rect.height-20, y)) 
            } : n
        );
        setNodes(newNodes);
    }

    // Cursor
    const hoverNode = getNodeAt(x, y);
    const hoverEdge = getEdgeAt(x, y);
    if (hoverNode) canvasRef.current.style.cursor = 'grab';
    else if (hoverEdge) canvasRef.current.style.cursor = e.shiftKey ? 'text' : 'pointer'; // Pointer indica que é interagível
    else canvasRef.current.style.cursor = 'crosshair';
  };

  const handleMouseUp = (e) => {
    if (e.button === 0 && dragStartNode) {
        const { x, y } = getCoords(e);
        const targetNode = getNodeAt(x, y);
        if (targetNode && targetNode.id !== dragStartNode.id) {
            if (!edges.some(edge => edge.from === dragStartNode.id && edge.to === targetNode.id)) {
                setEdges([...edges, { from: dragStartNode.id, to: targetNode.id, weight: 1 }]);
            }
        }
        setDragStartNode(null);
    }
    if (e.button === 2 && draggedNode) {
        setDraggedNode(null);
    }
  };

  const handleDblClick = (e) => {
    const { x, y } = getCoords(e);
    const clickedNode = getNodeAt(x, y);

    // Apagar Nó (Duplo Clique Esquerdo)
    if (clickedNode) {
        setNodes(nodes.filter(n => n.id !== clickedNode.id));
        setEdges(edges.filter(edge => edge.from !== clickedNode.id && edge.to !== clickedNode.id));
    }
  };

  const handleSave = () => {
    const newGraphObj = {};
    nodes.forEach(n => newGraphObj[n.id] = []);
    edges.forEach(e => {
        if (newGraphObj[e.from]) {
            newGraphObj[e.from].push({ target: e.to, weight: e.weight });
        }
    });
    
    // Calcula novo startNode (menor ID)
    const newStart = nodes.length > 0 ? nodes.sort((a,b) => parseInt(a.id) - parseInt(b.id))[0].id : null;

    onSave(newGraphObj, newStart);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div className="editor-toolbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
            <span style={{fontSize: '0.9rem', color: '#475569'}}>
                🖱️ Esq: Criar Nó / Aresta | ⇧+Esq: Peso | Dir: Mover | 2x: Apagar
            </span>
            <button onClick={() => {setNodes([]); setEdges([])}} style={{padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer'}}>Limpar</button>
        </div>
        
        <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
            <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', background: '#fff' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick={handleDblClick}
            />
        </div>

        <div style={{ textAlign: 'right' }}>
            <button 
                onClick={handleSave}
                style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Salvar e Atualizar
            </button>
        </div>
    </div>
  );
};

export default GraphEditor;