/**
 * Seed de matérias via Supabase service role.
 * Uso: npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js';
import { MATERIAS } from '../src/lib/constants';

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  for (const nome of MATERIAS) {
    const { error } = await supabase.from('materias').upsert({ nome }, { onConflict: 'nome' });
    if (error) console.error(`Erro ao inserir ${nome}:`, error.message);
    else console.log(`✓ ${nome}`);
  }

  console.log('Seed concluído.');
}

seed();
