import type { ArvoreRow, PathEntry, AggregatedNode } from './types';

export const DIMENSIONS = [
  'FATURA_FINAL', 'ORIGEM_TROCA', 'VERIFICACAO',
  'GRUPO_TARIFARIO', 'SEGMENTO', 'CLASSE_CONSUMO', 'STATUS_COMERCIAL',
] as const;

export type Dimension = typeof DIMENSIONS[number];

export const DIMENSION_LABELS: Partial<Record<string, string>> = {
  STATUS_COMERCIAL: 'STATUS PRÉ TT',
};

export function labelDim(dim: string): string {
  return DIMENSION_LABELS[dim] ?? dim;
}

export const MEASURES = [
  { key: 'TOTAL_AB_CC_ANT', label: 'Débito', color: 'var(--m1)' },
  { key: 'TOTAL_AB_PARCELAS', label: 'Parcelas', color: 'var(--m2)' },
  { key: 'VALOR_CNR', label: 'CNR', color: 'var(--m3)' },
] as const;

export type MeasureKey = typeof MEASURES[number]['key'];

export function filterByPath(data: ArvoreRow[], path: PathEntry[]): ArvoreRow[] {
  return data.filter(row =>
    path.every(p => p.values.includes(row[p.dim as keyof ArvoreRow] as string))
  );
}

export function aggregate(rows: ArvoreRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  MEASURES.forEach(m => { out[m.key] = 0; });
  rows.forEach(r => MEASURES.forEach(m => { out[m.key] += (r[m.key as keyof ArvoreRow] as number) || 0; }));
  return out;
}

export function aggregateBy(rows: ArvoreRow[], dim: string): AggregatedNode[] {
  const groups: Record<string, ArvoreRow[]> = {};
  rows.forEach(r => {
    const key = (r[dim as keyof ArvoreRow] as string) ?? '(vazio)';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return Object.keys(groups)
    .map(key => ({ label: key, rows: groups[key], agg: aggregate(groups[key]) }))
    .sort((a, b) => b.agg[MEASURES[0].key] - a.agg[MEASURES[0].key]);
}

export function aplicarFiltroPeriodo(
  rows: ArvoreRow[],
  mesesDisponiveis: string[],
  periodoDe: string | null,
  periodoAte: string | null,
): ArvoreRow[] {
  if (!mesesDisponiveis.length) return rows;
  const periodoTotal =
    periodoDe === mesesDisponiveis[0] &&
    periodoAte === mesesDisponiveis[mesesDisponiveis.length - 1];
  return rows.filter(r => {
    if (!r.MES_CONCLUSAO) return periodoTotal;
    return r.MES_CONCLUSAO >= periodoDe! && r.MES_CONCLUSAO <= periodoAte!;
  });
}

export function reaplicarPathNoFiltro(data: ArvoreRow[], path: PathEntry[]): PathEntry[] {
  const novoPath: PathEntry[] = [];
  let subset = data;
  for (let level = 0; level < path.length; level++) {
    if (!subset.length) break;
    const dim = DIMENSIONS[level];
    const nodesNivel = aggregateBy(subset, dim);
    if (!nodesNivel.length) break;
    const sobreviventes = path[level].values.filter(v => nodesNivel.some(n => n.label === v));
    const valoresEscolhidos = sobreviventes.length ? sobreviventes : [nodesNivel[0].label];
    novoPath.push({ dim, values: valoresEscolhidos });
    subset = filterByPath(data, novoPath);
  }
  return novoPath;
}
