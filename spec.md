# Spec Técnica — Dashboard Fiscalização
**Versão:** 1.0
**Data:** 2026-03-18
**Stack:** React 18 + Vite + Tailwind CSS + Recharts + Supabase + Netlify

---

## 1. Arquitetura

### Diagrama de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                 │
│                                                                   │
│  index.html                                                       │
│      └─→ main.jsx                                                 │
│              └─→ Dashboard.jsx                                    │
│                    ├─→ useDashboardData() hook                    │
│                    │       ├─→ supabase.js ──→ Supabase DB        │
│                    │       └─→ mockData.js  (fallback)            │
│                    │                                              │
│                    ├─→ fetchInstagramData()                       │
│                    │       └──────────────────→ Meta Graph API    │
│                    │                           v19.0              │
│                    └─→ fetchAdAccountData()                       │
│                            └────────────────→ Meta Ads API        │
│                                                v19.0              │
└─────────────────────────────────────────────────────────────────┘

Persistência:
  localStorage ─→ config (tokens, IDs de conta)
  Supabase     ─→ dashboard_data, campaign_snapshots

Deploy:
  GitHub → Netlify (build: vite build, publish: dist/)
```

### Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Estrutura de arquivos | Single-file Dashboard.jsx | Simplicidade para escopo atual; sem roteamento |
| Estado global | useState local no Dashboard | Sem necessidade de Redux/Zustand neste escopo |
| Fallback de dados | Mock automático via hook | Permite desenvolvimento offline e resiliência |
| Configuração | localStorage | Não requer backend próprio; uso interno |
| Deploy | Netlify | Gratuito, CI/CD automático, CDN global |

---

## 2. Estrutura de Arquivos

```
marceloteixeira/
│
├── index.html                 # Entry point HTML; title, viewport, ícone emoji
├── vite.config.js             # Vite config; dev server porta 3000, plugin React
├── tailwind.config.js         # Scan em ./src/**/*.{js,jsx}
├── postcss.config.js          # tailwindcss + autoprefixer
├── package.json               # Deps: react, recharts, lucide-react, supabase-js
├── netlify.toml               # Build: npm run build; publish: dist; SPA redirect
│
├── .env                       # [gitignored] VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .env.example               # Template com placeholders
├── .gitignore                 # node_modules, dist, .env, .env.local
│
├── supabase_schema.sql        # DDL: tabelas dashboard_data + campaign_snapshots + RLS
├── seed.mjs                   # Node.js script; popula Supabase via REST API diretamente
│
├── INICIAR.bat                # Script Windows: instala deps + inicia dev server
├── README.md                  # Instruções de uso e configuração
│
└── src/
    ├── main.jsx               # ReactDOM.createRoot; monta <Dashboard />
    ├── index.css              # @tailwind base/components/utilities
    │
    ├── Dashboard.jsx          # Componente raiz (912 linhas); toda a UI + lógica de fetch
    │
    ├── data/
    │   └── mockData.js        # DATA object completo com todas as seções
    │
    ├── hooks/
    │   └── useDashboardData.js  # Hook: fetch Supabase com fallback para mockData
    │
    └── lib/
        ├── supabase.js        # createClient; retorna null se .env não configurado
        └── seed.js            # Utilitário browser: seedDatabase() via supabase-js
