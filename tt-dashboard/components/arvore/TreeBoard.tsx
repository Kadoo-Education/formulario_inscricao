'use client';

import { useEffect, useRef } from 'react';
import type { ArvoreRow, PathEntry, ConnectorPair } from '@/lib/types';
import { DIMENSIONS, MEASURES, aggregateBy, aggregate, filterByPath, labelDim } from '@/lib/aggregation';
import RootCard from './RootCard';
import EmpresaTable from './EmpresaTable';
import TreeNode from './TreeNode';

interface Props {
  data: ArvoreRow[];
  path: PathEntry[];
  onPathChange: (path: PathEntry[]) => void;
  onDownloadCsv: () => void;
  isRefreshing: boolean;
}

function drawConnectors(
  stage: HTMLDivElement | null,
  svg: SVGSVGElement | null,
  pairs: ConnectorPair[],
) {
  if (!stage || !svg) return;
  svg.setAttribute('width', String(stage.scrollWidth));
  svg.setAttribute('height', String(stage.scrollHeight));
  svg.innerHTML = '';
  if (!pairs.length) return;

  const stageRect = stage.getBoundingClientRect();
  const respiro = 3;

  // Mede geometria de cada par
  type Seg = { x1: number; y1: number; x2: number; y2: number };
  const segs: Seg[] = [];
  for (const { fromId, toId } of pairs) {
    const fromEl = document.querySelector(`[data-nodeid="${fromId}"]`);
    const toEl   = document.querySelector(`[data-nodeid="${toId}"]`);
    if (!fromEl || !toEl) continue;
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();
    segs.push({
      x1: fr.right - stageRect.left + stage.scrollLeft + respiro,
      y1: fr.top + fr.height / 2 - stageRect.top + stage.scrollTop,
      x2: tr.left  - stageRect.left + stage.scrollLeft - respiro,
      y2: tr.top + tr.height / 2 - stageRect.top + stage.scrollTop,
    });
  }

  // Agrupa por midX (fronteira entre colunas). Cada transição de coluna tem
  // um midX único — isso isola grupos naturalmente sem cruzar níveis.
  // Dentro de cada grupo: um único trunk vertical + branches horizontais,
  // sem nenhum segmento repetido (evita artefatos de anti-aliasing).
  type Group = { midX: number; x1: number; x2: number; srcs: Set<number>; dsts: Set<number> };
  const groups = new Map<number, Group>();

  for (const { x1, y1, x2, y2 } of segs) {
    const midX = (x1 + x2) / 2;
    const key  = Math.round(midX);
    if (!groups.has(key)) groups.set(key, { midX, x1, x2, srcs: new Set(), dsts: new Set() });
    const g = groups.get(key)!;
    g.srcs.add(y1);
    g.dsts.add(y2);
  }

  groups.forEach(({ midX, x1, x2, srcs, dsts }) => {
    const allY = [...srcs, ...dsts];
    const yMin = Math.min(...allY);
    const yMax = Math.max(...allY);

    let d = '';
    if (yMin !== yMax) d += `M ${midX} ${yMin} L ${midX} ${yMax} `;
    srcs.forEach(y => { d += `M ${x1} ${y} L ${midX} ${y} `; });
    dsts.forEach(y => { d += `M ${midX} ${y} L ${x2} ${y} `; });

    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d.trim());
    el.setAttribute('stroke', '#FF5A1F');
    el.setAttribute('stroke-width', '1.5');
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke-linecap', 'round');
    el.setAttribute('stroke-linejoin', 'round');
    el.setAttribute('opacity', '0.6');
    svg.appendChild(el);
  });
}

