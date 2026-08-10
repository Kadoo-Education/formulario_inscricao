'use client';

interface Props {
  active: boolean;
  sub: string;
}

export default function LoadingOverlay({ active, sub }: Props) {
  return (
    <div className={`loading-overlay${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <div className="loading-card">
        <div className="loading-ring" aria-hidden="true" />
        <div className="loading-title">Montando a árvore de decomposição</div>
        <div className="loading-sub">{sub}</div>
        <div className="loading-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
