# Tasks — Dashboard Fiscalização

**Última atualização:** 2026-03-18
**Legenda:** ✅ Concluído · 🔄 Em andamento · ⬜ Pendente

---

## Fase 1 — Infraestrutura

| # | Task | Status | Notas |
|---|------|--------|-------|
| 1.1 | Criar projeto Vite + React 18 | ✅ | `npm create vite@latest` |
| 1.2 | Configurar Tailwind CSS + PostCSS + Autoprefixer | ✅ | `tailwind.config.js` + `postcss.config.js` |
| 1.3 | Instalar dependências: `recharts`, `lucide-react`, `@supabase/supabase-js` | ✅ | `package.json` v atual |
| 1.4 | Configurar `vite.config.js` (porta 3000, plugin React) | ✅ | |
| 1.5 | Criar `index.html` com lang pt-BR e ícone emoji | ✅ | |
| 1.6 | Configurar `.gitignore` (node_modules, dist, .env) | ✅ | |
| 1.7 | Criar `.env.example` com template de variáveis | ✅ | |
| 1.8 | Criar `netlify.toml` com build config e SPA redirect | ✅ | |
| 1.9 | Criar `INICIAR.bat` para setup rápido no Windows | ✅ | |

---

## Fase 2 — Componentes Base e UI

| # | Task | Status | Notas |
|---|------|--------|-------|
| 2.1 | Criar componente `KPI` (ícone, label, valor, subtítulo) | ✅ | Em `Dashboard.jsx` |
| 2.2 | Criar componente `Card` (título, badge, children) | ✅ | Em `Dashboard.jsx` |
| 2.3 | Implementar dark/light mode toggle | ✅ | Estado `darkMode` no Dashboard |
| 2.4 | Implementar navegação por abas (7 abas) | ✅ | Estado `activeTab` |
| 2.5 | Implementar aba Consolidado com KPIs BM1 + BM2 | ✅ | |
| 2.6 | Implementar aba Maia (campanhas BM1, BM2, PDVs, criativos) | ✅ | |
| 2.7 | Implementar aba Líder (mesma estrutura da Maia) | ✅ | |
| 2.8 | Implementar aba BM1 (campanhas compartilhadas + por marca) | ✅ | |
| 2.9 | Implementar aba BM2 (campanhas por marca) | ✅ | |
| 2.10 | Implementar aba Instagram (perfil, posts, stories, gráficos) | ✅ | Recharts para insights |
| 2.11 | Implementar aba Config (formulário de tokens e IDs) | ✅ | Persistência em localStorage |
| 2.12 | Implementar funções utilitárias `fmt`, `fmtMoney`, `varBg`, `tt` | ✅ | |
| 2.13 | Configurar cores de marca (amber=Maia, indigo=Líder) | ✅ | Em `mockData.js` → `brands` |
| 2.14 | Indicador de fonte de dados (Supabase vs mock) na UI | ✅ | Badge no header |

---

## Fase 3 — Integração Meta Graph API

| # | Task | Status | Notas |
|---|------|--------|-------|
| 3.1 | Implementar `fetchInstagramData(igId, token)` | ✅ | Em `Dashboard.jsx` |
| 3.2 | Fetch perfil Instagram (`followers`, `follows`, `media_count`) | ✅ | |
| 3.3 | Fetch posts recentes com insights (reach, impressões, salvamentos, compartilhamentos) | ✅ | |
| 3.4 | Fetch stories com insights (reach, impressões, respostas, saídas) | ✅ | |
| 3.5 | Fetch account insights (seguidores, alcance, impressões — 30 dias) | ✅ | |
| 3.6 | Implementar `fetchAdAccountData(accountId, token)` | ✅ | Meta Ads API v19.0 |
| 3.7 | Exibir KPIs de campanhas da API na aba Consolidado | ✅ | |
| 3.8 | Tratamento de erros de API (token inválido, rate limit) | ✅ | Estado `apiError` |
| 3.9 | Botão de atualização manual (re-fetch) | ✅ | |

---

## Fase 4 — Banco de Dados Supabase

| # | Task | Status | Notas |
|---|------|--------|-------|
| 4.1 | Criar projeto no Supabase | ✅ | Projeto configurado em `.env` |
| 4.2 | Escrever `supabase_schema.sql` (tabelas + RLS) | ✅ | `dashboard_data` + `campaign_snapshots` |
| 4.3 | **Executar schema SQL no Supabase** | ⬜ | **Aguardando execução manual pelo usuário no SQL Editor do Supabase** |
| 4.4 | Criar `src/lib/supabase.js` (client com fallback null) | ✅ | |
| 4.5 | Criar `src/hooks/useDashboardData.js` (fetch + merge + fallback) | ✅ | |
| 4.6 | Criar `seed.mjs` (script Node.js para popular Supabase) | ✅ | `node seed.mjs` |
| 4.7 | Criar `src/lib/seed.js` (utilitário browser para seed via UI) | ✅ | |
| 4.8 | **Rodar seed após criação das tabelas** | ⬜ | **Depende de 4.3** — `node seed.mjs` ou via botão na aba Config |
| 4.9 | Verificar fetch de dados do Supabase no browser | ⬜ | **Depende de 4.3 e 4.8** |
| 4.10 | Configurar variáveis de ambiente no Netlify | ⬜ | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |

---

## Fase 5 — Pendentes / Próximas Features

| # | Task | Prioridade | Notas |
|---|------|-----------|-------|
| 5.1 | Atualização automática periódica dos dados (ex: a cada 1h) | P1 | `setInterval` + re-fetch |
| 5.2 | Persistir snapshots de campanhas em `campaign_snapshots` após cada fetch | P1 | Histórico temporal |
| 5.3 | Exportação de relatório semanal (PDF ou CSV) | P2 | `jsPDF` ou download de CSV |
| 5.4 | Navegação por períodos históricos (semanas anteriores) | P2 | Depende de `campaign_snapshots` populado |
| 5.5 | Otimizar responsividade para mobile (320-767px) | P2 | Tailwind breakpoints |
| 5.6 | Separar componentes em arquivos individuais (`src/components/`) | P3 | Melhoria de manutenibilidade |
| 5.7 | Adicionar autenticação básica (senha ou link mágico) | P3 | Evitar acesso público ao dashboard |
| 5.8 | Alertas visuais para métricas fora de meta (ex: CPM acima do limite) | P2 | Thresholds configuráveis na aba Config |
| 5.9 | Gráfico de evolução de investimento ao longo das semanas | P2 | Depende de histórico em Supabase |
| 5.10 | Integração Google Analytics / Pixel Meta para tracking de uso | P3 | |

---

## Próximos Passos Imediatos

1. ⬜ **4.3** — Executar `supabase_schema.sql` no SQL Editor do Supabase Dashboard
2. ⬜ **4.8** — Rodar `node seed.mjs` para popular as tabelas com os dados atuais
3. ⬜ **4.9** — Abrir o dashboard e verificar indicador "Supabase" no header (em vez de "Mock")
4. ⬜ **4.10** — Configurar variáveis de ambiente no painel do Netlify para o deploy em produção