export default function TreeBoard({ data, path, onPathChange, onDownloadCsv, isRefreshing }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calcula quais pares de conectores desenhar (determinístico a partir do path+data)
  const connectorPairs: ConnectorPair[] = [];
  {
    let lastActiveIds = ['root'];
    let subset = data;
    let travado = false;
    for (let level = 0; level < DIMENSIONS.length; level++) {
      if (travado || !subset.length) break;
      const dim = DIMENSIONS[level];
      const nodes = aggregateBy(subset, dim);
      const activeIdsLevel: string[] = [];
      nodes.forEach((node, idx) => {
        if (path[level]?.values.includes(node.label)) activeIdsLevel.push(`c${level}_${idx}`);
      });
      if (activeIdsLevel.length) {
        lastActiveIds.forEach(from => activeIdsLevel.forEach(to => connectorPairs.push({ fromId: from, toId: to })));
        lastActiveIds = activeIdsLevel;
      }
      subset = path[level] ? filterByPath(data, path.slice(0, level + 1)) : [];
      if (!path[level]) travado = true;
    }
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      drawConnectors(stageRef.current, svgRef.current, connectorPairs);
    });
    return () => cancelAnimationFrame(id);
  });

  useEffect(() => {
    const onResize = () => drawConnectors(stageRef.current, svgRef.current, []);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const totalGeral = aggregate(data);
  const subsetAtual = filterByPath(data, path);

  // Scroll pro final após mudança de path
  useEffect(() => {
    requestAnimationFrame(() => {
      const cols = document.querySelectorAll('.col');
      const last = cols[cols.length - 1];
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
    });
  }, [path.length]);

  const renderColumns = () => {
    const cols = [];
    let subset = data;
    let travado = false;

    for (let level = 0; level < DIMENSIONS.length; level++) {
      const dim = DIMENSIONS[level];

      if (travado || !subset.length) {
        cols.push(
          <div key={`locked-${level}`} className="col col-locked" data-col-index={level}>
            <div className="col-head col-head-locked">
              <span className="name">{labelDim(dim)}</span>
            </div>
            <div className="locked-hint">Selecione o nó anterior para ver as opções</div>
          </div>
        );
        travado = true;
        continue;
      }

      const nodes = aggregateBy(subset, dim);
      const maxVal = Math.max(...nodes.map(n => n.agg[MEASURES[0].key]), 1);
      const totalPaiObj = level === 0
        ? totalGeral
        : aggregate(filterByPath(data, path.slice(0, level)));

      cols.push(
        <div
          key={dim}
          className="col"
          data-col-index={level}
          style={{ animationDelay: `${level * 0.03}s` }}
        >
          <div className="col-head">
            <span className="name">{labelDim(dim)}</span>
            <span className="count">{nodes.length}</span>
          </div>
          <div className="nodes">
            {nodes.map((node, idx) => (
              <TreeNode
                key={node.label}
                node={node}
                nodeId={`c${level}_${idx}`}
                level={level}
                isActive={!!(path[level]?.values.includes(node.label))}
                maxVal={maxVal}
                totalPai={totalPaiObj[MEASURES[0].key]}
                path={path}
                data={data}
                onPathChange={onPathChange}
              />
            ))}
          </div>
        </div>
      );

      subset = path[level] ? filterByPath(data, path.slice(0, level + 1)) : [];
      if (!path[level]) travado = true;
    }
    return cols;
  };

  return (
    <div className="stage" id="stage" ref={stageRef}>
      <svg className="connectors" ref={svgRef} id="svgConnectors" />
      <div className={`board${isRefreshing ? ' is-refreshing' : ''}`} id="board">
        <div className="root-col root-block">
          <RootCard totais={totalGeral} />
          <EmpresaTable data={subsetAtual} />
          <button className="download-btn" id="btnDownloadCsv" type="button" onClick={onDownloadCsv}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 15.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Baixar base (CSV)</span>
          </button>
        </div>

        {!data.length ? (
          <div className="col">
            <div className="empty-hint">Nenhum dado para os filtros atuais.</div>
          </div>
        ) : (
          renderColumns()
        )}
      </div>
    </div>
  );
}
