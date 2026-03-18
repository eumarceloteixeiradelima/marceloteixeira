# PRD — Dashboard Fiscalização
**Versão:** 1.2
**Data:** 2026-03-18
**Status:** Em desenvolvimento

---

## 1. Visão Geral

### Problema
A equipe de marketing que gerencia as marcas **Lojas Maia** e **Líder Colchões** precisa acompanhar semanalmente o desempenho de campanhas Meta Ads (BM1 e BM2) e Instagram de forma consolidada. Atualmente, os dados estão dispersos no painel do Meta Ads Manager e no Instagram, exigindo acesso manual a múltiplas telas e exportações para compor relatórios.

### Solução
Dashboard web centralizado que consolida, em uma única interface, todas as métricas relevantes de campanhas pagas e orgânicas das duas marcas — com comparativo semana anterior, visualizações gráficas e acesso em tempo real via Meta Graph API.

### Público-Alvo
- **Usuário primário:** Gestor/analista de marketing responsável pelas duas marcas
- **Usuário secundário:** Diretores e sócios que acompanham resultados de forma pontual

### URL em Produção
Hospedado no Netlify (deploy automático via `main` branch).

---

## 2. Objetivos e Métricas de Sucesso

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Reduzir tempo de elaboração de relatório semanal | Minutos gastos por relatório | < 10 min (vs. ~60 min atual) |
| Centralizar dados das duas marcas | Abas/marcas disponíveis | 2 marcas cobertas |
| Acesso a dados em tempo real | Latência de atualização | < 30 s via API |
| Disponibilidade do dashboard | Uptime | > 99% (Netlify) |
| Adoção pela equipe | Sessões semanais únicas | ≥ 3/semana |

---

## 3. Funcionalidades

### 3.1 Aba: Consolidado (P0)
Visão geral de ambas as marcas e ambos os BMs na semana corrente.

- Total investido (BM1 + BM2)
- KPIs BM1: investido, alcance, impressões, CPM, cliques, campanhas ativas
- KPIs BM2: investido, alcance, impressões, contatos, novos contatos, campanhas ativas
- Período de referência exibido no topo

### 3.2 Aba: Maia (P0)
Performance da marca Lojas Maia.

- Tabela de campanhas BM1 (resultado, variação vs. semana anterior, custo por resultado, investimento)
- Tabela de campanhas BM2 (resultado, custo, investimento)
- Top PDVs por conversões (com variação % e CPM)
- Top criativos por mensagens/conversões com custo por resultado

### 3.3 Aba: Líder (P0)
Performance da marca Líder Colchões — mesma estrutura da aba Maia.

### 3.4 Aba: BM1 (P1)
Detalhamento do Business Manager 1 (foco em vendas/conversões).

- Campanhas compartilhadas entre as duas marcas
- Métricas: resultado, variação, custo por resultado, investimento
- Indicador visual de variação positiva/negativa

### 3.5 Aba: BM2 (P1)
Detalhamento do Business Manager 2 (foco em contatos/WhatsApp).

- Campanhas separadas por marca
- Métricas: resultado, custo, investimento

### 3.6 Aba: Instagram (P1)
Dados orgânicos das contas Instagram das duas marcas.

- Perfil: seguidores, seguindo, posts totais
- Posts recentes: tipo de mídia, data, likes, comentários, alcance, impressões, salvamentos, compartilhamentos
- Stories recentes: alcance, impressões, respostas, saídas
- Gráficos de evolução: seguidores, alcance e impressões (7/14/30 dias)

### 3.7 Aba: Config (P0)
Configuração das credenciais de API diretamente pela UI.

- Campo para Meta User Access Token
- Campos para IDs das contas de anúncio (BM1 Maia, BM1 Líder, BM2 Maia, BM2 Líder)
- IDs das contas Instagram (Maia, Líder)
- Persistência em `localStorage`
- Botão de teste de conexão
- Seed manual do banco de dados Supabase

### 3.8 Funcionalidades Transversais (P0)
- Dark/light mode com toggle
- Indicador de fonte de dados (Supabase vs. mock)
- Botão de atualização manual (re-fetch da API)
- Formatação numérica em pt-BR (moeda, percentuais, K/M)

### 3.9 Auto-Refresh (P1) ✅ Implementado
Atualização automática de dados em intervalos configuráveis, sem necessidade de interação manual.

