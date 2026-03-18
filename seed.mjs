// seed.mjs — popula o Supabase com os dados do dashboard
// Executar: node --env-file=.env seed.mjs

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
  process.exit(1);
}

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
  instagram: {
    maia: {
      profile: { followers_count: 28430, follows_count: 1250, media_count: 1842, username: "lojasmaiaof", name: "Lojas Maia" },
      recentPosts: [],
      stories: [],
      accountInsights: {
        follower_count: [{ end_time: "2026-03-07", value: 27980 }, { end_time: "2026-03-13", value: 28430 }],
        reach: [{ end_time: "2026-03-07", value: 4200 }, { end_time: "2026-03-13", value: 7800 }],
        impressions: [{ end_time: "2026-03-07", value: 5800 }, { end_time: "2026-03-13", value: 11200 }],
      },
    },
    lider: {
      profile: { followers_count: 19870, follows_count: 890, media_count: 1456, username: "lidercolchoes", name: "Líder Colchões" },
      recentPosts: [],
      stories: [],
      accountInsights: {
        follower_count: [{ end_time: "2026-03-07", value: 19580 }, { end_time: "2026-03-13", value: 19870 }],
        reach: [{ end_time: "2026-03-07", value: 3100 }, { end_time: "2026-03-13", value: 3800 }],
        impressions: [{ end_time: "2026-03-07", value: 4200 }, { end_time: "2026-03-13", value: 5200 }],
      },
    },
  },
  brands: {
    maia: { name: "Lojas Maia", handle: "@lojasmaiaof", accent: "#f59e0b", accentLight: "#fbbf24" },
    lider: { name: "Líder Colchões", handle: "@lidercolchoes", accent: "#6366f1", accentLight: "#818cf8" },
  },
};

async function upsert(section, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dashboard_data`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify({ section, data }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro na seção "${section}": ${err}`);
  }
}

async function main() {
  const sections = Object.keys(DATA);
  console.log(`Iniciando seed de ${sections.length} seções...`);
  for (const section of sections) {
    await upsert(section, DATA[section]);
    console.log(`✓ ${section}`);
  }
  console.log("\nSeed concluído! Dados disponíveis no Supabase.");
}

main().catch(e => { console.error("Falha no seed:", e.message); process.exit(1); });
