import { MEASURES } from '@/lib/aggregation';
import { fmtBRL } from '@/lib/formatters';

interface Props {
  totais: Record<string, number>;
}

export default function RootCard({ totais }: Props) {
  const maxVal = totais[MEASURES[0].key] || 1;
  return (
    <div className="root-card" data-nodeid="root">
      <div className="label">Débito Associado</div>
      {MEASURES.map(m => {
        const value = totais[m.key] ?? 0;
        const pct = maxVal > 0 ? Math.max(2, Math.min(100, (value / maxVal) * 100)) : 0;
        return (
          <div className="metric-row" key={m.key}>
            <span className="dot" style={{ background: m.color }} />
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${pct}%`, background: m.color }} />
            </span>
            <span className="lblval">
              <span className="name">{m.label}:</span>{fmtBRL(value)}
            </span>
          </div>
        );
      })}
      <div className="root-note">
        Os valores de Parcelas e CNR já estão contidos no Débito acima — não devem ser somados a ele.
      </div>
    </div>
  );
}
