'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ArvoreRow, PathEntry } from '@/lib/types';
import { DIMENSIONS, MEASURES, aplicarFiltroPeriodo, reaplicarPathNoFiltro } from '@/lib/aggregation';
import { fmtMes, baixarCsv } from '@/lib/formatters';
import LoadingOverlay from '@/components/LoadingOverlay';
import Tour, { type TourStep } from '@/components/Tour';
import TreeBoard from './TreeBoard';

const TOUR_STEPS: TourStep[] = [
  { selector: '.root-card', title: 'Total geral', text: 'Aqui fica o valor total do Débito Associado. Parcelas e CNR já estão contidos nele — não devem ser somados ao total.' },
  { selector: '.empresa-card', title: 'Comparativo por empresa', text: 'Débito, Parcelas e CNR agrupados por empresa. Esse card acompanha a decomposição: conforme você seleciona nós na árvore, os valores são recalculados pro recorte atual.' },
  { selector: '#btnDownloadCsv', title: 'Baixar a base em CSV', text: 'Baixa a base completa (já com os filtros de Empresa e Período aplicados, mas sem restringir pela árvore) em CSV, pronta pra abrir no Excel.' },
  { selector: '#selEmpresa', title: 'Filtrar por empresa', text: 'Escolha uma empresa aqui pra recalcular os valores só dela. Se você já tiver decomposto a árvore, ela continua aberta — só os números mudam.' },
  { selector: '#selPeriodoDe', title: 'Filtrar por período', text: 'Escolha o mês inicial e final pra ver só as trocas concluídas nesse intervalo. Sem alterar, a árvore mostra todos os meses disponíveis.' },
  { selector: '.legend', title: 'O que cada cor significa', text: 'Laranja é o Débito Associado (a métrica principal), azul é Parcelas e dourado é CNR. As mesmas cores aparecem nas barrinhas de cada nó.' },
  { selector: '.col[data-col-index="0"] .node:first-child', title: 'Clique pra decompor', text: 'Cada card é um valor dessa dimensão. Clique nele pra abrir a próxima coluna. Segurando Ctrl (ou Cmd no Mac) e clicando em outro card do mesmo nível, você decompõe a soma dos dois juntos.' },
  { selector: '.col[data-col-index="0"] .node:first-child .pct', title: 'Percentual do total', text: 'Mostra quanto aquele nó representa do total do nível anterior — não do total geral da árvore.' },
  { selector: '.col.col-locked', title: 'Próximos passos, à vista', text: 'As colunas mais à direita já mostram o nome da próxima dimensão, mesmo antes de você chegar nelas. Elas liberam os valores assim que você seleciona o nó anterior.' },
  { selector: '#btnReload', title: 'Atualizar dados', text: 'Os dados ficam em cache por até 1 hora. Se precisar do valor mais recente na hora, clique aqui pra forçar uma nova consulta ao Snowflake.' },
  { selector: '#stage', title: 'Mais colunas pra ver', text: 'A árvore tem 7 níveis de decomposição. Arraste pros lados ou use a barra de rolagem embaixo pra ver as colunas que não cabem na tela.' },
];

type StatusKind = 'loading' | 'error' | 'ok' | '';

