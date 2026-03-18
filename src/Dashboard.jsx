import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { DATA as MOCK_DATA } from "./data/mockData";
import { useDashboardData } from "./hooks/useDashboardData";

const DataCtx = createContext(MOCK_DATA);
const useData = () => useContext(DataCtx);
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
      <div className={`text-lg sm:text-xl font-semibold tracking-tight ${dk ? "text-zinc-50" : "text-zinc-900"}`}>{value}</div>
      {sub && <div className={`text-[11px] mt-1 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</div>}
    </div>
  );
}
function Card({ title, badge, children, dark: dk }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${dk ? "bg-zinc-800/50 border-zinc-700/40" : "bg-white border-zinc-200/60"} border`}>
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
  const DATA = useData();
  return (<Card title={title} badge={period || `${DATA.period.current} vs ${DATA.period.previous}`} dark={dk}><div className="overflow-x-auto -mx-2"><table className="w-full text-xs min-w-[700px]"><thead><tr className={`${dk ? "text-zinc-500 border-zinc-700/50" : "text-zinc-400 border-zinc-200"} border-b`}><th className="py-2.5 px-3 text-left font-medium">Campanha</th><th className="py-2.5 px-2 text-right font-medium">Resultado</th><th className="py-2.5 px-2 text-right font-medium">Anterior</th><th className="py-2.5 px-2 text-center font-medium">Var.</th><th className="py-2.5 px-2 text-right font-medium">Custo</th><th className="py-2.5 px-2 text-right font-medium">Ant.</th><th className="py-2.5 px-2 text-center font-medium">Var.</th></tr></thead><tbody>{campaigns.map((c, i) => (<tr key={i} className={`${dk ? "border-zinc-800 hover:bg-zinc-700/20" : "border-zinc-100 hover:bg-zinc-50"} border-b transition-colors`}><td className="py-3 px-3"><div className={`font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{c.name}</div><div className={`text-[10px] mt-0.5 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{c.resultLabel}</div></td><td className={`py-3 px-2 text-right font-semibold ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{c.result.toLocaleString("pt-BR")}</td><td className={`py-3 px-2 text-right ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{c.prevResult ? c.prevResult.toLocaleString("pt-BR") : "—"}</td><td className="py-3 px-2 text-center"><VarBadge value={c.varResult} dark={dk} /></td><td className={`py-3 px-2 text-right font-medium ${dk ? "text-zinc-200" : "text-zinc-800"}`}>{fmtMoney(c.cost)}</td><td className={`py-3 px-2 text-right ${dk ? "text-zinc-400" : "text-zinc-500"}`}>{c.prevCost ? fmtMoney(c.prevCost) : "—"}</td><td className="py-3 px-2 text-center"><VarBadge value={c.varCost} inverted dark={dk} /></td></tr>))}</tbody><tfoot><tr className={`${dk ? "border-zinc-700/50 text-zinc-200" : "border-zinc-200 text-zinc-700"} border-t font-semibold`}><td className="py-3 px-3">Total</td><td className="py-3 px-2 text-right">{campaigns.reduce((s, c) => s + (c.result || 0), 0).toLocaleString("pt-BR")}</td><td className="py-3 px-2 text-right">—</td><td className="py-3 px-2" /><td className="py-3 px-2 text-right">{fmtMoney(campaigns.reduce((s, c) => s + (c.invested || 0), 0))}</td><td className="py-3 px-2" /><td className="py-3 px-2" /></tr></tfoot></table></div></Card>);
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
  const DATA = useData();
  const c = liveData?.consolidated || DATA.consolidated;
  return (<div className="space-y-4 sm:space-y-5">
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className={`rounded-2xl p-4 sm:p-5 text-center ${dk ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20" : "bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200"} border`}><div className={`text-[10px] uppercase tracking-wider mb-1 ${dk ? "text-zinc-400" : "text-zinc-500"}`}>Total geral investido {liveData ? "(últimos 7 dias)" : "na semana"}</div><div className={`text-2xl sm:text-3xl font-bold tracking-tight ${dk ? "text-emerald-400" : "text-emerald-700"}`}>{fmtMoney(c.totalInvested)}</div><div className={`text-xs mt-1 ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{liveData ? "API conectada" : DATA.period.current} · BM1 + BM2</div></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"><KPI dark={dk} icon={DollarSign} label="BM1 Investido" value={fmtMoney(c.bm1.invested)} sub="Topo de funil" accent="#10b981" /><KPI dark={dk} icon={DollarSign} label="BM2 Investido" value={fmtMoney(c.bm2.invested)} sub="Conversão CRM" accent="#f59e0b" /><KPI dark={dk} icon={Eye} label="Alcance total" value={fmt(c.bm1.reach + c.bm2.reach)} sub="BM1 + BM2" accent="#06b6d4" /><KPI dark={dk} icon={Target} label="Novos contatos" value={String(c.bm2.newContacts)} sub="Via GoHighLevel" accent="#8b5cf6" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="BM1 — Topo + Meio de funil" badge={`${c.bm1.campaigns} campanhas`} dark={dk}><div className="grid grid-cols-2 gap-3">{[{ l: "Alcance", v: fmt(c.bm1.reach) }, { l: "Impressões", v: fmt(c.bm1.impressions) }, { l: "CPM médio", v: fmtMoney(c.bm1.cpm) }, { l: "Cliques", v: fmt(c.bm1.clicks) }].map(m => (<div key={m.l} className={`rounded-xl p-3 ${dk ? "bg-zinc-900/50" : "bg-zinc-50"}`}><div className={`text-[10px] uppercase tracking-wider ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{m.l}</div><div className={`text-base font-semibold mt-1 ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{m.v}</div></div>))}</div></Card>
      <Card title="BM2 — Fundo de funil (CRM)" badge={`${c.bm2.campaigns} campanhas`} dark={dk}><div className="grid grid-cols-2 gap-3">{[{ l: "Alcance", v: fmt(c.bm2.reach) }, { l: "Impressões", v: fmt(c.bm2.impressions) }, { l: "Total contatos", v: String(c.bm2.contacts) }, { l: "Novos contatos", v: String(c.bm2.newContacts) }].map(m => (<div key={m.l} className={`rounded-xl p-3 ${dk ? "bg-zinc-900/50" : "bg-zinc-50"}`}><div className={`text-[10px] uppercase tracking-wider ${dk ? "text-zinc-500" : "text-zinc-400"}`}>{m.l}</div><div className={`text-base font-semibold mt-1 ${dk ? "text-zinc-100" : "text-zinc-900"}`}>{m.v}</div></div>))}</div></Card>
    </div>
    <Card title="Investimento por BM × Marca" dark={dk}><ResponsiveContainer width="100%" height={160}><BarChart data={[{ name: "BM1", "Lojas Maia": 3571.81, "Líder Colchões": 4161.00 }, { name: "BM2", "Lojas Maia": 1836.66, "Líder Colchões": 420.83 }]} layout="vertical" barGap={4}><CartesianGrid strokeDasharray="3 3" stroke={dk ? "#27272a" : "#f4f4f5"} horizontal={false} /><XAxis type="number" tick={{ fontSize: 10, fill: dk ? "#52525b" : "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dk ? "#71717a" : "#a1a1aa", fontWeight: 500 }} axisLine={false} tickLine={false} width={40} /><Tooltip {...tt(dk)} formatter={v => fmtMoney(v)} /><Bar dataKey="Lojas Maia" fill="#f59e0b" radius={[0, 6, 6, 0]} opacity={0.85} /><Bar dataKey="Líder Colchões" fill="#6366f1" radius={[0, 6, 6, 0]} opacity={0.85} /><Legend wrapperStyle={{ fontSize: 11 }} /></BarChart></ResponsiveContainer></Card>
  </div>);
}

/* ═══ TAB 2: BM1 ═══ */
function BM1View({ dark: dk, liveData, loading, error }) {
  const DATA = useData();
  const [sub, setSub] = useState("maia");
  const isLive = !!liveData;
  const bm1 = isLive ? liveData.bm1Summary : DATA.consolidated.bm1;
  const maiaCampaigns = isLive ? (liveData.bm1MaiaCampaigns || []) : DATA.bm1.maia;
  const liderCampaigns = isLive ? (liveData.bm1LiderCampaigns || []) : DATA.bm1.lider;
  const sharedCampaigns = isLive ? (liveData.bm1Campaigns?.filter(c => !/maia|l[ií]der/i.test(c.name)) || []) : DATA.bm1.shared;
  const period = isLive ? "Últimos 7 dias" : undefined;
  return (<div className="space-y-4 sm:space-y-5">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}><Megaphone size={18} /></div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>BM1 — Topo de funil</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>Tráfego · Seguidores · Direct · Engajamento · {isLive ? "Dados reais" : "Demo"}</span></div></div>
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"><KPI dark={dk} icon={DollarSign} label="Investido" value={fmtMoney(bm1?.invested ?? DATA.consolidated.bm1.invested)} accent="#10b981" /><KPI dark={dk} icon={Eye} label="Alcance" value={fmt(bm1?.reach ?? DATA.consolidated.bm1.reach)} accent="#06b6d4" /><KPI dark={dk} icon={Zap} label="Impressões" value={fmt(bm1?.impressions ?? DATA.consolidated.bm1.impressions)} accent="#8b5cf6" /><KPI dark={dk} icon={DollarSign} label="CPM médio" value={fmtMoney(bm1?.cpm ?? DATA.consolidated.bm1.cpm)} accent="#f59e0b" /></div>
    <div className={`inline-flex rounded-xl p-1 flex-wrap gap-1 ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{[{ id: "maia", label: "Maia", color: "#f59e0b" }, { id: "lider", label: "Líder", color: "#6366f1" }, { id: "shared", label: "Compartilhadas", color: "#10b981" }].map(t => (<button key={t.id} onClick={() => setSub(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${sub === t.id ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />{t.label}</button>))}</div>
    {sub === "maia" && <BM1Table campaigns={maiaCampaigns} dark={dk} title="Lojas Maia — BM1" period={period} />}
    {sub === "lider" && <BM1Table campaigns={liderCampaigns} dark={dk} title="Líder Colchões — BM1" period={period} />}
    {sub === "shared" && <BM1Table campaigns={sharedCampaigns} dark={dk} title="Campanhas Compartilhadas — BM1" period={period} />}
  </div>);
}

/* ═══ TAB 3: BM2 ═══ */
function BM2View({ dark: dk, liveData, loading, error }) {
  const DATA = useData();
  const [sub, setSub] = useState("maia");
  const isLive = !!liveData;
  const bm2 = isLive ? liveData.bm2Summary : DATA.consolidated.bm2;
  const maiaCampaigns = isLive ? (liveData.bm2MaiaCampaigns || []) : DATA.bm2.maia;
  const liderCampaigns = isLive ? (liveData.bm2LiderCampaigns || []) : DATA.bm2.lider;
  return (<div className="space-y-4 sm:space-y-5">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}><ShoppingBag size={18} /></div><div><h2 className={`text-lg font-semibold ${dk ? "text-zinc-50" : "text-zinc-900"}`}>BM2 — Conversão CRM</h2><span className={`text-xs ${dk ? "text-zinc-500" : "text-zinc-400"}`}>WhatsApp · Encarte · LP · GoHighLevel · {isLive ? "Dados reais" : "Demo"}</span></div></div>
    {loading && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-zinc-800/50 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}><Loader2 size={13} className="animate-spin text-emerald-500" /> Buscando dados reais da Meta API...</div>}
    {error && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dk ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}><AlertCircle size={13} /> {error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"><KPI dark={dk} icon={DollarSign} label="Investido" value={fmtMoney(bm2?.invested ?? DATA.consolidated.bm2.invested)} accent="#f59e0b" /><KPI dark={dk} icon={Eye} label="Alcance" value={fmt(bm2?.reach ?? DATA.consolidated.bm2.reach)} accent="#06b6d4" /><KPI dark={dk} icon={Target} label="Total contatos" value={String(bm2?.contacts ?? DATA.consolidated.bm2.contacts)} accent="#8b5cf6" /><KPI dark={dk} icon={Users} label="Novos contatos" value={String(bm2?.newContacts ?? DATA.consolidated.bm2.newContacts)} accent="#10b981" /></div>
    <div className={`inline-flex rounded-xl p-1 flex-wrap gap-1 ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{[{ id: "maia", label: "Maia", color: "#f59e0b" }, { id: "lider", label: "Líder", color: "#6366f1" }].map(t => (<button key={t.id} onClick={() => setSub(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${sub === t.id ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />{t.label}</button>))}</div>
    {sub === "maia" && <BM2Table campaigns={maiaCampaigns} dark={dk} title="Lojas Maia — BM2" />}
    {sub === "lider" && <BM2Table campaigns={liderCampaigns} dark={dk} title="Líder Colchões — BM2" />}
  </div>);
}

/* ═══ TAB 6: INSTAGRAM ═══ */
function InstagramView({ dark: dk, apiConfig }) {
  const DATA = useData();
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

  return (<div className="space-y-4 sm:space-y-5">
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
  const { data } = useDashboardData();
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
  const [autoRefresh, setAutoRefresh] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard_autorefresh");
      return saved ? JSON.parse(saved) : { enabled: false, intervalMin: 15 };
    } catch { return { enabled: false, intervalMin: 15 }; }
  });
  const [countdown, setCountdown] = useState(0);

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

  // Persist auto-refresh preference
  useEffect(() => {
    localStorage.setItem("dashboard_autorefresh", JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  // Auto-refresh scheduling
  useEffect(() => {
    if (!autoRefresh.enabled || !liveData) return;
    const totalSec = autoRefresh.intervalMin * 60;
    setCountdown(totalSec);
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? totalSec : prev - 1));
    }, 1000);
    const fetcher = setInterval(() => {
      fetchAllData();
    }, totalSec * 1000);
    return () => { clearInterval(tick); clearInterval(fetcher); };
  }, [autoRefresh.enabled, autoRefresh.intervalMin, liveData, fetchAllData]);

  const fmtCountdown = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const refresh = () => {
    setSpinning(true);
    fetchAllData().finally(() => setSpinning(false));
    setLastUpdate(new Date());
  };

  const tabs = [
    { id: "consolidado", label: "Consolidado", icon: Layers },
    { id: "bm1", label: "BM1", icon: Megaphone },
    { id: "bm2", label: "BM2", icon: ShoppingBag },
    { id: "instagram", label: "Instagram", icon: Image },
    { id: "config", label: "Configurações", icon: Settings },
  ];

  return (
    <DataCtx.Provider value={data}>
      <div className={`min-h-screen transition-colors duration-300 ${dk ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
        <header className={`sticky top-0 z-40 backdrop-blur-2xl ${dk ? "bg-zinc-950/70 border-zinc-800/60" : "bg-white/70 border-zinc-200/60"} border-b`}>
          <div className="max-w-[1200px] mx-auto px-3 sm:px-5">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #22c55e, #10b981)" }}><BarChart3 size={15} className="text-white" /></div>
                <div><span className="font-semibold text-sm tracking-tight">Dashboard Fiscalização</span><span className={`hidden sm:block text-[10px] ${dk ? "text-zinc-600" : "text-zinc-400"}`}>@lojasmaiaof + @lidercolchoes · Eali Performance · BM1 + BM2</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] mr-2 hidden sm:block ${dk ? "text-zinc-600" : "text-zinc-400"}`}>{lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                <button onClick={refresh} className={`p-2 rounded-xl transition-all ${dk ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}><RefreshCw size={15} className={`${dk ? "text-zinc-500" : "text-zinc-400"} ${spinning ? "animate-spin" : ""}`} /></button>
                {/* Auto-refresh controls */}
                <button
                  onClick={() => liveData && setAutoRefresh(p => ({ ...p, enabled: !p.enabled }))}
                  title={!liveData ? "Disponível apenas com API configurada" : (autoRefresh.enabled ? "Desativar auto-refresh" : "Ativar auto-refresh")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all
                    ${!liveData ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${autoRefresh.enabled && liveData
                      ? (dk ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700")
                      : (dk ? "hover:bg-zinc-800 text-zinc-500" : "hover:bg-zinc-100 text-zinc-400")
                    }`}
                >
                  <Clock size={12} />
                  Auto
                </button>
                {autoRefresh.enabled && liveData && (
                  <>
                    <select
                      value={autoRefresh.intervalMin}
                      onChange={e => setAutoRefresh(p => ({ ...p, intervalMin: Number(e.target.value) }))}
                      className={`hidden sm:block text-[11px] px-2 py-1 rounded-lg border-0 outline-none cursor-pointer
                        ${dk ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}
                    >
                      {[5, 15, 30, 60].map(m => (
                        <option key={m} value={m}>{m < 60 ? `${m} min` : "1 h"}</option>
                      ))}
                    </select>
                    <span className={`hidden sm:inline text-[11px] tabular-nums ${dk ? "text-zinc-600" : "text-zinc-400"}`}>
                      próx. em {fmtCountdown(countdown)}
                    </span>
                  </>
                )}
                <button onClick={() => setDk(!dk)} className={`p-2 rounded-xl transition-all ${dk ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}>{dk ? <Sun size={15} className="text-zinc-500" /> : <Moon size={15} className="text-zinc-400" />}</button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-[1200px] mx-auto px-3 py-4 sm:px-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className={`flex rounded-xl p-1 gap-0.5 overflow-x-auto scrollbar-none w-full sm:w-auto ${dk ? "bg-zinc-900/80" : "bg-zinc-100"}`}>{tabs.map(t => { const Icon = t.icon; return (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all flex-shrink-0 ${tab === t.id ? (dk ? "bg-zinc-800 text-zinc-100 shadow-sm shadow-black/20" : "bg-white text-zinc-900 shadow-sm") : (dk ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")}`}><Icon size={12} />{t.label}</button>); })}</div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`text-[11px] px-3 py-1.5 rounded-lg ${dk ? "bg-zinc-800/60 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>{data.period.current}</div>
              <div className={`text-[11px] px-3 py-1.5 rounded-lg font-medium ${liveData ? (dk ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (dk ? "bg-zinc-800/60 text-zinc-500" : "bg-zinc-100 text-zinc-400")}`}>{liveData ? "API" : "Mock"}</div>
            </div>
          </div>
          {tab === "consolidado" && <ConsolidatedView dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
          {tab === "bm1" && <BM1View dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
          {tab === "bm2" && <BM2View dark={dk} liveData={liveData} loading={loadingLive} error={liveError} />}
          {tab === "instagram" && <InstagramView dark={dk} apiConfig={apiConfig} />}
          {tab === "config" && <ConfigView dark={dk} apiConfig={apiConfig} setApiConfig={setApiConfig} />}
        </main>
      </div>
    </DataCtx.Provider>
  );
}
