/**
 * seed.js — Popula o Supabase com os dados iniciais do dashboard
 *
 * Como usar:
 *   1. Configure o .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 *   2. No console do browser (com o app aberto), importe e execute:
 *        import { seedDatabase } from './src/lib/seed.js'
 *        await seedDatabase()
 *   Ou cole o conteúdo de seedDatabase() diretamente no console.
 */

import { supabase } from './supabase'
import { DATA } from '../data/mockData'

export async function seedDatabase() {
  if (!supabase) {
    console.error('Supabase não configurado. Verifique o arquivo .env')
    return
  }

  const sections = ['period', 'consolidated', 'bm1', 'bm2', 'pdvs', 'topCreatives', 'instagram', 'brands']

  for (const section of sections) {
    const { error } = await supabase
      .from('dashboard_data')
      .upsert({ section, data: DATA[section] }, { onConflict: 'section' })

    if (error) {
      console.error(`Erro ao salvar seção "${section}":`, error.message)
    } else {
      console.log(`✓ Seção "${section}" salva com sucesso`)
    }
  }

  console.log('Seed concluído!')
}