export default function ArvorePage() {
  const [fullData, setFullData] = useState<ArvoreRow[]>([]);
  const [data, setData] = useState<ArvoreRow[]>([]);
  const [path, setPath] = useState<PathEntry[]>([]);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('__todas__');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [periodoDe, setPeriodoDe] = useState<string | null>(null);
  const [periodoAte, setPeriodoAte] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusKind, setStatusKind] = useState<StatusKind>('');
  const [metaInfo, setMetaInfo] = useState('carregando...');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingSub, setLoadingSub] = useState('Consultando o Snowflake...');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tourAtivo, setTourAtivo] = useState(false);

  const aplicarFiltros = useCallback((
    fd: ArvoreRow[],
    empresa: string,
    meses: string[],
    de: string | null,
    ate: string | null,
  ): ArvoreRow[] => {
    const porEmpresa = empresa === '__todas__' ? fd : fd.filter(r => r.EMPRESA === empresa);
    return aplicarFiltroPeriodo(porEmpresa, meses, de, ate);
  }, []);

  const carregarDados = useCallback(async (forcar: boolean) => {
    const isFirst = !hasLoaded;
    if (isFirst) { setIsLoading(true); setLoadingSub(forcar ? 'Consultando o Snowflake...' : 'Carregando dados...'); }
    else setIsRefreshing(true);

    setStatusMsg(forcar ? 'Consultando o Snowflake (pode levar alguns segundos)...' : 'Carregando dados (usa cache de até 1h, se disponível)...');
    setStatusKind('loading');

    try {
      const url = forcar ? '/api/dados-arvore?atualizar=1' : '/api/dados-arvore';
      const resp = await fetch(url, { cache: 'no-store' });
      const json = await resp.json();
      if (!resp.ok || json.error) throw new Error(json.error || `HTTP ${resp.status}`);

      const fd: ArvoreRow[] = json.dados ?? [];
      const novasEmpresas = [...new Set(fd.map((r: ArvoreRow) => r.EMPRESA).filter(Boolean))].sort();
      const novosMeses = [...new Set(fd.map((r: ArvoreRow) => r.MES_CONCLUSAO).filter(Boolean))].sort() as string[];
      const de = novosMeses[0] ?? null;
      const ate = novosMeses[novosMeses.length - 1] ?? null;

      setFullData(fd);
      setEmpresas(novasEmpresas);
      setMesesDisponiveis(novosMeses);
      setPeriodoDe(de);
      setPeriodoAte(ate);
      setEmpresaSelecionada('__todas__');
      setData(aplicarFiltros(fd, '__todas__', novosMeses, de, ate));
      setPath([]);
      setMetaInfo(`${json.linhas} combinações · atualizado em ${json.geradoEm ? new Date(json.geradoEm).toLocaleString('pt-BR') : '--'}`);
      setStatusMsg('');
      setStatusKind('');
      setHasLoaded(true);
    } catch (err) {
      setStatusMsg('Erro ao carregar dados: ' + (err instanceof Error ? err.message : String(err)));
      setStatusKind('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [hasLoaded, aplicarFiltros]);

  useEffect(() => { carregarDados(false); }, []);

  useEffect(() => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  function handleEmpresaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const empresa = e.target.value;
    setEmpresaSelecionada(empresa);
    const novoData = aplicarFiltros(fullData, empresa, mesesDisponiveis, periodoDe, periodoAte);
    setData(novoData);
    setPath(reaplicarPathNoFiltro(novoData, path));
  }

  function handlePeriodoDeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    let de = e.target.value;
    let ate = periodoAte;
    if (de > (ate ?? '')) ate = de;
    setPeriodoDe(de);
    setPeriodoAte(ate);
    const novoData = aplicarFiltros(fullData, empresaSelecionada, mesesDisponiveis, de, ate);
    setData(novoData);
    setPath(reaplicarPathNoFiltro(novoData, path));
  }

  function handlePeriodoAteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    let ate = e.target.value;
    let de = periodoDe;
    if (ate < (de ?? '')) de = ate;
    setPeriodoDe(de);
    setPeriodoAte(ate);
    const novoData = aplicarFiltros(fullData, empresaSelecionada, mesesDisponiveis, de, ate);
    setData(novoData);
    setPath(reaplicarPathNoFiltro(novoData, path));
  }

  function handleDownloadCsv() {
    const colunas = ['EMPRESA', ...DIMENSIONS, 'MES_CONCLUSAO', ...MEASURES.map(m => m.key)];
    const agora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const nome = `arvore-troca-titularidade-${agora.getFullYear()}${pad(agora.getMonth() + 1)}${pad(agora.getDate())}-${pad(agora.getHours())}${pad(agora.getMinutes())}.csv`;
    baixarCsv(nome, colunas, data as unknown as Record<string, unknown>[]);
  }

  function handleTourStart() {
    setPath([]);
    setTourAtivo(true);
  }

  const periodoDesabilitado = !mesesDisponiveis.length;

  return (
    <>
      <LoadingOverlay active={isLoading} sub={loadingSub} />
      <Tour steps={TOUR_STEPS} active={tourAtivo} onClose={() => setTourAtivo(false)} />

      <div className="wrap">
        <header id="siteHeader">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="title-block">
              <h1>Árvore de Troca de Titularidade</h1>
              <div className="meta-line">
                <span className="meta" id="metaInfo">{metaInfo}</span>
                <span className="badge-ano">Ano de referência: 2026</span>
              </div>
            </div>
          </div>

          <div className="controls">
            <div className="filtro-empresa">
              <label htmlFor="selEmpresa">Empresa</label>
              <span className="select-shell">
                <select id="selEmpresa" value={empresaSelecionada} onChange={handleEmpresaChange}>
                  <option value="__todas__">Todas</option>
                  {empresas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <svg viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>

            <div className="filtro-periodo">
              <label htmlFor="selPeriodoDe">Período</label>
              <span className="select-shell">
                <select id="selPeriodoDe" disabled={periodoDesabilitado} value={periodoDe ?? ''} onChange={handlePeriodoDeChange}>
                  {periodoDesabilitado
                    ? <option value="">--</option>
                    : mesesDisponiveis.map(m => <option key={m} value={m}>{fmtMes(m)}</option>)
                  }
                </select>
                <svg viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="periodo-sep">até</span>
              <span className="select-shell">
                <select id="selPeriodoAte" disabled={periodoDesabilitado} value={periodoAte ?? ''} onChange={handlePeriodoAteChange}>
                  {periodoDesabilitado
                    ? <option value="">--</option>
                    : mesesDisponiveis.map(m => <option key={m} value={m}>{fmtMes(m)}</option>)
                  }
                </select>
                <svg viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>

            <div className="legend">
              <span><i className="swatch" style={{ background: 'var(--m1)' }} />Débito Associado</span>
              <span><i className="swatch" style={{ background: 'var(--m2)' }} />Parcelas</span>
              <span><i className="swatch" style={{ background: 'var(--m3)' }} />CNR</span>
            </div>

            <button className="guide-btn" id="btnGuia" type="button" onClick={handleTourStart}>
              <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.7" stroke="currentColor" strokeWidth="1.5" /><path d="M7.7 7.9a2.3 2.3 0 1 1 3.15 2.14c-.75.32-1.35.9-1.35 1.76v.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14.3" r="0.95" fill="currentColor" /></svg>
              <span>Guia de uso</span>
            </button>

            <button
              className={`reload${isRefreshing ? ' is-loading' : ''}`}
              id="btnReload"
              type="button"
              disabled={isRefreshing}
              onClick={() => carregarDados(true)}
            >
              <svg viewBox="0 0 20 20" fill="none"><path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6M16.5 3v4.5H12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>Recarregar dados</span>
            </button>
          </div>
        </header>

        <div
          id="status"
          className={statusKind}
          style={{ display: statusMsg ? 'flex' : 'none' }}
        >
          {statusKind === 'loading' && <span className="spin" />}
          <span>{statusMsg}</span>
        </div>

        <TreeBoard
          data={data}
          path={path}
          onPathChange={setPath}
          onDownloadCsv={handleDownloadCsv}
          isRefreshing={isRefreshing}
        />

        <footer>
          Dados ao vivo via Next.js + Snowflake. Clique num nó (ou pressione Enter) pra expandir a próxima coluna; segure Ctrl/Cmd e clique em outro do mesmo nível pra combinar os dois. Base filtrada para o ano de 2026.
        </footer>
      </div>
    </>
  );
}
