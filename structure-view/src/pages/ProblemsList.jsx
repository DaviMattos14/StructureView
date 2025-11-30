import { useOutletContext } from 'react-router-dom';
import Combobox from '../components/Combobox';
import { useMemo, useState } from 'react';

const availableCategories = [
  "Todos",
  "Ordenação Topológica",
  "Busca em Profundidade",
  "Busca em Largura",
  "Algoritmo de Dijkstra"
];

export default function ProblemsList() {
  const [category, setCategory] = useState("Todos");
  const { isDarkMode } = useOutletContext();

  const problems = useMemo(() => {
    if (!availableCategories.includes(category)) return [];

    if (category === "Todos") {
      return Object.values(MOCK).flat();
    }

    return MOCK[category] || [];
  }, [category]);

  const theme = {
    bg: isDarkMode ? '#1e293b' : '#ffffff', // Fundo do container (igual ao Home)
    text: isDarkMode ? '#ffffffff' : '#111827',
    textSec: isDarkMode ? '#d9dde4ff' : '#64748b',
    cardBg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    cardHover: isDarkMode ? '#1e293b' : '#ffffff',
    sectionTitle: isDarkMode ? '#e2e8f0' : '#334155'
  };


  return (
    <main style={{ 
      flex: 1, 
      padding: '3rem', 
      overflowY: 'auto', 
      backgroundColor: theme.bg,
      transition: 'background-color 0.3s'
    }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, marginBottom: '2rem' }}>
        Listas de exercícios
      </h2>
      
      <div style={{ borderBottom: `2px solid ${theme.cardBorder}` }}>
        <Combobox  
          label='Escolha um conteúdo' 
          options={availableCategories} 
          defaultValue={availableCategories[0]} 
          onChange={setCategory}
        />
      </div>

      <ul style={{ 
        width: "100%", 
        padding: 0, 
        listStyle: "none",
        border: "2px solid " + theme.cardBorder,
        borderRadius: "5px" 
      }}>
        { problems.map((e, i) => (
          <li style={{ 
            width: "100%", 
            display: "grid", 
            gridTemplateColumns: "50px 1fr 150px auto",
            alignItems: "center",
            background: `${i % 2 === 0 ? theme.cardBg : "transparent"}`,
            padding: "1em 0px",
            gap: "1em",
            borderRadius: "2px" 
          }}>
            <p style={{ 
              width: "50px", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              color: theme.text
            }}>
              { e.id }
            </p>
            <h3 style={{ 
              padding: "0px", 
              margin: "0px",
              fontWeight: "400",
              fontSize: "1em",
              color: theme.text
            }}>
              { e.name }
            </h3>
            <div style={{  
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              color: "#fff"
            }}>
              <p style={{ 
                backgroundColor: e.status === "NOT DONE" ? "red" : "green",
                padding: "2px 6px",
                borderRadius: "2px", 
              }}>
                { e.status === "NOT DONE" ? "Não concluído" : "Concluído" }
              </p>
            </div>
            <a style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              paddingRight: "12px",
              textDecoration: "none",
              color: "#2563EB",
              fontWeight: "bold"
            }} 
              href='#'>
                PRATICAR
            </a>
          </li>
        )) }
        
      </ul>

    </main>
  );
};

const MOCK = {
  "Ordenação Topológica": [
    { id: "1", name: "Calcular ordem de execução de tarefas dependentes", status: "NOT DONE" },
    { id: "2", name: "Encontrar ordem válida em um grafo de pré-requisitos", status: "DONE" },
    { id: "3", name: "Detectar ciclo antes de ordenar o grafo", status: "NOT DONE" }
  ],

  "Busca em Profundidade": [
    { id: "4", name: "Contar componentes conectados em um grafo", status: "NOT DONE" },
    { id: "5", name: "Encontrar caminho entre dois vértices usando DFS", status: "DONE" },
    { id: "6", name: "Verificar se um grafo é bipartido via DFS", status: "NOT DONE" }
  ],

  "Busca em Largura": [
    { id: "7", name: "Encontrar menor número de arestas entre dois nós", status: "DONE" },
    { id: "8", name: "Nivelar um grafo e calcular camadas por BFS", status: "NOT DONE" },
    { id: "9", name: "Detectar ciclos em gráficos não direcionados", status: "NOT DONE" }
  ],

  "Algoritmo de Dijkstra": [
    { id: "10", name: "Encontrar menor caminho entre dois pontos", status: "NOT DONE" },
    { id: "11", name: "Calcular distâncias mínimas em grafo com pesos positivos", status: "DONE" },
    { id: "12", name: "Reconstruir caminho mínimo após cálculo de Dijkstra", status: "NOT DONE" }
  ]
}
