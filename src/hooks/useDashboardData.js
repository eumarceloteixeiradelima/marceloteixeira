import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DATA } from '../data/mockData'

export function useDashboardData() {
  const [data, setData] = useState(DATA)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState('mock')

  useEffect(() => {
    if (!supabase) return // Sem Supabase configurado → usa mock silenciosamente

    setLoading(true)
    supabase
      .from('dashboard_data')
      .select('section, data')
      .then(({ data: rows, error }) => {
        if (error || !rows?.length) return // Fallback silencioso para mock

        const merged = { ...DATA }
        rows.forEach(row => { merged[row.section] = row.data })
        setData(merged)
        setDataSource('supabase')
      })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, dataSource }
}
