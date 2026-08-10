import type { ArvoreRow } from '@/lib/types';
import { MEASURES, aggregateBy } from '@/lib/aggregation';
import { fmtCompacto } from '@/lib/formatters';

interface Props {
  data: ArvoreRow[];
}

export default function EmpresaTable({ data }: Props) {
  const porEmpresa = aggregateBy(data, 'EMPRESA');
  return (
    <div className="empresa-card">
      <div className="label">Comparativo por empresa</div>
      {!porEmpresa.length ? (
        <div className="empty-hint">Nenhum dado para os filtros atuais.</div>
      ) : (
        <table className="empresa-table">
          <thead>
            <tr>
              <th>Empresa</th>
              {MEASURES.map(m => (
                <th key={m.key}>
                  <span className="dot" style={{ background: m.color }} />
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {porEmpresa.map(item => (
              <tr key={item.label}>
                <td title={item.label}>{item.label}</td>
                {MEASURES.map(m => (
                  <td key={m.key}>{fmtCompacto(item.agg[m.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