```

---

## 3. Modelos de Dados

### 3.1 Tabelas Supabase

#### `dashboard_data`
```sql
create table dashboard_data (
  id         uuid        default gen_random_uuid() primary key,
  section    text        unique not null,  -- chave: period|consolidated|bm1|bm2|pdvs|topCreatives|instagram|brands
  data       jsonb       not null,         -- estrutura espelha mockData.js
  updated_at timestamptz default now()
);
```

**Seções armazenadas:** `period`, `consolidated`, `bm1`, `bm2`, `pdvs`, `topCreatives`, `instagram`, `brands`

#### `campaign_snapshots`
```sql
create table campaign_snapshots (
  id         uuid        default gen_random_uuid() primary key,
  bm         text        not null,   -- "bm1" ou "bm2"
  brand      text,                   -- "maia" ou "lider" (null = compartilhado)
  data       jsonb       not null,   -- snapshot de campanhas
  fetched_at timestamptz default now()
);
```

**RLS:** Ambas as tabelas têm `public_all` policy (acesso total sem autenticação — uso interno).

### 3.2 Estrutura do mockData (DATA object)

```javascript
DATA = {
  period: {
    current:  string,   // "07/03 – 13/03"
    previous: string    // "28/02 – 06/03"
  },

  consolidated: {
    bm1: {
      invested:     number,  // R$
      reach:        number,
      impressions:  number,
      cpm:          number,  // R$
      clicks:       number,
      campaigns:    number
    },
    bm2: {
      invested:     number,
      reach:        number,
      impressions:  number,
      contacts:     number,
      newContacts:  number,
      campaigns:    number
    },
    totalInvested:  number
  },

  bm1: {
    maia:   CampaignBM1[],
    lider:  CampaignBM1[],
    shared: CampaignBM1[]
  },

  bm2: {
    maia:  CampaignBM2[],
    lider: CampaignBM2[]
  },

  pdvs: {
    maia:  PDV[],
    lider: PDV[]
  },

  topCreatives: {
    maia:  Creative[],
    lider: Creative[]
  },

  instagram: {
    maia:  InstagramBrand,
    lider: InstagramBrand
  },

  brands: {
    maia:  BrandConfig,
    lider: BrandConfig
  }
}
```

#### Tipos

```typescript
// Campanha BM1 (conversões/vendas)
CampaignBM1 = {
  name:        string,
  result:      number,
  resultLabel: string,    // "Mensagens", "Compras", etc.
  prevResult:  number,
  varResult:   number,    // % variação
  cost:        number,    // custo por resultado
  prevCost:    number,
  varCost:     number,
  invested:    number
}

// Campanha BM2 (contatos/WhatsApp)
CampaignBM2 = {
  name:        string,
  result:      number,
  resultLabel: string,
  cost:        number,
  invested:    number
}

// PDV (ponto de venda)
PDV = {
  name:        string,
  conversions: number,
  var:         number,    // % variação
  cpm:         number,
  prevCpm:     number
}

// Criativo
Creative = {
  name:   string,
  msgs:   number,         // mensagens ou conversões
  cost:   number,         // custo por resultado
  source: string          // "BM1 Vendas", "BM2 Contatos", etc.
}

// Instagram por marca
InstagramBrand = {
  profile: {
    followers_count: number,
    follows_count:   number,
    media_count:     number,
    username:        string,
    name:            string
  },
  recentPosts: Post[],
  stories:     Story[],
  accountInsights: {
    follower_count: InsightDataPoint[],
    reach:          InsightDataPoint[],
    impressions:    InsightDataPoint[]
  }
}

Post = {
  media_type:      "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM",
  timestamp:       string,  // ISO 8601
  caption:         string,
  like_count:      number,
  comments_count:  number,
  insights: {
    reach:       number,
    impressions: number,
    saved:       number,
    shares:      number
  }
}

Story = {
  media_type: "IMAGE" | "VIDEO",
  timestamp:  string,
  insights: {
    reach:       number,
    impressions: number,
    replies:     number,
    exits:       number
  }
}

InsightDataPoint = {
  end_time: string,  // ISO 8601
  value:    number
}

BrandConfig = {
  name:        string,   // "Lojas Maia"
  handle:      string,   // "@lojasmaiaof"
  accent:      string,   // hex color
  accentLight: string    // hex color (variante clara)
}
```

---

## 4. Componentes React

Todos os componentes estão definidos em `src/Dashboard.jsx`.

### Componentes de UI Reutilizáveis

| Componente | Props | Responsabilidade |
|------------|-------|-----------------|
| `KPI` | `icon, label, value, sub, dk` | Card de métrica única com ícone, label, valor e subtítulo opcional |
| `Card` | `title, badge, children, dk` | Container com cabeçalho, badge colorido opcional e children |

### Componente Principal

| Componente | Estado | Responsabilidade |
|------------|--------|-----------------|
| `Dashboard` | Ver seção 5 | Orquestra toda a aplicação; renderiza as 7 abas |

### Funções de Utilidade (dentro de Dashboard.jsx)

| Função | Signature | Descrição |
|--------|-----------|-----------|
| `fmt` | `(n: number) => string` | Formata número: K/M para grandes, string para pequenos |
| `fmtMoney` | `(n: number) => string` | Formata moeda: `R$ 1.234,56` em pt-BR |
| `varBg` | `(v, inv, dk) => string` | Classe Tailwind para variação positiva/negativa com suporte dark mode |
| `tt` | `(dk) => object` | Estilo padrão para tooltips Recharts adaptado ao modo |

---

## 5. Gerenciamento de Estado

### Estado no Dashboard.jsx

```javascript
// UI state
const [darkMode, setDarkMode]       = useState(false)
const [activeTab, setActiveTab]     = useState('consolidated')

