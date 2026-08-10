import Link from 'next/link';

export default function CapaPage() {
  return (
    <div className="capa-root">
      <div className="capa-hero">
        <div className="capa-brand-row">
          <div className="capa-brand-dot" />
          <span className="capa-brand-name">Equatorial Energia · BI Cobrança</span>
        </div>
        <h1>Dashboard de<br />Cobrança</h1>
        <p className="capa-hero-sub">
          Análise e monitoramento do débito associado com segmentação por empresa,
          canal de atendimento, perfil de cliente e status comercial.
          Inclui módulo de troca de titularidade.
        </p>
        <div className="capa-meta-row">
          <div className="capa-meta-item">
            <span className="capa-meta-label">Fonte</span>
            <span className="capa-meta-val">Snowflake · SB_COBRANCA</span>
          </div>
          <div className="capa-meta-item">
            <span className="capa-meta-label">Atualização</span>
            <span className="capa-meta-val">Cache de 1 hora</span>
          </div>
          <div className="capa-meta-item">
            <span className="capa-meta-label">Schema</span>
            <span className="capa-meta-val">EQTL_CORP</span>
          </div>
        </div>
      </div>

      <div className="capa-body">
        <div className="capa-section-label">Módulos disponíveis</div>
        <div className="capa-modules">

          <Link href="/arvore" className="capa-module">
            <div className="capa-module-accent" style={{ background: 'linear-gradient(90deg,#FF5A1F,#C98A1F)' }} />
            <div className="capa-module-icon" style={{ background: '#FFF2EC' }}>
              <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="4" cy="11" r="2.2" stroke="#FF5A1F" strokeWidth="1.5"/>
                <circle cx="18" cy="5.5" r="2.2" stroke="#FF5A1F" strokeWidth="1.5"/>
                <circle cx="18" cy="16.5" r="2.2" stroke="#FF5A1F" strokeWidth="1.5"/>
                <path d="M6.2 11h5.3M11.5 11V5.5h4.3M11.5 11v5.5h4.3" stroke="#FF5A1F" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="capa-module-title">Árvore de Devedores</div>
              <div className="capa-module-desc">
                Segmentação hierárquica do débito por empresa, tipo de serviço, canal,
                perfil de cliente e status comercial. Navegação drill-down por nível.
              </div>
            </div>
            <div className="capa-module-footer">
              <span className="capa-module-link">
                Acessar
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </Link>

          <div className="capa-module capa-module-disabled">
            <div className="capa-module-accent" style={{ background: 'linear-gradient(90deg,#2E86D1,#3AA0E8)' }} />
            <div className="capa-module-icon" style={{ background: '#EFF6FD' }}>
              <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="16" height="12" rx="2" stroke="#2E86D1" strokeWidth="1.5"/>
                <path d="M3 9h16" stroke="#2E86D1" strokeWidth="1.5"/>
                <path d="M8 13.5h6M8 11.5h3.5" stroke="#2E86D1" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="capa-module-title">Troca de Titularidade</div>
              <div className="capa-module-desc">
                Análise de transferências de titularidade de contratos, volume por período,
                perfil dos clientes envolvidos e impacto no débito associado.
              </div>
            </div>
            <div className="capa-module-footer">
              <span className="capa-badge-soon">Em breve</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
