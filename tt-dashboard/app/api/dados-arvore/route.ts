import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { executeQuery } from '@/lib/snowflake';
import type { ArvoreRow } from '@/lib/types';

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache', 'dados-arvore.json');
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

const SQL = `
  SELECT
    EMPRESA,
    CLASSE_CONSUMO,
    SEGMENTO,
    STATUS_COMERCIAL,
    ORIGEM_TROCA,
    GRUPO_TARIFARIO,
    VERIFICACAO,
    FATURA_FINAL,
    TO_CHAR(DATE_TRUNC('MONTH', DATA_CONCLUSAO), 'YYYY-MM') AS MES_CONCLUSAO,
    SUM(TOTAL_AB_CC_ANT)   AS TOTAL_AB_CC_ANT,
    SUM(TOTAL_AB_PARCELAS) AS TOTAL_AB_PARCELAS,
    SUM(VALOR_CNR)         AS VALOR_CNR
  FROM SB_COBRANCA.EQTL_CORP.CB_ARVORE_TT_CORP
  GROUP BY ALL
`;

interface CacheFile {
  timestamp: string;
  data: ArvoreRow[];
}

function lerCache(): CacheFile | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const stat = fs.statSync(CACHE_FILE);
    if (Date.now() - stat.mtimeMs > CACHE_TTL_MS) return null;
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as CacheFile;
  } catch {
    return null;
  }
}

function escreverCache(dados: ArvoreRow[], timestamp: string): void {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp, data: dados }, null, 0), 'utf8');
}

function normalizarNumericas(rows: Record<string, unknown>[]): ArvoreRow[] {
  const numericas = ['TOTAL_AB_CC_ANT', 'TOTAL_AB_PARCELAS', 'VALOR_CNR'];
  return rows.map(row => {
    const normalized = { ...row };
    numericas.forEach(col => {
      if (normalized[col] != null) {
        normalized[col] = parseFloat(String(normalized[col]).replace(',', '.')) || 0;
      }
    });
    return normalized as unknown as ArvoreRow;
  });
}

export async function GET(request: NextRequest) {
  const forcarAtualizacao = request.nextUrl.searchParams.has('atualizar');

  try {
    if (!forcarAtualizacao) {
      const cache = lerCache();
      if (cache) {
        return NextResponse.json({
          geradoEm: cache.timestamp,
          linhas: cache.data.length,
          dados: cache.data,
        });
      }
    }

    const rows = await executeQuery<Record<string, unknown>>(SQL);
    const dados = normalizarNumericas(rows);
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    escreverCache(dados, timestamp);

    return NextResponse.json({ geradoEm: timestamp, linhas: dados.length, dados });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
