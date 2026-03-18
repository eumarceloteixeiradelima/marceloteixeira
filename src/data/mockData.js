/* ═══════════════════════════════════════════════════
   DATA — Campanhas da apresentação Eali (07/03-13/03)
   Instagram mock alinhado com campos da Graph API
   ═══════════════════════════════════════════════════ */
export const DATA = {
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
}
