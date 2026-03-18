import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import {
  Sun, Moon, RefreshCw, TrendingUp, TrendingDown, Users, Eye,
  BarChart3, DollarSign, Target, Layers, Store, Award,
  ArrowUpRight, ArrowDownRight, Megaphone, ShoppingBag, Zap,
  Image, Video, Heart, Bookmark, Share2, MessageCircle, Clock, Calendar,
  Settings, Key, CheckCircle, AlertCircle, Loader2, Shield, Wifi, WifiOff, ExternalLink, Copy, Trash2
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   DATA — Campanhas da apresentação Eali (07/03-13/03)
   Instagram mock alinhado com campos da Graph API
   ═══════════════════════════════════════════════════ */
const DATA = {
  period: { current: "07/03 – 13/03", previous: "28/02 – 06/03" },

  consolidated: {
    bm1: { invested: 7732.81, reach: 392395, impressions: 1127310, cpm: 6.86, clicks: 16800, campaigns: 13 },
    bm2: { invested: 2257.49, reach: 77521, impressions: 260256, contacts: 632, newContacts: 481, campaigns: 8 },
    totalInvested: 9990.30,
  },

  bm1: {
    maia: [
      { name: "Tráfego – Visitas MAIA no seu Lar", result: 1555, resultLabel: "Visitas ao perfil", prevResult: 1463, varResult: 6.29, cost: 0.18, prevCost: 0.19, varCost: -2.97, invested: 285.45 },
      { name: "Tráfego – ETAPA2 MAIA RMKT Seguidores", result: 2081, resultLabel: "Visitas ao perfil", prevResult: 2493, varResult: -16.53, cost: 0.21, prevCost: 0.20, varCost: 8.40, invested: 0 },
      { name: "Leads – LP MAIA", result: 180, resultLabel: "Contatos no site", prevResult: 196, varResult: -8.16, cost: 1.14, prevCost: 1.06, varCost: -7.58, invested: 205.07 },
      { name: "Tráfego – ETAPA1 MAIA Seguidores", result: 5262, resultLabel: "Visitas ao perfil", prevResult: 4627, varResult: 13.72, cost: 0.17, prevCost: 0.18, varCost: -4.36, invested: 886.92 },
      { name: "Engajamento – MENSAGEM MAIA Todas Lojas", result: 486, resultLabel: "Conversas", prevResult: 402, varResult: 20.90, cost: 4.52, prevCost: 5.31, varCost: -14.92, invested: 2194.37 },
    ],
    lider: [
      { name: "Tráfego – ETAPA1 LÍDER Seguidores", result: 2266, resultLabel: "Visitas ao perfil", prevResult: 1890, varResult: 19.89, cost: 0.37, prevCost: 0.35, varCost: 5.38, invested: 845.63 },
      { name: "Engajamento – MENSAGEM DIRECT LÍDER", result: 54, resultLabel: "Conversas", prevResult: 43, varResult: 25.58, cost: 5.32, prevCost: 6.13, varCost: -13.30, invested: 0 },
      { name: "Tráfego – ETAPA2 LÍDER RMKT Seguidores", result: 2341, resultLabel: "Visitas ao perfil", prevResult: 4100, varResult: -42.90, cost: 0.20, prevCost: 0.14, varCost: 49.09, invested: 0 },
      { name: "Engajamento – MENSAGEM LÍDER Todas Lojas", result: 323, resultLabel: "Conversas", prevResult: 355, varResult: -9.01, cost: 4.76, prevCost: 3.99, varCost: 19.20, invested: 1536.29 },
    ],
    shared: [
      { name: "SEMANA DO CONSUMIDOR – QUARTA MALUCA", result: 407, resultLabel: "ThruPlays", prevResult: 0, varResult: 0, cost: 0.03, prevCost: 0, varCost: 0, invested: 10.44 },
    ],
  },

  bm2: {
    maia: [
      { name: "Mensagem – MAIA Direct Grupos de Interesses", result: 3, resultLabel: "Conversas", cost: 7.00, invested: 21.00 },
      { name: "Mensagem – MAIA WhatsApp Grupos de Interesses", result: 13, resultLabel: "Conversas", cost: 3.24, invested: 42.11 },
      { name: "Mensagem – MAIA Quarta Maluca Semana Consumidor", result: 50, resultLabel: "Conversas", cost: 2.18, invested: 108.88 },
      { name: "Engajamento – MAIA LP Semana do Consumidor", result: 11, resultLabel: "Contatos no site", cost: 14.33, invested: 157.68 },
      { name: "Mensagem – MAIA WhatsApp Encarte Quarta Maluca", result: 88, resultLabel: "Conversas", cost: 3.55, invested: 312.31 },
      { name: "Mensagem – Post Feed", result: 80, resultLabel: "Conversas", cost: 3.18, invested: 254.47 },
      { name: "Engajamento – MAIA WhatsApp Encarte Março 2026", result: 260, resultLabel: "Conversas", cost: 3.62, invested: 940.21 },
    ],
    lider: [
      { name: "Engajamento – LÍDER WhatsApp Encarte Março 2026", result: 97, resultLabel: "Conversas", cost: 4.34, invested: 420.83 },
    ],
  },

  pdvs: {
    maia: [
      { name: "Centro", conversions: 189, var: 23.53, cpm: 1.46, prevCpm: 1.83 },
      { name: "Mangabeira Shopping", conversions: 22, var: 4.76, cpm: 12.85, prevCpm: 12.90 },
      { name: "Mamanguape", conversions: 67, var: 31.37, cpm: 4.17, prevCpm: 5.32 },
      { name: "Bayeux", conversions: 56, var: 16.67, cpm: 4.98, prevCpm: 5.62 },
      { name: "Santa Rita", conversions: 58, var: 16.00, cpm: 4.95, prevCpm: 5.39 },
      { name: "Loja de Josefa N° 64", conversions: 29, var: 7.41, cpm: 9.90, prevCpm: 9.92 },
      { name: "Loja de Josefa N° 401", conversions: 21, var: 5.00, cpm: 13.29, prevCpm: 13.81 },
      { name: "Cabedelo", conversions: 44, var: 37.50, cpm: 5.11, prevCpm: 7.12 },
    ],
    lider: [
      { name: "Tambaú", conversions: 102, var: -21.54, cpm: 2.71, prevCpm: 2.15 },
      { name: "Plumas Colchões Mangabeira", conversions: 37, var: 428.57, cpm: 6.21, prevCpm: 19.64 },
      { name: "Centro", conversions: 64, var: -36.63, cpm: 4.32, prevCpm: 2.80 },
      { name: "Cabedelo", conversions: 27, var: -3.57, cpm: 7.36, prevCpm: 5.65 },
      { name: "Select Manaíra (JP)", conversions: 63, var: -7.35, cpm: 4.50, prevCpm: 4.05 },
      { name: "Mangabeira 1", conversions: 30, var: 42.86, cpm: 9.11, prevCpm: 13.53 },
    ],
  },

  topCreatives: {
    maia: [
      { name: "MAIA Centro – Liquidação", msgs: 186, cost: 1.47, source: "BM1 Vendas" },
      { name: "Cozinha Monique", msgs: 58, cost: 3.67, source: "BM2 Encarte" },
      { name: "Roupeiro Beija Flor", msgs: 44, cost: 3.48, source: "BM2 Encarte" },
      { name: "Roupeiro Melissa", msgs: 43, cost: 4.11, source: "BM2 Encarte" },
    ],
    lider: [
      { name: "Líder Tambaú – Colchão", msgs: 96, cost: 2.72, source: "BM1 Vendas" },
      { name: "Líder Manaíra – Colchão Galaxy", msgs: 52, cost: 4.63, source: "BM1 Vendas" },
    ],
  },

  /* Instagram — campos que a Graph API retorna:
     Profile: followers_count, follows_count, media_count, username, name
     Media: id, caption, media_type, timestamp, like_count, comments_count
     Media Insights: reach, impressions, saved, shares (por post)
     Stories: id, media_type, timestamp + insights (reach, impressions, replies, exits)
     Account Insights: follower_count, reach, impressions (por dia) */
  instagram: {
    maia: {
      profile: { followers_count: 28430, follows_count: 1250, media_count: 1842, username: "lojasmaiaof", name: "Lojas Maia" },
      recentPosts: [
        { media_type: "CAROUSEL_ALBUM", timestamp: "2026-03-13T09:15:00", caption: "Semana do Consumidor — até 50% OFF em móveis selecionados", like_count: 342, comments_count: 28, insights: { reach: 4820, impressions: 6100, saved: 67, shares: 15 } },
        { media_type: "VIDEO", timestamp: "2026-03-13T14:30:00", caption: "Tour pela loja Centro — novidades de março", like_count: 891, comments_count: 64, insights: { reach: 12400, impressions: 18200, saved: 123, shares: 42 } },
        { media_type: "IMAGE", timestamp: "2026-03-12T10:00:00", caption: "Roupeiro Melissa com espelho — parcele em 12x sem juros", like_count: 198, comments_count: 12, insights: { reach: 3200, impressions: 4100, saved: 34, shares: 8 } },
        { media_type: "VIDEO", timestamp: "2026-03-11T16:00:00", caption: "Montagem completa da Cozinha Monique — veja o resultado!", like_count: 1240, comments_count: 87, insights: { reach: 15600, impressions: 22400, saved: 198, shares: 67 } },
        { media_type: "CAROUSEL_ALBUM", timestamp: "2026-03-10T09:30:00", caption: "5 dicas para escolher o sofá perfeito para sua sala", like_count: 456, comments_count: 31, insights: { reach: 5800, impressions: 7200, saved: 89, shares: 23 } },
        { media_type: "IMAGE", timestamp: "2026-03-09T11:00:00", caption: "Mesa de jantar 6 lugares — promoção válida até sábado", like_count: 167, comments_count: 9, insights: { reach: 2900, impressions: 3800, saved: 22, shares: 5 } },
      ],
      stories: [
        { media_type: "IMAGE", timestamp: "2026-03-13T08:00:00", insights: { reach: 1240, impressions: 1580, replies: 8, exits: 120 } },
        { media_type: "VIDEO", timestamp: "2026-03-13T10:20:00", insights: { reach: 980, impressions: 1340, replies: 12, exits: 98 } },
        { media_type: "IMAGE", timestamp: "2026-03-13T12:00:00", insights: { reach: 1180, impressions: 1490, replies: 245, exits: 85 } },
        { media_type: "IMAGE", timestamp: "2026-03-13T15:45:00", insights: { reach: 890, impressions: 1120, replies: 6, exits: 145 } },
        { media_type: "VIDEO", timestamp: "2026-03-13T18:30:00", insights: { reach: 760, impressions: 980, replies: 4, exits: 92 } },
      ],
      accountInsights: {
        follower_count: [{ end_time: "2026-03-07", value: 27980 }, { end_time: "2026-03-08", value: 28040 }, { end_time: "2026-03-09", value: 28120 }, { end_time: "2026-03-10", value: 28190 }, { end_time: "2026-03-11", value: 28270 }, { end_time: "2026-03-12", value: 28350 }, { end_time: "2026-03-13", value: 28430 }],
        reach: [{ end_time: "2026-03-07", value: 4200 }, { end_time: "2026-03-08", value: 5100 }, { end_time: "2026-03-09", value: 3800 }, { end_time: "2026-03-10", value: 6200 }, { end_time: "2026-03-11", value: 8400 }, { end_time: "2026-03-12", value: 4600 }, { end_time: "2026-03-13", value: 7800 }],
        impressions: [{ end_time: "2026-03-07", value: 5800 }, { end_time: "2026-03-08", value: 7200 }, { end_time: "2026-03-09", value: 5100 }, { end_time: "2026-03-10", value: 8900 }, { end_time: "2026-03-11", value: 12400 }, { end_time: "2026-03-12", value: 6300 }, { end_time: "2026-03-13", value: 11200 }],
      },
    },
    lider: {
      profile: { followers_count: 19870, follows_count: 890, media_count: 1456, username: "lidercolchoes", name: "Líder Colchões" },
      recentPosts: [
        { media_type: "IMAGE", timestamp: "2026-03-13T10:00:00", caption: "Colchão Galaxy — tecnologia de molas ensacadas para seu sono perfeito", like_count: 256, comments_count: 19, insights: { reach: 3640, impressions: 4800, saved: 45, shares: 8 } },
        { media_type: "VIDEO", timestamp: "2026-03-12T14:00:00", caption: "Teste de conforto: Galaxy vs espuma convencional", like_count: 678, comments_count: 42, insights: { reach: 9800, impressions: 14200, saved: 112, shares: 34 } },
        { media_type: "CAROUSEL_ALBUM", timestamp: "2026-03-11T09:00:00", caption: "Guia completo: como escolher o colchão ideal para você", like_count: 389, comments_count: 27, insights: { reach: 5400, impressions: 7100, saved: 156, shares: 41 } },
        { media_type: "IMAGE", timestamp: "2026-03-10T11:30:00", caption: "Promoção Select Manaíra — colchões com até 40% OFF", like_count: 145, comments_count: 8, insights: { reach: 2800, impressions: 3600, saved: 18, shares: 4 } },
        { media_type: "VIDEO", timestamp: "2026-03-09T16:00:00", caption: "Bastidores da fábrica — como seu colchão é produzido", like_count: 920, comments_count: 56, insights: { reach: 11200, impressions: 16800, saved: 87, shares: 52 } },
      ],
      stories: [
        { media_type: "IMAGE", timestamp: "2026-03-13T08:30:00", insights: { reach: 820, impressions: 1040, replies: 5, exits: 88 } },
        { media_type: "VIDEO", timestamp: "2026-03-13T11:00:00", insights: { reach: 1050, impressions: 1380, replies: 18, exits: 72 } },
        { media_type: "IMAGE", timestamp: "2026-03-13T16:00:00", insights: { reach: 940, impressions: 1200, replies: 312, exits: 65 } },
      ],
      accountInsights: {
        follower_count: [{ end_time: "2026-03-07", value: 19580 }, { end_time: "2026-03-08", value: 19620 }, { end_time: "2026-03-09", value: 19670 }, { end_time: "2026-03-10", value: 19720 }, { end_time: "2026-03-11", value: 19770 }, { end_time: "2026-03-12", value: 19820 }, { end_time: "2026-03-13", value: 19870 }],
        reach: [{ end_time: "2026-03-07", value: 3100 }, { end_time: "2026-03-08", value: 3600 }, { end_time: "2026-03-09", value: 4800 }, { end_time: "2026-03-10", value: 3200 }, { end_time: "2026-03-11", value: 5900 }, { end_time: "2026-03-12", value: 4100 }, { end_time: "2026-03-13", value: 3800 }],
        impressions: [{ end_time: "2026-03-07", value: 4200 }, { end_time: "2026-03-08", value: 4900 }, { end_time: "2026-03-09", value: 6700 }, { end_time: "2026-03-10", value: 4400 }, { end_time: "2026-03-11", value: 8200 }, { end_time: "2026-03-12", value: 5600 }, { end_time: "2026-03-13", value: 5200 }],
      },
    },
  },

  brands: {
    maia: { name: "Lojas Maia", handle: "@lojasmaiaof", accent: "#f59e0b", accentLight: "#fbbf24" },
    lider: { name: "Líder Colchões", handle: "@lidercolchoes", accent: "#6366f1", accentLight: "#818cf8" },
  },
};

/* ═══ INSTAGRAM GRAPH API ═══ */
async function fetchInstagramData(token, igId) {
  const BASE = "https://graph.facebook.com/v19.0";

  // 1. Perfil
  const profile = await fetch(
    `${BASE}/${igId}?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${token}`
  ).then(r => r.json());
  if (profile.error) throw new Error(profile.error.message);

  // 2. Posts recentes
  const media = await fetch(
    `${BASE}/${igId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=15&access_token=${token}`
  ).then(r => r.json());
  if (media.error) throw new Error(media.error.message);

  // 3. Insights por post
  const recentPosts = await Promise.all((media.data || []).map(async (post) => {
    try {
      const raw = await fetch(
        `${BASE}/${post.id}/insights?metric=reach,impressions,saved,shares&access_token=${token}`
      ).then(r => r.json());
      // { data: [{ name: "reach", values: [{ value: 123 }] }, ...] }
      const insights = {};
      (raw.data || []).forEach(m => { insights[m.name] = m.values?.[0]?.value ?? 0; });
      return { ...post, insights };
    } catch {
      return { ...post, insights: { reach: 0, impressions: 0, saved: 0, shares: 0 } };
    }
  }));

  // 4. Stories
  let stories = [];
  try {
    const storiesRaw = await fetch(
      `${BASE}/${igId}/stories?fields=id,media_type,timestamp&access_token=${token}`
    ).then(r => r.json());
    stories = await Promise.all((storiesRaw.data || []).map(async (story) => {
      try {
        const raw = await fetch(
          `${BASE}/${story.id}/insights?metric=reach,impressions,replies,exits&access_token=${token}`
        ).then(r => r.json());
        const insights = {};
        (raw.data || []).forEach(m => { insights[m.name] = m.values?.[0]?.value ?? 0; });
        return { ...story, insights };
      } catch {
        return { ...story, insights: { reach: 0, impressions: 0, replies: 0, exits: 0 } };
      }
    }));
  } catch {}

  // 5. Insights da conta (últimos 7 dias)
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceStr = since.toISOString().split("T")[0];
  const untilStr = new Date().toISOString().split("T")[0];
  let accountInsightsRaw = { data: [] };
  try {
    accountInsightsRaw = await fetch(
      `${BASE}/${igId}/insights?metric=follower_count,reach,impressions&period=day&since=${sinceStr}&until=${untilStr}&access_token=${token}`
    ).then(r => r.json());
  } catch {}

  // Montar accountInsights no formato dos gráficos
  const insightMap = { follower_count: [], reach: [], impressions: [] };
  (accountInsightsRaw.data || []).forEach(metric => {
    if (insightMap[metric.name] !== undefined) {
      insightMap[metric.name] = (metric.values || []).map(v => ({ end_time: v.end_time, value: v.value }));
    }
  });

  return { profile, recentPosts, stories, accountInsights: insightMap };
}

/* ═══ META ADS API ═══ */
const BASE_URL = "https://graph.facebook.com/v19.0";

async function metaFetch(endpoint, params, token) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

function getMainAction(actionsArr = []) {
  const priority = [
    "onsite_conversion.messaging_conversation_started_7d",
    "onsite_conversion.messaging_first_reply",
    "link_click", "post_engagement",
  ];
  for (const type of priority) {
    const found = actionsArr.find(a => a.action_type === type);
    if (found) return parseInt(found.value || 0);
  }
  return actionsArr.reduce((s, a) => s + parseInt(a.value || 0), 0);
}

async function fetchAdAccountData(adAccountId, token) {
  let summary = {};
  try {
    const d = await metaFetch(`/${adAccountId}/insights`, {
      fields: "spend,impressions,reach,clicks,cpm,cpc,ctr,actions",
      date_preset: "last_7d",
    }, token);
    summary = d.data?.[0] || {};
  } catch {}

  let campaigns = [];
  try {
    const d = await metaFetch(`/${adAccountId}/campaigns`, {
      fields: "id,name,status,objective,insights.date_preset(last_7d){spend,impressions,reach,clicks,cpm,cpc,ctr,actions,cost_per_action_type}",
      filtering: JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE", "PAUSED"] }]),
      limit: "50",
    }, token);
    campaigns = d.data || [];
  } catch {}

  return { summary, campaigns };
}

function transformBM1Campaigns(campaigns) {
  return campaigns
    .filter(c => c.insights?.data?.length)
    .map(c => {
      const ins = c.insights.data[0];
      const actions = getMainAction(ins.actions || []);
      const clicks = parseInt(ins.clicks || 0);
      const result = actions || clicks;
      const cost = result > 0 ? parseFloat((parseFloat(ins.spend || 0) / result).toFixed(2)) : 0;
      return {
        name: c.name,
        result,
        resultLabel: actions ? "Conversas/Ações" : "Cliques",
        prevResult: null, varResult: null,
        cost, prevCost: null, varCost: null,
        invested: parseFloat(parseFloat(ins.spend || 0).toFixed(2)),
      };
    });
}

function transformBM2Campaigns(campaigns) {
  return campaigns
    .filter(c => c.insights?.data?.length)
    .map(c => {
      const ins = c.insights.data[0];
      const result = getMainAction(ins.actions || []) || parseInt(ins.clicks || 0);
      const cost = result > 0 ? parseFloat((parseFloat(ins.spend || 0) / result).toFixed(2)) : 0;
      return {
        name: c.name,
        result,
        resultLabel: "Conversas",
        cost,
        invested: parseFloat(parseFloat(ins.spend || 0).toFixed(2)),
      };
    });
}

/* ═══ UTILS ═══ */
const fmt = (n) => !n ? "0" : n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
const fmtMoney = (n) => "R$ " + (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const varBg = (v, inv, dk) => { const p = inv ? v <= 0 : v >= 0; return p ? (dk ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"); };
const tt = (dk) => ({ contentStyle: { background: dk ? "#1c1c1e" : "#fff", border: `1px solid ${dk ? "#333" : "#e4e4e7"}`, borderRadius: 12, fontSize: 11, boxShadow: "0 8px 32px rgba(0,0,0,.15)" } });

/* ═══ SHARED COMPONENTS ═══ */
function KPI({ icon: Icon, label, value, sub, accent, dark: dk }) {
  return (
    <div className={`group relative rounded-2xl p-4 transition-all overflow-hidden ${dk ? "bg-zinc-800/50 border-zinc-700/40 hover:bg-zinc-800/80" : "bg-white border-zinc-200/60 hover:shadow-lg"} border`}>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-[0.04] -translate-y-4 translate-x-4" style={{ background: accent }} />
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-medium tracking-wider uppercase ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
        <div className="p-1.5 rounded-lg" style={{ background: (accent || "#888") + "14" }}><Icon size={13} style={{ color: accent }} /></div>
      </div>
      <div className={`text-xl font-semibold tracking-tight ${dk ? "text-zinc-50" : "text-zinc-900"}`}>{value}</div>
      {sub && <div className={`text-[11px] mt-1 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</div>}
    </div>
  );
}
function Card({ title, badge, children, dark: dk }) {
  return (
    <div className={`rounded-2xl p-5 ${dk ? "bg-zinc-800/50 border-zinc-700/40" : "bg-white border-zinc-200/60"} border`}>
      {(title || badge) && <div className="flex items-center justify-between mb-4">{title && <h3 className={`text-sm font-medium ${dk ? "text-zinc-300" : "text-zinc-700"}`}>{title}</h3>}{badge && <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${dk ? "bg-zinc-700/60 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>{badge}</span>}</div>}
      {children}
    </div>
  );
}
function VarBadge({ value, inverted, dark: dk }) {
  if (!value) return null;
  const p = inverted ? value <= 0 : value >= 0;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${varBg(value, inverted, dk)}`}>{p ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{value >= 0 ? "+" : ""}{value.toFixed(2)}%</span>;
}
function BM1Table({ campaigns, dark: dk, title, period }) {
  return (<Card title={title} badge={period || `${DATA.period.current} vs ${DATA.period.previous}`} dark={dk}><div className="overflow-x-auto -mx-2"><table className="w-full text-xs min-w-[700px]"><thead><tr className={`${dk ? "text-zinc-500 border-zinc-700/50" : "text-zinc-400 border-zinc-200"} border-b`}><th className="py-2.5 px-3 text-left font-medium">Campanha</th><th className="py-2.5 px-2 text-right font-medium">Resultado</th><th className="py-2.5 px-2 text-right font-medium">Anterior</th><th className="py-2.5 px-2 text-center font-medium">Var.</th><th className="py-2.5 px-2 text-right font-medium">Custo</th><th className="py-2.5 px-2 text-right font-medium">Ant.</th><th className="py-2.5 px-2 text-center font-medium">Var.</th></tr></thead><tbody>{campaigns.map((c, i) => (<tr key={i} className={`${dk ? "border-zinc-800 hover:bg-zinc-700/20" : "border-zinc-100 hover:bg-zinc-50"} border-b transition-colors`}><td className="py-3 px-3"><div className={`font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{c.name}</div><div className={`text-[10px] mt-0.5 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{c.resultLabel}</div></td><td className={`py-3 px-2 text-right font-semibold ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{c.result.toLocaleString("pt-BR")}</td><td className={`py-3 px-2 text-right ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{c.prevResult ? c.prevResult.toLocaleString("pt-BR") : "—"}</td><td className="py-3 px-2 text-center"><VarBadge value={c.varResult} dark={dk} /></td><td className={`py-3 px-2 text-right font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmtMoney(c.cost)}</td><td className={`py-3 px-2 text-right ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{c.prevCost ? fmtMoney(c.prevCost) : "—"}</td><td className="py-3 px-2 text-center"><VarBadge value={c.varCost} inverted dark={dk} /></td></tr>))}</tbody></table></div></Card>);
}
function BM2Table({ campaigns, dark: dk, title }) {
  return (<Card title={title} badge={`${campaigns.length} campanhas`} dark={dk}><div className={`text-[11px] mb-4 px-3 py-2 rounded-lg inline-flex items-center gap-2 ${dk ? "bg-amber-500/8 text-amber-300/80" : "bg-amber-50 text-amber-700"}`}><ShoppingBag size={12} /> Conversões → GoHighLevel (CRM)</div><div className="overflow-x-auto -mx-2"><table className="w-full text-xs min-w-[500px]"><thead><tr className={`${dk ? "text-zinc-500 border-zinc-700/50" : "text-zinc-400 border-zinc-200"} border-b`}><th className="py-2.5 px-3 text-left font-medium">Campanha</th><th className="py-2.5 px-2 text-right font-medium">Resultado</th><th className="py-2.5 px-2 text-right font-medium">CPL</th><th className="py-2.5 px-2 text-right font-medium">Investido</th></tr></thead><tbody>{campaigns.map((c, i) => (<tr key={i} className={`${dk ? "border-zinc-800 hover:bg-zinc-700/20" : "border-zinc-100 hover:bg-zinc-50"} border-b transition-colors`}><td className="py-3 px-3"><div className={`font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{c.name}</div><div className={`text-[10px] mt-0.5 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{c.resultLabel}</div></td><td className={`py-3 px-2 text-right font-semibold ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{c.result}</td><td className={`py-3 px-2 text-right font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmtMoney(c.cost)}</td><td className={`py-3 px-2 text-right ${dk ? "text-zinc-300" : "text-zinc-600"}`}>{fmtMoney(c.invested)}</td></tr>))}</tbody><tfoot><tr className={`${dk ? "border-zinc-700/50 text-zinc-200" : "border-zinc-200 text-zinc-700"} border-t font-semibold`}><td className="py-3 px-3">Total</td><td className="py-3 px-2 text-right">{campaigns.reduce((s, c) => s + c.result, 0)}</td><td className="py-3 px-2 text-right">—</td><td className="py-3 px-2 text-right">{fmtMoney(campaigns.reduce((s, c) => s + c.invested, 0))}</td></tr></tfoot></table></div></Card>);
}
function PDVGrid({ pdvs, accent, dark: dk }) {
  const sorted = [...pdvs].sort((a, b) => b.conversions - a.conversions);
  const mx = Math.max(...sorted.map(p => p.conversions), 1);
  return (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">{sorted.map((p, i) => (<div key={i} className={`rounded-xl p-4 ${dk ? "bg-zinc-900/40" : "bg-zinc-50/80"} relative overflow-hidden`}><div className="absolute bottom-0 left-0 h-1 rounded-full" style={{ width: `${(p.conversions / mx) * 100}%`, background: accent, opacity: 0.5 }} /><div className="flex items-start justify-between mb-2"><div><div className={`text-xs font-semibold ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{p.name}</div><div className={`text-2xl font-bold mt-1 ${dk ? "text-zinc-50" : "text-zinc-900"}`}>{p.conversions} <span className={`text-xs font-normal ${dk ? "text-zinc-500" : "text-zinc-400"}`}>conv.</span></div></div><VarBadge value={p.var} dark={dk} /></div><div className="flex gap-4 mt-2"><div className={`text-[11px] ${dk ? "text-zinc-400" : "text-zinc-500"}`}>CPM: <span className="font-medium">{fmtMoney(p.cpm)}</span></div><div className={`text-[11px] ${dk ? "text-zinc-500" : "text-zinc-400"}`}>ant: {fmtMoney(p.prevCpm)}</div></div></div>))}</div>);
}
function CreativesList({ creatives, accent, accentLight, dark: dk }) {
  return (<div className="space-y-3">{creatives.map((c, i) => (<div key={i} className={`flex items-center gap-4 rounded-xl p-4 ${dk ? "bg-zinc-900/40" : "bg-zinc-50/80"}`}><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})` }}>{i + 1}</div><div className="flex-1 min-w-0"><div className={`text-sm font-medium truncate ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{c.name}</div><div className={`text-[11px] ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{c.source}</div></div><div className="text-right flex-shrink-0"><div className={`text-sm font-semibold ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{c.msgs} msgs</div><div className={`text-[11px] ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{fmtMoney(c.cost)}/msg</div></div></div>))}</div>);
}

/* ═══ TAB 1: CONSOLIDADO ═══ */
function ConsolidatedView({ dark: dk, liveData, loading, error }) {
  const c = liveData?.consolidated || DATA.consolidated;
  return (<div className="space-y-5">
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className={`rounded-2xl p-5 text-center ${dk ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20" : "bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200"} border`}><div className={`text-[10px] uppercase tracking-wider mb-1 ${dk ? "text-zinc-400" : "text-zinc-500"}`}>Total geral investido {liveData ? "(últimos 7 dias)" : "na semana"}</div><div className={`text-3xl font-bold tracking-tight ${dk ? "text-emerald-400" : "text-emerald-700"}`}>{fmtMoney(c.totalInvested)}</div><div className={`text-xs mt-1 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{liveData ? "API conectada" : DATA.period.current} · BM1 + BM2</div></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><KPI dark={dk} icon={DollarSign} label="BM1 Investido" value={fmtMoney(c.bm1.invested)} sub="Topo de funil" accent="#10b981" /><KPI dark={dk} icon={DollarSign} label="BM2 Investido" value={fmtMoney(c.bm2.invested)} sub="Conversão CRM" accent="#f59e0b" /><KPI dark={dk} icon={Eye} label="Alcance total" value={fmt(c.bm1.reach + c.bm2.reach)} sub="BM1 + BM2" accent="#06b6d4" /><KPI dark={dk} icon={Target} label="Novos contatos" value={String(c.bm2.newContacts)} sub="Via GoHighLevel" accent="#8b5cf6" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="BM1 — Topo + Meio de funil" badge={`${c.bm1.campaigns} campanhas`} dark={dk}><div className="grid grid-cols-2 gap-3">{[{ l: "Alcance", v: fmt(c.bm1.reach) }, { l: "Impressões", v: fmt(c.bm1.impressions) }, { l: "CPM médio", v: fmtMoney(c.bm1.cpm) }, { l: "Cliques", v: fmt(c.bm1.clicks) }].map(m => (<div key={m.l} className={`rounded-xl p-3 ${dk ? "bg-zinc-900/50" : "bg-zinc-50"}`}><div className={`text-[10px] uppercase tracking-wider ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{m.l}</div><div className={`text-base font-semibold mt-1 ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{m.v}</div></div>))}</div></Card>
      <Card title="BM2 — Fundo de funil (CRM)" badge={`${c.bm2.campaigns} campanhas`} dark={dk}><div className="grid grid-cols-2 gap-3">{[{ l: "Alcance", v: fmt(c.bm2.reach) }, { l: "Impressões", v: fmt(c.bm2.impressions) }, { l: "Total contatos", v: String(c.bm2.contacts) }, { l: "Novos contatos", v: String(c.bm2.newContacts) }].map(m => (<div key={m.l} className={`rounded-xl p-3 ${dk ? "bg-zinc-900/50" : "bg-zinc-50"}`}><div className={`text-[10px] uppercase tracking-wider ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{m.l}</div><div className={`text-base font-semibold mt-1 ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{m.v}</div></div>))}</div></Card>
    </div>
    <Card title="Investimento por BM × Marca" dark={dk}><ResponsiveContainer width="100%" height={160}><BarChart data={[{ name: "BM1", "Lojas Maia": 3571.81, "Líder Colchões": 4161.00 }, { name: "BM2", "Lojas Maia": 1836.66, "Líder Colchões": 420.83 }]} layout="vertical" barGap={4}><CartesianGrid strokeDasharray="3 3" stroke={dk ? "#27272a" : "#f4f4f5"} horizontal={false} /><XAxis type="number" tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dk ? "#71717a" : "#a1a1aa", fontWeight: 500 }} axisLine={false} tickLine={false} width={40} /><Tooltip {...tt(dk)} formatter={v => fmtMoney(v)} /><Bar dataKey="Lojas Maia" fill="#f59e0b" radius={[0, 6, 6, 0]} opacity={0.85} /><Bar dataKey="Líder Colchões" fill="#6366f1" radius={[0, 6, 6, 0]} opacity={0.85} /><Legend wrapperStyle={{ fontSize: 11 }} /></BarChart></ResponsiveContainer></Card>
  </div>);
}

/* ═══ TAB 2/3: BRAND VIEW ═══ */
function BrandView({ brandKey, dark: dk, liveData }) {
  const brand = DATA.brands[brandKey];
  const [sub, setSub] = useState("bm1");
  const isLive = !!liveData;
  const bm1Campaigns = isLive ? (liveData.bm1Campaigns || []) : DATA.bm1[brandKey];
  const bm2Campaigns = isLive ? (liveData.bm2Campaigns || []) : DATA.bm2[brandKey];
  const period = isLive ? "Últimos 7 dias" : undefined;
  return (<div className="space-y-5">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg" style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentLight})` }}>{brand.name.charAt(0)}</div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>{brand.name}</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{brand.handle} · BM1 + BM2 · {isLive ? "Últimos 7 dias" : DATA.period.current}</span></div></div>
    <div className={`inline-flex rounded-xl p-1 flex-wrap gap-1 ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{[{ id: "bm1", label: "BM1 Topo", icon: Megaphone }, { id: "bm2", label: "BM2 CRM", icon: ShoppingBag }, { id: "pdvs", label: "PDVs", icon: Store }, { id: "criativos", label: "Criativos", icon: Award }].map(t => (<button key={t.id} onClick={() => setSub(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${sub === t.id ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><t.icon size={12} />{t.label}</button>))}</div>
    {sub === "bm1" && <BM1Table campaigns={bm1Campaigns} dark={dk} title={`BM1 — ${brand.name}`} period={period} />}
    {sub === "bm2" && <BM2Table campaigns={bm2Campaigns} dark={dk} title={`BM2 — ${brand.name}`} />}
    {sub === "pdvs" && <Card title={`PDVs — ${brand.name}`} badge={`${DATA.period.current} vs anterior`} dark={dk}><PDVGrid pdvs={DATA.pdvs[brandKey]} accent={brand.accent} dark={dk} /></Card>}
    {sub === "criativos" && <Card title={`Criativos — ${brand.name}`} dark={dk}><CreativesList creatives={DATA.topCreatives[brandKey]} accent={brand.accent} accentLight={brand.accentLight} dark={dk} /></Card>}
  </div>);
}

/* ═══ TAB 4: BM1 ═══ */
function BM1View({ dark: dk, liveData, loading, error }) {
  const isLive = !!liveData;
  const bm1 = isLive ? liveData.bm1Summary : DATA.consolidated.bm1;
  const maiaCampaigns = isLive ? (liveData.bm1MaiaCampaigns || []) : DATA.bm1.maia;
  const liderCampaigns = isLive ? (liveData.bm1LiderCampaigns || []) : DATA.bm1.lider;
  const period = isLive ? "Últimos 7 dias" : undefined;
  return (<div className="space-y-5">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}><Megaphone size={18} /></div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>BM1 — Topo de funil</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>Tráfego · Seguidores · Direct · Engajamento · {isLive ? "Dados reais" : "Demo"}</span></div></div>
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><KPI dark={dk} icon={DollarSign} label="Investido" value={fmtMoney(bm1?.invested ?? DATA.consolidated.bm1.invested)} accent="#10b981" /><KPI dark={dk} icon={Eye} label="Alcance" value={fmt(bm1?.reach ?? DATA.consolidated.bm1.reach)} accent="#06b6d4" /><KPI dark={dk} icon={Zap} label="Impressões" value={fmt(bm1?.impressions ?? DATA.consolidated.bm1.impressions)} accent="#8b5cf6" /><KPI dark={dk} icon={DollarSign} label="CPM médio" value={fmtMoney(bm1?.cpm ?? DATA.consolidated.bm1.cpm)} accent="#f59e0b" /></div>
    {maiaCampaigns.length > 0 && <BM1Table campaigns={maiaCampaigns} dark={dk} title="Lojas Maia — BM1" period={period} />}
    {liderCampaigns.length > 0 && <BM1Table campaigns={liderCampaigns} dark={dk} title="Líder Colchões — BM1" period={period} />}
    {!isLive && DATA.bm1.shared.length > 0 && <BM1Table campaigns={DATA.bm1.shared} dark={dk} title="Compartilhadas — BM1" />}
  </div>);
}

/* ═══ TAB 5: BM2 ═══ */
function BM2View({ dark: dk, liveData, loading, error }) {
  const isLive = !!liveData;
  const bm2 = isLive ? liveData.bm2Summary : DATA.consolidated.bm2;
  const maiaCampaigns = isLive ? (liveData.bm2MaiaCampaigns || []) : DATA.bm2.maia;
  const liderCampaigns = isLive ? (liveData.bm2LiderCampaigns || []) : DATA.bm2.lider;
  return (<div className="space-y-5">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}><ShoppingBag size={18} /></div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>BM2 — Conversão CRM</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>WhatsApp · Encarte · LP · GoHighLevel · {isLive ? "Dados reais" : "Demo"}</span></div></div>
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><KPI dark={dk} icon={DollarSign} label="Investido" value={fmtMoney(bm2?.invested ?? DATA.consolidated.bm2.invested)} accent="#f59e0b" /><KPI dark={dk} icon={Eye} label="Alcance" value={fmt(bm2?.reach ?? DATA.consolidated.bm2.reach)} accent="#06b6d4" /><KPI dark={dk} icon={Target} label="Total contatos" value={String(bm2?.contacts ?? DATA.consolidated.bm2.contacts)} accent="#8b5cf6" /><KPI dark={dk} icon={Users} label="Novos contatos" value={String(bm2?.newContacts ?? DATA.consolidated.bm2.newContacts)} accent="#10b981" /></div>
    {maiaCampaigns.length > 0 && <BM2Table campaigns={maiaCampaigns} dark={dk} title="Lojas Maia — BM2" />}
    {liderCampaigns.length > 0 && <BM2Table campaigns={liderCampaigns} dark={dk} title="Líder Colchões — BM2" />}
  </div>);
}

/* ═══ TAB 6: INSTAGRAM ═══ */
function InstagramView({ dark: dk, apiConfig }) {
  const [account, setAccount] = useState("maia");
  const [liveData, setLiveData] = useState({ maia: null, lider: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const igIdForAccount = (acc) =>
    acc === "maia" ? apiConfig?.igMaiaId : apiConfig?.igLiderId;

  const isLive = !!(apiConfig?.token && igIdForAccount(account));

  const fetchData = useCallback(async (acc) => {
    const igId = acc === "maia" ? apiConfig?.igMaiaId : apiConfig?.igLiderId;
    if (!apiConfig?.token || !igId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchInstagramData(apiConfig.token, igId);
      setLiveData(prev => ({ ...prev, [acc]: data }));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [apiConfig]);

  // Re-fetch sempre que a conta selecionada ou a config mudar
  useEffect(() => {
    if (!apiConfig?.token || !igIdForAccount(account)) return;
    setLiveData({ maia: null, lider: null });
    setError("");
    fetchData(account);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, apiConfig?.token, apiConfig?.igMaiaId, apiConfig?.igLiderId]);

  const brand = DATA.brands[account];
  const ig = (isLive && liveData[account]) ? liveData[account] : (!isLive ? DATA.instagram[account] : null);
  const posts = ig?.recentPosts ?? [];
  const stories = ig?.stories ?? [];
  const profile = ig?.profile ?? {};

  const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);
  const totalSaves = posts.reduce((s, p) => s + (p.insights?.saved || 0), 0);
  const totalReach = posts.reduce((s, p) => s + (p.insights?.reach || 0), 0);
  const totalStoryReach = stories.reduce((s, st) => s + (st.insights?.reach || 0), 0);
  const totalStoryReplies = stories.reduce((s, st) => s + (st.insights?.replies || 0), 0);

  const followersChart = (ig?.accountInsights?.follower_count ?? []).map(d => ({ date: new Date(d.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: d.value }));
  const reachChart = (ig?.accountInsights?.reach ?? []).map(d => ({ date: new Date(d.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: d.value }));
  const impressionsChart = (ig?.accountInsights?.impressions ?? []).map(d => ({ date: new Date(d.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: d.value }));

  return (<div className="space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #E1306C, #F77737)" }}><Image size={18} /></div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>Fiscalização Instagram</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{isLive ? "Dados em tempo real via Graph API" : "Dados de demonstração — configure o token em Configurações"}</span></div></div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${isLive ? (dk ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (dk ? "bg-zinc-700 text-zinc-400" : "bg-zinc-200 text-zinc-500")}`}>
          {isLive ? <><Wifi size={9} /> API conectada</> : <><WifiOff size={9} /> Demo</>}
        </span>
        {isLive && (
          <button onClick={() => fetchData(account)} disabled={loading} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${dk ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"}`}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Carregando..." : "Atualizar dados"}
          </button>
        )}
        <div className={`inline-flex rounded-xl p-1 ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{["maia", "lider"].map(k => (<button key={k} onClick={() => setAccount(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-medium transition-all ${account === k ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><div className="w-3 h-3 rounded" style={{ background: DATA.brands[k].accent }} />{DATA.brands[k].handle}</button>))}</div>
      </div>
    </div>

    {loading && (
      <div className={`flex items-center gap-2 p-4 rounded-2xl text-sm ${dk ? "bg-zinc-800/50 text-zinc-400 border-zinc-700/40" : "bg-white text-zinc-500 border-zinc-200/60"} border`}>
        <Loader2 size={15} className="animate-spin text-emerald-500" />
        Buscando dados reais via Graph API...
      </div>
    )}
    {error && (
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}>
        <AlertCircle size={14} /> {error}
      </div>
    )}
    {!ig && !loading && !error && (
      <div className={`p-4 rounded-2xl text-sm text-center ${dk ? "bg-zinc-800/50 text-zinc-500 border-zinc-700/40" : "bg-white text-zinc-400 border-zinc-200/60"} border`}>
        Nenhum dado disponível. Verifique se o token e os IDs do Instagram estão configurados.
      </div>
    )}

    {/* Profile KPIs — instagram_basic */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI dark={dk} icon={Users} label="Seguidores" value={fmt(profile.followers_count)} sub={`${fmt(profile.follows_count)} seguindo`} accent={brand.accent} />
      <KPI dark={dk} icon={Image} label="Total de posts" value={fmt(profile.media_count)} accent="#f59e0b" />
      <KPI dark={dk} icon={Video} label="Stories ativos" value={String(stories.length)} sub="Últimas 24h" accent="#ec4899" />
      <KPI dark={dk} icon={Eye} label="Alcance (posts)" value={fmt(totalReach)} sub={`${posts.length} posts recentes`} accent="#06b6d4" />
    </div>

    {/* Account Insights charts — instagram_manage_insights */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Seguidores — últimos 7 dias" dark={dk}>
        <ResponsiveContainer width="100%" height={180}><AreaChart data={followersChart}><defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={brand.accent} stopOpacity={0.15} /><stop offset="100%" stopColor={brand.accent} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={dk ? "#27272a" : "#f4f4f5"} /><XAxis dataKey="date" tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} /><Tooltip {...tt(dk)} /><Area type="monotone" dataKey="value" stroke={brand.accent} fill="url(#gf)" strokeWidth={2.5} name="Seguidores" /></AreaChart></ResponsiveContainer>
      </Card>
      <Card title="Alcance diário — últimos 7 dias" dark={dk}>
        <ResponsiveContainer width="100%" height={180}><BarChart data={reachChart}><CartesianGrid strokeDasharray="3 3" stroke={dk ? "#27272a" : "#f4f4f5"} /><XAxis dataKey="date" tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} /><Tooltip {...tt(dk)} /><Bar dataKey="value" fill={brand.accent} radius={[6, 6, 0, 0]} opacity={0.8} name="Alcance" /></BarChart></ResponsiveContainer>
      </Card>
    </div>

    <Card title="Impressões diárias — últimos 7 dias" dark={dk}>
      <ResponsiveContainer width="100%" height={160}><AreaChart data={impressionsChart}><defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={dk ? "#27272a" : "#f4f4f5"} /><XAxis dataKey="date" tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} /><Tooltip {...tt(dk)} /><Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#gi)" strokeWidth={2} name="Impressões" /></AreaChart></ResponsiveContainer>
    </Card>

    {/* Posts — media endpoint + media/insights */}
    <Card title="Posts recentes" badge={`${posts.length} posts`} dark={dk}>
      <div className="space-y-3">{posts.map((p, i) => (<div key={i} className={`rounded-xl p-4 ${dk ? "bg-zinc-900/40" : "bg-zinc-50/80"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${p.media_type === "VIDEO" ? (dk ? "bg-pink-500/15 text-pink-400" : "bg-pink-50 text-pink-600") : p.media_type === "CAROUSEL_ALBUM" ? (dk ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600") : (dk ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-600")}`}>{p.media_type === "VIDEO" ? "Reels/Vídeo" : p.media_type === "CAROUSEL_ALBUM" ? "Carrossel" : "Foto"}</span>
            <span className={`text-[11px] ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{new Date(p.timestamp).toLocaleDateString("pt-BR")} {new Date(p.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <span className={`text-xs font-medium ${dk ? "text-zinc-300" : "text-zinc-700"}`}>{fmt(p.insights.reach)} alcance</span>
        </div>
        <p className={`text-xs mb-3 ${dk ? "text-zinc-300" : "text-zinc-600"}`}>{p.caption}</p>
        <div className="flex gap-5">{[{ icon: Heart, val: p.like_count, label: "Curtidas" }, { icon: MessageCircle, val: p.comments_count, label: "Comentários" }, { icon: Bookmark, val: p.insights.saved, label: "Salvos" }, { icon: Share2, val: p.insights.shares, label: "Compartilh." }, { icon: Eye, val: p.insights.impressions, label: "Impressões" }].map(m => (<div key={m.label} className="flex items-center gap-1.5"><m.icon size={12} className={dk ? "text-zinc-500" : "text-zinc-400"} /><span className={`text-xs font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{m.val}</span><span className={`text-[10px] ${dk ? "text-zinc-600" : "text-zinc-400"}`}>{m.label}</span></div>))}</div>
      </div>))}</div>
      <div className={`mt-3 pt-3 border-t ${dk ? "border-zinc-700/40" : "border-zinc-200"} flex gap-6 flex-wrap`}>
        <span className={`text-[11px] ${dk ? "text-zinc-400" : "text-zinc-500"}`}>Totais:</span>
        <span className={`text-[11px] font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmt(totalLikes)} curtidas</span>
        <span className={`text-[11px] font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmt(totalComments)} comentários</span>
        <span className={`text-[11px] font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmt(totalSaves)} salvos</span>
        <span className={`text-[11px] font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmt(totalReach)} alcance</span>
      </div>
    </Card>

    {/* Stories — stories endpoint + stories/insights */}
    <Card title="Stories ativos (últimas 24h)" badge={`${stories.length} stories`} dark={dk}>
      <div className="overflow-x-auto -mx-2"><table className="w-full text-xs min-w-[500px]">
        <thead><tr className={`${dk ? "text-zinc-500 border-zinc-700/50" : "text-zinc-400 border-zinc-200"} border-b`}>
          <th className="py-2.5 px-3 text-left font-medium">Horário</th>
          <th className="py-2.5 px-2 text-left font-medium">Tipo</th>
          <th className="py-2.5 px-2 text-right font-medium">Alcance</th>
          <th className="py-2.5 px-2 text-right font-medium">Impressões</th>
          <th className="py-2.5 px-2 text-right font-medium">Respostas</th>
          <th className="py-2.5 px-2 text-right font-medium">Saídas</th>
        </tr></thead>
        <tbody>{stories.map((s, i) => (<tr key={i} className={`${dk ? "border-zinc-800 hover:bg-zinc-700/20" : "border-zinc-100 hover:bg-zinc-50"} border-b transition-colors`}>
          <td className={`py-3 px-3 font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{new Date(s.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
          <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${s.media_type === "VIDEO" ? (dk ? "bg-pink-500/15 text-pink-400" : "bg-pink-50 text-pink-600") : (dk ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-600")}`}>{s.media_type === "VIDEO" ? "Vídeo" : "Imagem"}</span></td>
          <td className={`py-3 px-2 text-right font-medium ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{(s.insights.reach || 0).toLocaleString("pt-BR")}</td>
          <td className={`py-3 px-2 text-right ${dk ? "text-zinc-300" : "text-zinc-600"}`}>{(s.insights.impressions || 0).toLocaleString("pt-BR")}</td>
          <td className={`py-3 px-2 text-right ${(s.insights.replies || 0) > 10 ? "text-emerald-500 font-medium" : (dk ? "text-zinc-400" : "text-zinc-500")}`}>{s.insights.replies || 0}</td>
          <td className={`py-3 px-2 text-right ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{s.insights.exits || 0}</td>
        </tr>))}</tbody>
        <tfoot><tr className={`${dk ? "border-zinc-700/50 text-zinc-200" : "border-zinc-200 text-zinc-700"} border-t font-semibold`}>
          <td colSpan={2} className="py-3 px-3">Totais</td>
          <td className="py-3 px-2 text-right">{totalStoryReach.toLocaleString("pt-BR")}</td>
          <td className="py-3 px-2 text-right">{stories.reduce((s, st) => s + (st.insights.impressions || 0), 0).toLocaleString("pt-BR")}</td>
          <td className="py-3 px-2 text-right">{totalStoryReplies}</td>
          <td className="py-3 px-2 text-right">{stories.reduce((s, st) => s + (st.insights.exits || 0), 0)}</td>
        </tr></tfoot>
      </table></div>
    </Card>
  </div>);
}

/* ═══ TAB 7: CONFIGURAÇÕES ═══ */
function ConfigView({ dark: dk, apiConfig, setApiConfig }) {
  const [token, setToken] = useState(apiConfig?.token || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);

  // API data
  const [bms, setBms] = useState([]);
  const [loadingBms, setLoadingBms] = useState(false);

  // Selections
  const [bm1Id, setBm1Id] = useState(apiConfig?.bm1Id || "");
  const [bm2Id, setBm2Id] = useState(apiConfig?.bm2Id || "");
  const [adAccountsBm1, setAdAccountsBm1] = useState([]);
  const [adAccountsBm2, setAdAccountsBm2] = useState([]);
  const [igAccounts, setIgAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [bm1AdAccount, setBm1AdAccount] = useState(apiConfig?.bm1AdAccount || "");
  const [bm2AdAccount, setBm2AdAccount] = useState(apiConfig?.bm2AdAccount || "");
  const [igMaiaId, setIgMaiaId] = useState(apiConfig?.igMaiaId || "");
  const [igLiderId, setIgLiderId] = useState(apiConfig?.igLiderId || "");

  const BASE = "https://graph.facebook.com/v19.0";

  const apiFetch = async (endpoint, params = {}) => {
    const url = new URL(`${BASE}${endpoint}`);
    url.searchParams.set("access_token", token.trim());
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  };

  const testToken = async () => {
    if (!token.trim()) return;
    setTesting(true); setTestResult(null); setBms([]); setBm1Id(""); setBm2Id("");
    setAdAccountsBm1([]); setAdAccountsBm2([]); setIgAccounts([]);
    try {
      const me = await apiFetch("/me", { fields: "id,name" });
      setTestResult({ ok: true, msg: `Conectado como: ${me.name} (ID: ${me.id})` });

      // Buscar Business Managers automaticamente
      setLoadingBms(true);
      const bmsData = await apiFetch("/me/businesses", { fields: "id,name", limit: "50" });
      setBms(bmsData.data || []);
    } catch (e) {
      setTestResult({ ok: false, msg: e.message });
    }
    setTesting(false); setLoadingBms(false);
  };

  // Buscar Ad Accounts e IGs ao selecionar BMs
  useEffect(() => {
    if (!bm1Id || !token.trim()) return;
    setLoadingAccounts(true);
    const fetchBm1 = async () => {
      try {
        const [ads, igs] = await Promise.all([
          apiFetch(`/${bm1Id}/owned_ad_accounts`, { fields: "id,name,account_id", limit: "50" }),
          apiFetch(`/${bm1Id}/owned_instagram_accounts`, { fields: "id,username,name,followers_count", limit: "30" }),
        ]);
        setAdAccountsBm1(ads.data || []);
        setIgAccounts(prev => {
          const merged = [...prev, ...(igs.data || [])];
          return merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        });
      } catch {}
      setLoadingAccounts(false);
    };
    fetchBm1();
  }, [bm1Id]);

  useEffect(() => {
    if (!bm2Id || !token.trim() || bm2Id === bm1Id) return;
    const fetchBm2 = async () => {
      try {
        const [ads, igs] = await Promise.all([
          apiFetch(`/${bm2Id}/owned_ad_accounts`, { fields: "id,name,account_id", limit: "50" }),
          apiFetch(`/${bm2Id}/owned_instagram_accounts`, { fields: "id,username,name,followers_count", limit: "30" }),
        ]);
        setAdAccountsBm2(ads.data || []);
        setIgAccounts(prev => {
          const merged = [...prev, ...(igs.data || [])];
          return merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        });
      } catch {}
    };
    fetchBm2();
  }, [bm2Id]);

  // Se BM2 = BM1, reutilizar as Ad Accounts da BM1
  useEffect(() => {
    if (bm2Id && bm2Id === bm1Id) setAdAccountsBm2(adAccountsBm1);
  }, [bm2Id, bm1Id, adAccountsBm1]);

  const saveConfig = () => {
    const config = { token: token.trim(), bm1Id, bm2Id: bm2Id || bm1Id, bm1AdAccount, bm2AdAccount, igMaiaId, igLiderId };
    setApiConfig(config);
    try { localStorage.setItem("dashboard_config", JSON.stringify(config)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearConfig = () => {
    setApiConfig(null);
    setToken(""); setBm1Id(""); setBm2Id(""); setBm1AdAccount(""); setBm2AdAccount("");
    setIgMaiaId(""); setIgLiderId(""); setTestResult(null); setBms([]);
    setAdAccountsBm1([]); setAdAccountsBm2([]); setIgAccounts([]);
    try { localStorage.removeItem("dashboard_config"); } catch {}
  };

  const inp = `w-full px-4 py-3 rounded-xl text-sm font-mono transition-all ${dk ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500"} border outline-none`;
  const sel = `w-full px-4 py-3 rounded-xl text-sm transition-all ${dk ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border outline-none disabled:opacity-40`;
  const lbl = `block text-xs font-medium mb-1.5 ${dk ? "text-zinc-300" : "text-zinc-700"}`;
  const hint = `text-[10px] mt-1 ${dk ? "text-zinc-600" : "text-zinc-400"}`;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}><Settings size={18} /></div>
        <div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>Configurações</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>Token da API do Meta · Seleção automática de contas</span></div>
      </div>

      {/* Token */}
      <Card title="Token de acesso — Meta Graph API" dark={dk}>
        <div className={`rounded-xl p-3 mb-4 text-[11px] leading-relaxed ${dk ? "bg-zinc-900/60 text-zinc-400" : "bg-zinc-50 text-zinc-500"}`}>
          <div className="flex items-center gap-2 mb-2"><Key size={12} className="text-emerald-500" /><span className="font-medium text-emerald-500">Como gerar o token:</span></div>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Acesse <span className="font-mono text-emerald-400">developers.facebook.com/tools/explorer</span></li>
            <li>Selecione seu App → Permissões: <span className="font-mono text-[10px] text-amber-400">instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement, ads_read, business_management, read_insights</span></li>
            <li>Clique "Generate Access Token" → Autorize → Cole abaixo</li>
          </ol>
          <div className={`mt-2 p-2 rounded-lg ${dk ? "bg-amber-500/8 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
            <Shield size={11} className="inline mr-1" />Token fica apenas no seu navegador. Expira em ~1h (curto) ou 60 dias (longo).
          </div>
        </div>
        <div>
          <label className={lbl}>Access Token</label>
          <div className="flex gap-2">
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Cole seu token aqui..." className={`${inp} flex-1`} />
            <button onClick={testToken} disabled={!token.trim() || testing} className="px-4 py-3 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex-shrink-0 transition-all">
              {testing ? <Loader2 size={14} className="animate-spin" /> : "Testar"}
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-xs ${testResult.ok ? (dk ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600")}`}>
              {testResult.ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
              {testResult.msg}
            </div>
          )}
          {loadingBms && (
            <div className={`flex items-center gap-2 mt-2 text-xs ${dk ? "text-zinc-400" : "text-zinc-500"}`}>
              <Loader2 size={12} className="animate-spin" /> Carregando Business Managers...
            </div>
          )}
        </div>
      </Card>

      {/* BMs — aparece se a API retornar, ou campos manuais */}
      {testResult?.ok && (
        <Card title="Business Managers & Contas de Anúncios" dark={dk}>
          <div className={`rounded-xl p-3 mb-4 text-[11px] leading-relaxed ${dk ? "bg-zinc-900/60 text-zinc-400" : "bg-zinc-50 text-zinc-500"}`}>
            <div className="flex items-center gap-2 mb-1"><Key size={12} className="text-amber-400" /><span className="font-medium text-amber-400">Como obter o Ad Account ID:</span></div>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Acesse <span className="font-mono text-emerald-400">business.facebook.com</span> → Configurações do negócio</li>
              <li>Vá em <span className="font-mono text-[10px] text-zinc-300">Contas de anúncios</span> → copie o ID (formato: <span className="font-mono text-[10px] text-emerald-400">act_XXXXXXXXXX</span>)</li>
            </ol>
          </div>

          {bms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={lbl}>BM1 — Topo de funil</label>
                <select value={bm1Id} onChange={(e) => { setBm1Id(e.target.value); setBm1AdAccount(""); }} className={sel}>
                  <option value="">Selecione...</option>
                  {bms.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id})</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>BM2 — Conversão CRM</label>
                <select value={bm2Id} onChange={(e) => { setBm2Id(e.target.value); setBm2AdAccount(""); }} className={sel}>
                  <option value="">Mesma BM que acima</option>
                  {bms.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id})</option>)}
                </select>
              </div>
            </div>
          )}

          {loadingAccounts && <div className={`flex items-center gap-2 mb-3 text-xs ${dk ? "text-zinc-400" : "text-zinc-500"}`}><Loader2 size={12} className="animate-spin" /> Carregando contas...</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Ad Account — BM1 (Topo de funil)</label>
              {adAccountsBm1.length > 0 ? (
                <select value={bm1AdAccount} onChange={(e) => setBm1AdAccount(e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  {adAccountsBm1.map(a => <option key={a.id} value={a.id}>{a.name} ({a.account_id || a.id})</option>)}
                </select>
              ) : (
                <input type="text" value={bm1AdAccount} onChange={(e) => setBm1AdAccount(e.target.value)} placeholder="act_XXXXXXXXXX" className={inp} />
              )}
              <div className={hint}>Conta de anúncios de tráfego e engajamento</div>
            </div>
            <div>
              <label className={lbl}>Ad Account — BM2 (Conversão CRM)</label>
              {adAccountsBm2.length > 0 ? (
                <select value={bm2AdAccount} onChange={(e) => setBm2AdAccount(e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  {adAccountsBm2.map(a => <option key={a.id} value={a.id}>{a.name} ({a.account_id || a.id})</option>)}
                </select>
              ) : (
                <input type="text" value={bm2AdAccount} onChange={(e) => setBm2AdAccount(e.target.value)} placeholder="act_XXXXXXXXXX" className={inp} />
              )}
              <div className={hint}>Conta de anúncios de conversão e WhatsApp</div>
            </div>
          </div>
        </Card>
      )}

      {/* IDs do Instagram — SEMPRE visível após token válido */}
      {testResult?.ok && (
        <Card title="IDs dos Perfis Instagram" badge="obrigatório para aba Instagram" dark={dk}>
          <div className={`rounded-xl p-3 mb-4 text-[11px] leading-relaxed ${dk ? "bg-zinc-900/60 text-zinc-400" : "bg-zinc-50 text-zinc-500"}`}>
            <div className="flex items-center gap-2 mb-1"><Key size={12} className="text-amber-400" /><span className="font-medium text-amber-400">Como obter o ID do perfil Instagram:</span></div>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Acesse <span className="font-mono text-emerald-400">developers.facebook.com/tools/explorer</span></li>
              <li>Faça a chamada: <span className="font-mono text-[10px] text-zinc-300">GET /me/accounts</span> → copie o <span className="font-mono text-[10px]">id</span> da Página</li>
              <li>Depois: <span className="font-mono text-[10px] text-zinc-300">GET /[ID_PAGINA]?fields=instagram_business_account</span></li>
              <li>O <span className="font-mono text-[10px]">instagram_business_account.id</span> é o ID que você cola abaixo</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {igAccounts.length > 0 ? (
              <>
                <div>
                  <label className={lbl}>Instagram — Lojas Maia</label>
                  <select value={igMaiaId} onChange={(e) => setIgMaiaId(e.target.value)} className={sel}>
                    <option value="">Selecione...</option>
                    {igAccounts.map(a => <option key={a.id} value={a.id}>@{a.username} — {(a.followers_count || 0).toLocaleString("pt-BR")} seg.</option>)}
                  </select>
                  <div className={hint}>Perfil @lojasmaiaof</div>
                </div>
                <div>
                  <label className={lbl}>Instagram — Líder Colchões</label>
                  <select value={igLiderId} onChange={(e) => setIgLiderId(e.target.value)} className={sel}>
                    <option value="">Selecione...</option>
                    {igAccounts.map(a => <option key={a.id} value={a.id}>@{a.username} — {(a.followers_count || 0).toLocaleString("pt-BR")} seg.</option>)}
                  </select>
                  <div className={hint}>Perfil @lidercolchoes</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={lbl}>ID Instagram — Lojas Maia</label>
                  <input type="text" value={igMaiaId} onChange={(e) => setIgMaiaId(e.target.value)} placeholder="Ex: 17841400000000000" className={inp} />
                  <div className={hint}>Perfil @lojasmaiaof · Instagram Business Account ID</div>
                </div>
                <div>
                  <label className={lbl}>ID Instagram — Líder Colchões</label>
                  <input type="text" value={igLiderId} onChange={(e) => setIgLiderId(e.target.value)} placeholder="Ex: 17841400000000001" className={inp} />
                  <div className={hint}>Perfil @lidercolchoes · Instagram Business Account ID</div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={clearConfig} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${dk ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}`}>
          <Trash2 size={13} /> Limpar configurações
        </button>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-xs text-emerald-500"><CheckCircle size={13} /> Salvo!</span>}
          <button onClick={saveConfig} disabled={!token.trim()} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50">
            Salvar configurações
          </button>
        </div>
      </div>

      {/* Status */}
      <Card title="Status da conexão" dark={dk}>
        <div className="space-y-2">
          {[
            { label: "Token", value: apiConfig?.token ? "Configurado" : "Não configurado", ok: !!apiConfig?.token },
            { label: "BM1", value: apiConfig?.bm1Id ? bms.find(b => b.id === apiConfig.bm1Id)?.name || apiConfig.bm1Id : "—", ok: !!apiConfig?.bm1Id },
            { label: "BM2", value: apiConfig?.bm2Id ? bms.find(b => b.id === apiConfig.bm2Id)?.name || apiConfig.bm2Id : "—", ok: !!apiConfig?.bm2Id },
            { label: "Ad Account BM1", value: apiConfig?.bm1AdAccount || "—", ok: !!apiConfig?.bm1AdAccount },
            { label: "Ad Account BM2", value: apiConfig?.bm2AdAccount || "—", ok: !!apiConfig?.bm2AdAccount },
            { label: "IG Maia", value: apiConfig?.igMaiaId ? igAccounts.find(a => a.id === apiConfig.igMaiaId)?.username ? `@${igAccounts.find(a => a.id === apiConfig.igMaiaId).username}` : apiConfig.igMaiaId : "—", ok: !!apiConfig?.igMaiaId },
            { label: "IG Líder", value: apiConfig?.igLiderId ? igAccounts.find(a => a.id === apiConfig.igLiderId)?.username ? `@${igAccounts.find(a => a.id === apiConfig.igLiderId).username}` : apiConfig.igLiderId : "—", ok: !!apiConfig?.igLiderId },
          ].map((item) => (
            <div key={item.label} className={`flex items-center justify-between py-2 px-3 rounded-lg ${dk ? "bg-zinc-900/40" : "bg-zinc-50"}`}>
              <span className={`text-xs ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${dk ? "text-zinc-300" : "text-zinc-700"}`}>{item.value.length > 24 ? item.value.slice(0, 24) + "..." : item.value}</span>
                {item.ok ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className={dk ? "text-zinc-600" : "text-zinc-400"} />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══ MAIN DASHBOARD ═══ */
export default function Dashboard() {
  const [dk, setDk] = useState(true);
  const [tab, setTab] = useState("consolidado");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [spinning, setSpinning] = useState(false);
  const [apiConfig, setApiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Fallback para variáveis de ambiente (Netlify)
    const envToken = import.meta.env.VITE_META_TOKEN;
    if (envToken) {
      return {
        token: envToken,
        bm1Id: import.meta.env.VITE_BM1_ID || "",
        bm2Id: import.meta.env.VITE_BM2_ID || import.meta.env.VITE_BM1_ID || "",
        bm1AdAccount: import.meta.env.VITE_BM1_AD_ACCOUNT || "",
        bm2AdAccount: import.meta.env.VITE_BM2_AD_ACCOUNT || "",
        igMaiaId: import.meta.env.VITE_IG_MAIA_ID || "",
        igLiderId: import.meta.env.VITE_IG_LIDER_ID || "",
      };
    }
    return null;
  });
  const [liveData, setLiveData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState("");

  const fetchAllData = useCallback(async () => {
    if (!apiConfig?.token) return;
    const hasAds = apiConfig.bm1AdAccount || apiConfig.bm2AdAccount;
    if (!hasAds) return;
    setLoadingLive(true);
    setLiveError("");
    try {
      const [bm1Raw, bm2Raw] = await Promise.all([
        apiConfig.bm1AdAccount ? fetchAdAccountData(apiConfig.bm1AdAccount, apiConfig.token) : Promise.resolve({ summary: {}, campaigns: [] }),
        apiConfig.bm2AdAccount ? fetchAdAccountData(apiConfig.bm2AdAccount, apiConfig.token) : Promise.resolve({ summary: {}, campaigns: [] }),
      ]);

      const bm1Campaigns = transformBM1Campaigns(bm1Raw.campaigns);
      const bm2Campaigns = transformBM2Campaigns(bm2Raw.campaigns);
      const bm1s = bm1Raw.summary;
      const bm2s = bm2Raw.summary;

      const bm1Summary = {
        invested: parseFloat(parseFloat(bm1s.spend || 0).toFixed(2)),
        reach: parseInt(bm1s.reach || 0),
        impressions: parseInt(bm1s.impressions || 0),
        cpm: parseFloat(parseFloat(bm1s.cpm || 0).toFixed(2)),
        clicks: parseInt(bm1s.clicks || 0),
        campaigns: bm1Campaigns.length,
      };
      const bm2Summary = {
        invested: parseFloat(parseFloat(bm2s.spend || 0).toFixed(2)),
        reach: parseInt(bm2s.reach || 0),
        impressions: parseInt(bm2s.impressions || 0),
        contacts: bm2Campaigns.reduce((s, c) => s + (c.result || 0), 0),
        newContacts: bm2Campaigns.reduce((s, c) => s + (c.result || 0), 0),
        campaigns: bm2Campaigns.length,
      };

      setLiveData({
        consolidated: {
          bm1: bm1Summary,
          bm2: bm2Summary,
          totalInvested: parseFloat((bm1Summary.invested + bm2Summary.invested).toFixed(2)),
        },
        bm1Summary,
        bm2Summary,
        // split by brand name heuristic
        bm1MaiaCampaigns: bm1Campaigns.filter(c => /maia/i.test(c.name)),
        bm1LiderCampaigns: bm1Campaigns.filter(c => /l[ií]der/i.test(c.name)),
        bm2MaiaCampaigns: bm2Campaigns.filter(c => /maia/i.test(c.name)),
        bm2LiderCampaigns: bm2Campaigns.filter(c => /l[ií]der/i.test(c.name)),
        // fallback: all campaigns (unfiltered)
        bm1Campaigns,
        bm2Campaigns,
      });
    } catch (e) {
      setLiveError(e.message);
    }
    setLoadingLive(false);
    setLastUpdate(new Date());
  }, [apiConfig]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const refresh = () => {
    setSpinning(true);
    fetchAllData().finally(() => setSpinning(false));
    setLastUpdate(new Date());
  };

  const tabs = [
    { id: "consolidado", label: "Consolidado", icon: Layers },
    { id: "maia", label: "Lojas Maia", icon: () => <div className="w-3 h-3 rounded" style={{ background: "#f59e0b" }} /> },
    { id: "lider", label: "Líder Colchões", icon: () => <div className="w-3 h-3 rounded" style={{ background: "#6366f1" }} /> },
    { id: "bm1", label: "BM1 Topo", icon: Megaphone },
    { id: "bm2", label: "BM2 CRM", icon: ShoppingBag },
    { id: "instagram", label: "Instagram", icon: Image },
    { id: "config", label: "Configurações", icon: Settings },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dk ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <header className={`sticky top-0 z-40 backdrop-blur-2xl ${dk ? "bg-zinc-950/70 border-zinc-800/60" : "bg-white/70 border-zinc-200/60"} border-b`}>
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #10b981)" }}><BarChart3 size={15} className="text-white" /></div>
              <div><span className="font-semibold text-sm tracking-tight">Dashboard Fiscalização</span><span className={`block text-[10px] ${dk ? "text-zinc-600" : "text-zinc-400"}`}>@lojasmaiaof + @lidercolchoes · Eali Performance · BM1 + BM2</span></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] mr-2 hidden sm:block ${dk ? "text-zinc-600" : "text-zinc-400"}`}>{lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              <button onClick={refresh} className={`p-2 rounded-xl transition-all ${dk ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}><RefreshCw size={15} className={`${dk ? "text-zinc-500" : "text-zinc-400"} ${spinning ? "animate-spin" : ""}`} /></button>
              <button onClick={() => setDk(!dk)} className={`p-2 rounded-xl transition-all ${dk ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}>{dk ? <Sun size={15} className="text-zinc-500" /> : <Moon size={15} className="text-zinc-400" />}</button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-5 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className={`inline-flex rounded-xl p-1 flex-wrap gap-0.5 ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{tabs.map(t => { const Icon = t.icon; return (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${tab === t.id ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm shadow-black/20" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><Icon size={12} />{t.label}</button>); })}</div>
          <div className={`text-[11px] px-3 py-1.5 rounded-lg ${dk ? "bg-zinc-800/60 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>{DATA.period.current}</div>
        </div>
        {tab === "consolidado" && <ConsolidatedView dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
        {tab === "maia" && <BrandView brandKey="maia" dark={dk} liveData={liveData ? { bm1Campaigns: liveData.bm1MaiaCampaigns, bm2Campaigns: liveData.bm2MaiaCampaigns } : null} />}
        {tab === "lider" && <BrandView brandKey="lider" dark={dk} liveData={liveData ? { bm1Campaigns: liveData.bm1LiderCampaigns, bm2Campaigns: liveData.bm2LiderCampaigns } : null} />}
        {tab === "bm1" && <BM1View dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
        {tab === "bm2" && <BM2View dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
        {tab === "instagram" && <InstagramView dark={dk} apiConfig={apiConfig} />}
        {tab === "config" && <ConfigView dark={dk} apiConfig={apiConfig} setApiConfig={setApiConfig} />}
      </main>
    </div>
  );
}
