export interface ArvoreRow {
  EMPRESA: string;
  CLASSE_CONSUMO: string;
  SEGMENTO: string;
  STATUS_COMERCIAL: string;
  ORIGEM_TROCA: string;
  GRUPO_TARIFARIO: string;
  VERIFICACAO: string;
  FATURA_FINAL: string;
  MES_CONCLUSAO: string;
  TOTAL_AB_CC_ANT: number;
  TOTAL_AB_PARCELAS: number;
  VALOR_CNR: number;
}

export interface PathEntry {
  dim: string;
  values: string[];
}

export interface AggregatedNode {
  label: string;
  rows: ArvoreRow[];
  agg: Record<string, number>;
}

export interface ConnectorPair {
  fromId: string;
  toId: string;
}

export interface ApiResponse {
  geradoEm: string;
  linhas: number;
  dados: ArvoreRow[];
  error?: string;
}
