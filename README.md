# Structure View
|  |  |
| :---: | :---: |
| ![Modo Escuro](structure-view\imagens\captura1.png) | ![Modo claro](structure-view\imagens\captura2.png) |

Criado por alunos da UFRJ a partir de um trabalho da matéria de Algoritmos e Grafos, o StructureView é uma aplicacao educacional full-stack para visualizar, aprender e praticar algoritmos com aulas, exercicios e visualizadores, sendo voltada para qualquer um interessado em aprender mais sobre algoritmos em geral.

## Principais recursos
- Visualizador interativo de grafos com controles de edicao e execucao de algoritmos.
- Trilhas de conteudo e aulas sobre representacao de grafos, listas, SCC, etc.
- Exercicios de multipla escolha e problemas praticos com autosave e status (em andamento/concluido).
- Autenticacao, menu do usuario e modal para alterar email/senha.
- API REST em Node/Express integrando MySQL com charset utf8mb4 para suportar acentuacao.

![](structure-view\imagens\captura3.png)
![](structure-view\imagens\captura4.png)

## Stack
- Front-end: React 19, Vite, React Router, Context API, lucide-react para icones, ESLint.
- Back-end: Node.js, Express, mysql2/promise, CORS, dotenv.
- Banco: MySQL com schema em `server/database.sql` e collation `utf8mb4_unicode_ci`.

## Arquitetura (pastas-chave)
- `structure-view/src`: app React (paginas, componentes, hooks, algoritmos).
- `structure-view/server`: API Express (rotas de auth/exercicios, config do banco).
- `structure-view/public`: assets estaticos.

## Fluxos em destaque
- **Autenticacao e perfil**: login/registro via `/api/auth`; Header mostra "Ola, {Nome}" e abre menu para alterar dados ou sair.
- **Exercicios**: lista com status; formularios de multipla escolha em `/problem/form` usam autosave e validacao de respostas.
- **Visualizador**: pagina `/visualizer` com canvas de grafo, controles e execucao passo-a-passo dos algoritmos implementados em `src/algorithms`.

## Como rodar localmente
1) Requisitos: Node 18+, MySQL 5.7+.
2) Back-end
```bash
cd structure-view/server
npm install
# crie .env com HOST, USER, PASSWORD, DATABASE
# execute o script SQL no MySQL
npm start
```
3) Front-end
```bash
cd structure-view
npm install
# crie .env com VITE_API_URL=http://localhost:3001/api
npm run dev
```
4) Acesse `http://localhost:5173` (Vite) com a API em `http://localhost:3001`.
