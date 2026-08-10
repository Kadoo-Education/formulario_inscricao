import type { AggregatedNode, PathEntry } from '@/lib/types';
import { MEASURES, DIMENSIONS, aggregateBy, filterByPath } from '@/lib/aggregation';
import { formatarPercentual, fmtBRL } from '@/lib/formatters';
import type { ArvoreRow } from '@/lib/types';

interface Props {
  node: AggregatedNode;
  nodeId: string;
  level: number;
  isActive: boolean;
  maxVal: number;
  totalPai: number;
  path: PathEntry[];
  data: ArvoreRow[];
  onPathChange: (path: PathEntry[]) => void;
}

export default function TreeNode({ node, nodeId, level, isActive, maxVal, totalPai, path, data, onPathChange }: Props) {
  const pct = formatarPercentual(node.agg[MEASURES[0].key], totalPai);
  const pctDoMax = maxVal > 0 ? Math.max(2, Math.min(100, (node.agg[MEASURES[0].key] / maxVal) * 100)) : 0;
  const dim = DIMENSIONS[level];

  function selecionar(comCtrl: boolean) {
    const nivelAtual = path[level];
    const jaSelecionado = !!nivelAtual && nivelAtual.values.includes(node.label);
    const novosValues = comCtrl && nivelAtual
      ? (jaSelecionado ? nivelAtual.values.filter(v => v !== node.label) : [...nivelAtual.values, node.label])
      : [node.label];

    const tinhaNiveisMaisFundos = path.length > level + 1;
    const profundidadeAlvo = tinhaNiveisMaisFundos ? path.length : level + 1;

    const novoPath = path.slice(0, level);

    if (!novosValues.length) { onPathChange(novoPath); return; }

    novoPath.push({ dim, values: novosValues });

    let subsetAuto = filterByPath(data, novoPath);
    for (let lv = level + 1; lv < profundidadeAlvo && lv < DIMENSIONS.length; lv++) {
      if (!subsetAuto.length) break;
      const nodesAuto = aggregateBy(subsetAuto, DIMENSIONS[lv]);
      if (!nodesAuto.length) break;
      novoPath.push({ dim: DIMENSIONS[lv], values: [nodesAuto[0].label] });
      subsetAuto = filterByPath(data, novoPath);
    }

    onPathChange(novoPath);
  }

  return (
    <div
      className={`node${isActive ? ' active' : ''}`}
      data-nodeid={nodeId}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`${dim}: ${node.label}, ${pct} do total`}
      onClick={e => selecionar(e.ctrlKey || e.metaKey)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar(e.ctrlKey || e.metaKey); }
      }}
    >
      <div className="lbl">
        <span>{node.label}</span>
        <span className="pct">{pct}</span>
      </div>
      <div className="headline-bar">
        <div className="headline-fill" style={{ width: `${pctDoMax}%` }} />
      </div>
      {MEASURES.map(m => {
        const value = node.agg[m.key] ?? 0;
        const barPct = maxVal > 0 ? Math.max(2, Math.min(100, (value / maxVal) * 100)) : 0;
        return (
          <div className="metric-row" key={m.key}>
            <div className="top-line">
              <span className="lblval">
                <span className="dot" style={{ background: m.color, display: 'inline-block', width: 6, height: 6, borderRadius: 1, marginRight: 4 }} />
                <span className="name">{m.label}:</span>{fmtBRL(value)}
              </span>
            </div>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${barPct}%`, background: m.color }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
