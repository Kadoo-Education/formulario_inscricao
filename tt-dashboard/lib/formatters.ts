export function fmtBRL(v: number): string {
  return 'R$ ' + (v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtCompacto(v: number): string {
  const n = v || 0;
  const abs = Math.abs(n);
  if (abs >= 1e6) return (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M';
  if (abs >= 1e3) return (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'K';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export function formatarPercentual(valor: number, total: number): string {
  if (!(total > 0) || !(valor > 0)) return '0%';
  const bruto = (valor / total) * 100;
  if (bruto < 0.1) return '<0.1%';
  if (bruto > 99.9 && bruto < 100) return '>99.9%';
  const casas = bruto < 1 ? 2 : 1;
  return bruto.toFixed(casas) + '%';
}

const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function fmtMes(aaaaMm: string): string {
  const [ano, mes] = aaaaMm.split('-');
  return `${NOMES_MESES[parseInt(mes, 10) - 1]}/${ano}`;
}

function celulaCsv(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const s = String(v);
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function gerarCsv(colunas: string[], linhas: Record<string, unknown>[]): string {
  const BOM = '﻿';
  const linhasCsv = linhas.map(linha => colunas.map(c => celulaCsv(linha[c])).join(';'));
  return BOM + [colunas.join(';'), ...linhasCsv].join('\r\n');
}

export function baixarCsv(nomeArquivo: string, colunas: string[], linhas: Record<string, unknown>[]): void {
  if (!linhas.length) return;
  const csv = gerarCsv(colunas, linhas);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