// Config state (persistida em localStorage)
const [config, setConfig]           = useState({
  metaToken:          '',
  bm1MaiaId:         '',
  bm1LiderId:        '',
  bm2MaiaId:         '',
  bm2LiderId:        '',
  igMaiaId:          '',
  igLiderId:         ''
})

// API state
const [igData, setIgData]           = useState({ maia: null, lider: null })
const [adsData, setAdsData]         = useState({ bm1Maia: null, bm1Lider: null, bm2Maia: null, bm2Lider: null })
const [loading, setLoading]         = useState(false)
const [apiError, setApiError]       = useState(null)
```

### Hook: `useDashboardData`

```javascript
// src/hooks/useDashboardData.js
export function useDashboardData() {
  const [data, setData]             = useState(DATA)          // inicia com mock
  const [loading, setLoading]       = useState(false)
  const [dataSource, setDataSource] = useState('mock')        // 'mock' | 'supabase'

  useEffect(() => {
    if (!supabase) return                                      // sem credenciais → mock
    // fetch dashboard_data, merge com DATA, setDataSource('supabase')
  }, [])

  return { data, loading, dataSource }
}
```

### Persistência localStorage

```javascript
// Chave: 'dashboard-config'
// Salvo: objeto config completo (tokens + IDs)
// Lido: no mount do Dashboard
```

---

## 6. Integrações de API

### Meta Graph API v19.0 — Instagram

#### `fetchInstagramData(igId, token)`

| Endpoint | Campos | Descrição |
|----------|--------|-----------|
| `GET /{igId}` | `followers_count,follows_count,media_count,username,name` | Perfil da conta |
| `GET /{igId}/media` | `media_type,timestamp,caption,like_count,comments_count` + insights subquery | Posts recentes (limit 12) |
| `GET /{igId}/stories` | `media_type,timestamp` + insights subquery | Stories ativos |
| `GET /{igId}/insights` | `metric=follower_count,reach,impressions&period=day` | Métricas da conta últimos 30 dias |

**Insights por mídia:** `reach,impressions,saved,shares` (posts) / `reach,impressions,replies,exits` (stories)

#### `fetchAdAccountData(accountId, token)`

| Endpoint | Parâmetros | Campos |
|----------|------------|--------|
| `GET /{accountId}/insights` | `date_preset=last_7d&level=campaign` | `campaign_name,spend,impressions,reach,clicks,actions` |

### Tratamento de Erros
- Erros de API são capturados e exibidos via `apiError` state
- Fallback silencioso para dados Supabase/mock se API falhar
- Token inválido → exibe mensagem orientando para a aba Config

---

## 7. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim (para Supabase) | URL do projeto Supabase. Ex: `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sim (para Supabase) | Chave pública anon do Supabase |

**Nota:** Sem essas variáveis, `supabase.js` exporta `null` e o dashboard usa mock data automaticamente.

**Configurações de API (Meta):** armazenadas em `localStorage`, não em `.env` — configuradas pelo usuário na aba Config.

---

## 8. Deploy

### Pipeline Netlify

```
Push para GitHub (main)
    ↓
Netlify detecta mudança
    ↓
Build: npm run build
    ↓
Vite gera: dist/
    ├── index.html
    ├── assets/index-[hash].js   (bundle React + dependências)
    └── assets/index-[hash].css  (Tailwind purged)
    ↓
Publish: dist/
    ↓
CDN Netlify distribui globalmente
```

### Configuração netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200   # SPA: todas as rotas servem o index.html
```

### Variáveis de Ambiente no Netlify
Configurar em **Site Settings → Environment Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Desenvolvimento Local

```bash
cp .env.example .env       # configurar credenciais Supabase
npm install
npm run dev                # http://localhost:3000
```

Ou via `INICIAR.bat` no Windows (executa os comandos acima automaticamente).