- Toggle "Auto" no header para ativar/desativar
- Intervalos disponíveis: 5 min · 15 min · 30 min · 1 h (padrão: 15 min)
- Contador regressivo exibido no header ("próx. em X:XX")
- Disponível apenas com API configurada — desabilitado em modo Mock
- Preferência persistida em `localStorage` (chave `dashboard_autorefresh`)
- Cleanup de intervalos ao desativar ou desmontar componente

### 3.10 Layout Mobile Otimizado (P1) ✅ Implementado
Interface responsiva e utilizável em dispositivos móveis.

- Header compacto: subtítulo e controles de auto-refresh ocultos em telas < 640px
- Padding adaptativo: `px-3 py-4` no mobile, `px-5 py-6` em telas maiores
- Tabs com scroll horizontal (sem quebra de linha)
- Cards com padding reduzido em mobile (`p-4` → `p-5` em sm+)
- KPIs com tamanho de fonte responsivo (`text-lg` → `text-xl` em sm+)
- Espaçamentos das seções reduzidos em mobile (`space-y-4` → `space-y-5` em sm+)

---

## 4. Requisitos Não-Funcionais

### Performance
- Tempo de carregamento inicial (First Contentful Paint): < 2 s em conexão 4G
- Bundle size pós-build: < 500 KB gzipped
- Re-renders: evitar cascata; usar memoização onde necessário

### Disponibilidade
- Hospedagem Netlify CDN: SLA 99.9%
- Fallback automático para mock data quando Supabase ou Meta API indisponível

### Segurança
- Tokens e credenciais armazenados em `localStorage` (client-side only, uso interno)
- Variáveis de ambiente Supabase via `VITE_` (não incluídas no repositório)
- Arquivo `.env` no `.gitignore`
- Row Level Security (RLS) habilitado no Supabase com policy de acesso público (dashboard interno)

### Responsividade
- Layout primário: desktop/widescreen (1280px+)
- Layout funcional: tablet (768px+)
- Mobile (≥ 375px): suportado com layout adaptativo (implementado em v1.2)

### Manutenibilidade
- Código em um único arquivo `Dashboard.jsx` (simplicidade intencional para este escopo)
- Mock data isolado em `src/data/mockData.js` para facilitar atualizações
- Hook `useDashboardData` isolado para facilitar migração futura

---

## 5. Integrações

### Meta Graph API v19.0
- **Propósito:** Buscar dados de campanhas de anúncios e insights de contas Instagram em tempo real
- **Autenticação:** User Access Token (gerado no Meta for Developers)
- **Endpoints usados:**
  - `GET /{ig-user-id}` — perfil Instagram
  - `GET /{ig-user-id}/media` — posts recentes com insights
  - `GET /{ig-user-id}/stories` — stories com insights
  - `GET /{ig-user-id}/insights` — métricas da conta (seguidores, alcance, impressões)
  - `GET /{ad-account-id}/insights` — métricas de campanhas pagas

### Supabase (PostgreSQL)
- **Propósito:** Persistência de dados de campanhas para histórico e comparativos
- **Tabelas:** `dashboard_data` (snapshot semanal por seção), `campaign_snapshots` (histórico)
- **Acesso:** Anon key via SDK `@supabase/supabase-js`
- **Fallback:** Se Supabase não configurado ou tabelas vazias, usa mock data automaticamente

### Netlify
- **Propósito:** Hospedagem e deploy contínuo
- **Build:** `npm run build` → publica pasta `dist`
- **SPA:** Redirect `/* → /index.html` para roteamento client-side

---

## 6. Fora de Escopo (v1.2)

- Autenticação/login de usuários
- Notificações ou alertas automáticos
- Integração com Google Ads ou outras plataformas
- Relatórios exportáveis (PDF/Excel)
- Múltiplos usuários / multi-tenant
- Histórico de períodos passados com navegação por data

> **Movidos para implementado:** Layout mobile otimizado (v1.2), Auto-refresh (v1.1)

---

## 7. Dependências e Riscos

| Item | Tipo | Impacto | Mitigação |
|------|------|---------|-----------|
| Meta User Token expirado | Risco | Alto — dados de API param | Exibir erro na UI; fallback para Supabase/mock |
| Rate limit Meta API | Risco | Médio — updates frequentes bloqueados | Cache no Supabase; atualização manual pelo usuário |
| Schema Supabase não executado | Dependência | Alto — dados não persistem | Fallback automático para mock; instrução clara no README |
| Mudança na versão da Graph API | Risco | Médio — endpoints podem mudar | API fixada em v19.0; revisar a cada 6 meses |
| Token Supabase anon key exposta | Risco | Baixo (uso interno) | RLS habilitado; nunca expor service_role key |
