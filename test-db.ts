import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local manually
const envPath = join(__dirname, '.env.local');
const fs = await import('fs');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = rest.join('=').trim();
  }
}

const { getMetricasGerais, getLeadsPorEtapa, getLeadsPorCidade, getLeadsPorPeriodo, getLeadsAumentoConsumo, getLeadsRecentes } = await import('./src/lib/admin-db.ts');

const metricas = await getMetricasGerais();
console.log('Metricas:', JSON.stringify(metricas, null, 2));

const etapa = await getLeadsPorEtapa();
console.log('Etapa:', JSON.stringify(etapa, null, 2));

const cidade = await getLeadsPorCidade();
console.log('Cidade:', JSON.stringify(cidade, null, 2));

const periodo = await getLeadsPorPeriodo(30);
console.log('Periodo (first 5):', JSON.stringify(periodo.slice(0,5), null, 2));

const aumento = await getLeadsAumentoConsumo();
console.log('Aumento:', JSON.stringify(aumento, null, 2));

const recentes = await getLeadsRecentes(20);
console.log('Recentes (first 3):', JSON.stringify(recentes.slice(0,3), null, 2));