export const metadata = {
  title: 'Próximamente | e-ben marketplace',
  description: 'e-ben marketplace está en camino. El marketplace de tecnología y hogar que estabas esperando.',
};

export default function EbenComingSoonPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Space+Grotesk:wght@400;600;700&display=swap');

        .eben-page {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #0a1628;
        }

        /* Grid de circuitos de fondo */
        .eben-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(13,148,136,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.08) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
        }

        /* Glow radial central */
        .eben-page::after {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(45,212,191,0.10) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        .eben-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 2rem;
          max-width: 760px;
          width: 100%;
        }

        /* Badge en construcción */
        .badge-construccion {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(13,148,136,0.08);
          border: 1px solid rgba(13,148,136,0.3);
          color: #0d9488;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          margin-bottom: 2rem;
          animation: badge-pulse 2s ease-in-out infinite;
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0d9488;
          animation: dot-blink 1.2s step-end infinite;
          flex-shrink: 0;
        }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
        }

        @keyframes dot-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        /* Logo */
        .eben-logo {
          height: 72px;
          width: auto;
          object-fit: contain;
          margin-bottom: 2.5rem;
          filter: drop-shadow(0 4px 16px rgba(13,148,136,0.25));
          animation: logo-float 4s ease-in-out infinite;
        }

        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); filter: drop-shadow(0 4px 16px rgba(13,148,136,0.25)); }
          50% { transform: translateY(-8px); filter: drop-shadow(0 8px 28px rgba(13,148,136,0.45)); }
        }

        /* Headline */
        .eben-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          color: #0a1628;
        }

        .eben-headline span {
          background: linear-gradient(135deg, #0d9488 0%, #0a1628 50%, #0d9488 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* Subtítulo */
        .eben-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: #64748b;
          font-weight: 400;
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .eben-subtitle strong {
          color: #0d9488;
          font-weight: 600;
        }

        /* Features glass cards */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; gap: 0.75rem; }
        }

        .feature-card {
          background: #f0fdfa;
          border: 1px solid rgba(13,148,136,0.18);
          border-radius: 1rem;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
          cursor: default;
        }

        .feature-card:hover {
          background: #ccfbf1;
          border-color: rgba(13,148,136,0.45);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(13,148,136,0.12);
        }

        .feature-icon {
          font-size: 1.8rem;
        }

        .feature-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #0f4c47;
          text-align: center;
          letter-spacing: 0.02em;
        }

        /* Barra de progreso */
        .progress-section {
          margin-bottom: 2.5rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 0.6rem;
        }

        .progress-label span:last-child {
          color: #0d9488;
        }

        .progress-bar-bg {
          height: 4px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          width: 20%;
          background: linear-gradient(90deg, #0d9488, #2dd4bf, #67e8f9);
          border-radius: 999px;
          position: relative;
          animation: progress-glow 2s ease-in-out infinite;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #2dd4bf;
          box-shadow: 0 0 10px #2dd4bf, 0 0 20px rgba(45,212,191,0.5);
          animation: progress-glow 2s ease-in-out infinite;
        }

        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(45,212,191,0.5); }
          50% { box-shadow: 0 0 20px rgba(45,212,191,0.9), 0 0 40px rgba(45,212,191,0.3); }
        }

        /* Volver */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.05em;
        }

        .back-link:hover {
          color: #0d9488;
        }

        /* Circuitos decorativos en esquinas */
        .circuit-corner {
          position: fixed;
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }

        .circuit-tl { top: 0; left: 0; }
        .circuit-br { bottom: 0; right: 0; transform: rotate(180deg); }

        /* Puntos flotantes */
        .floating-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0d9488;
          opacity: 0.25;
          pointer-events: none;
          z-index: 1;
        }

        .fd1 { top: 20%; left: 10%; animation: fd-float 6s ease-in-out infinite; }
        .fd2 { top: 70%; left: 8%;  animation: fd-float 8s ease-in-out infinite 1s; }
        .fd3 { top: 35%; right: 9%; animation: fd-float 7s ease-in-out infinite 2s; }
        .fd4 { top: 80%; right: 12%; animation: fd-float 5s ease-in-out infinite 0.5s; }
        .fd5 { top: 10%; right: 25%; animation: fd-float 9s ease-in-out infinite 1.5s; opacity: 0.12; width: 10px; height: 10px; }

        @keyframes fd-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
          50% { transform: translateY(-18px) scale(1.3); opacity: 0.5; }
        }

      `}</style>

      <div className="eben-page">

        {/* Puntos flotantes decorativos */}
        <div className="floating-dot fd1" />
        <div className="floating-dot fd2" />
        <div className="floating-dot fd3" />
        <div className="floating-dot fd4" />
        <div className="floating-dot fd5" />

        {/* Circuito decorativo esquina superior izquierda */}
        <svg className="circuit-corner circuit-tl" width="220" height="220" viewBox="0 0 220 220" fill="none">
          <path d="M0 40 H60 V0" stroke="#2dd4bf" strokeWidth="1.5" fill="none"/>
          <path d="M0 80 H100 V40 H160 V0" stroke="#2dd4bf" strokeWidth="1" fill="none"/>
          <path d="M0 120 H40 V80 H80" stroke="#2dd4bf" strokeWidth="0.8" fill="none"/>
          <circle cx="60" cy="40" r="3" fill="#2dd4bf"/>
          <circle cx="160" cy="0" r="2" fill="#2dd4bf"/>
          <circle cx="100" cy="40" r="2" fill="#2dd4bf"/>
        </svg>

        {/* Circuito decorativo esquina inferior derecha */}
        <svg className="circuit-corner circuit-br" width="220" height="220" viewBox="0 0 220 220" fill="none">
          <path d="M0 40 H60 V0" stroke="#2dd4bf" strokeWidth="1.5" fill="none"/>
          <path d="M0 80 H100 V40 H160 V0" stroke="#2dd4bf" strokeWidth="1" fill="none"/>
          <path d="M0 120 H40 V80 H80" stroke="#2dd4bf" strokeWidth="0.8" fill="none"/>
          <circle cx="60" cy="40" r="3" fill="#2dd4bf"/>
          <circle cx="160" cy="0" r="2" fill="#2dd4bf"/>
          <circle cx="100" cy="40" r="2" fill="#2dd4bf"/>
        </svg>

        <div className="eben-content">

          {/* Badge */}
          <div className="badge-construccion">
            <div className="badge-dot" />
            En construcción
          </div>

          {/* Logo */}
          <img
            src="/logoeben.webp"
            alt="e-ben marketplace"
            className="eben-logo"
          />

          {/* Headline */}
          <h1 className="eben-headline">
            <span>Grandes cosas<br />se están cocinando</span>
          </h1>

          {/* Subtítulo */}
          <p className="eben-subtitle">
            Estamos construyendo el <strong>marketplace de tecnología y hogar</strong> que tu familia necesita.
            Productos inteligentes, precios reales, entrega en tu puerta.
          </p>

          {/* Cards de features */}
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🏠</span>
              <span className="feature-label">Tecnología para el hogar</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <span className="feature-label">Entrega rápida</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <span className="feature-label">Compra segura</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Desarrollo en curso</span>
              <span>20%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" />
            </div>
          </div>

          {/* Volver */}
          <a href="/" className="back-link">
            ← Volver a Benmarket
          </a>

        </div>
      </div>
    </>
  );
}
