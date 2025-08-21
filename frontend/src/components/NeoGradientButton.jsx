import React from 'react'

const NeoGradientButton = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  icon = null 
}) => {
  return (
    <>
      <style>{`
        :root{ --pcb-stroke:#CFF6FF; }
        .neo-gradient-btn{
          position:relative; display:inline-flex; align-items:center; gap:14px;
          padding:16px 28px; border-radius:999px; color:white; font-weight:700; letter-spacing:.2px;
          background:linear-gradient(90deg,#195569 0%, #197391 25%, #197D9B 50%, #1987A5 75%, #0F9BC3 100%);
          border:1px solid rgba(255,255,255,.18);
          box-shadow:0 14px 28px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.28);
          transition:transform .15s ease, box-shadow .25s ease, filter .25s ease;
          isolation:isolate; overflow:hidden;
        }
        .neo-gradient-btn > .layer{ position:relative; z-index:3; }
        .neo-gradient-btn::before{ content:""; position:absolute; inset:-6px; border-radius:inherit; box-shadow:0 0 0 1px rgba(18,227,255,.06), 0 20px 60px rgba(0,160,210,.15); pointer-events:none; }
        .neo-gradient-btn::after{ content:""; position:absolute; right:72px; top:-10px; width:170px; height:56px; background:radial-gradient(60% 70% at 50% 50%, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 70%); filter:blur(8px); opacity:.55; transform:rotate(10deg); transition:transform .6s ease, opacity .3s ease; border-radius:999px; pointer-events:none; mix-blend-mode:screen; z-index:2; }
        .neo-gradient-btn:hover{ transform:translateY(-1px); box-shadow:0 18px 36px rgba(0,0,0,.38), 0 4px 10px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.30); }
        .neo-gradient-btn:hover::after{ transform:translateX(26px) rotate(10deg); opacity:.75; }
        .neo-gradient-btn:active{ transform:translateY(0); filter:saturate(1.05); }
        .neo-gradient-btn:focus-visible{ outline:none; box-shadow:0 0 0 4px rgba(255,255,255,.28), 0 12px 28px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.30); }
        .neo-gradient-btn:disabled{ opacity:0.5; cursor:not-allowed; transform:none !important; }
        .neo-plus{ width:44px; height:44px; border-radius:999px; display:grid; place-items:center; background:rgba(255,255,255,.14); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,.45); box-shadow:inset 0 1px 0 rgba(255,255,255,.55), inset 0 -10px 18px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.32); }
        .neo-plus svg{ stroke:white; }
        /* Capa PCB: cobertura total, sin pads visibles */
        .pcb{ position:absolute; inset:0; border-radius:inherit; z-index:1; pointer-events:none; }
        .pcb svg{ width:100%; height:100%; display:block; opacity:.62; mix-blend-mode:screen; filter: drop-shadow(0 0 6px rgba(120,235,255,.24)) drop-shadow(0 0 14px rgba(120,235,255,.14)); }
        .pcb .trace{ stroke:var(--pcb-stroke); stroke-opacity:.8; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }

        /* ======= PULSOS DE ENERGÍA QUE SIGUEN LAS LÍNEAS ======= */
        .pcb .pulse{ stroke:#ffffff; stroke-width:3.8; fill:none; stroke-linecap:round; filter:url(#glow); opacity:0; 
          /* un solo segmento brillante que recorre toda la línea */
          stroke-dasharray:120 9999; stroke-dashoffset:0; animation:travel 2.6s linear infinite; animation-play-state:paused; }
        .pcb .pulse.b{ animation-duration:3.1s; animation-delay:.2s; stroke-dasharray:90 9999; }
        .pcb .pulse.c{ animation-duration:2.1s; animation-delay:.55s; stroke-dasharray:70 9999; }
        .neo-gradient-btn:hover .pcb .pulse{ opacity:.95; animation-play-state:running; }
        .neo-gradient-btn:disabled:hover .pcb .pulse{ opacity:0; animation-play-state:paused; }
        @keyframes travel{ to{ stroke-dashoffset:-1200; } }
      `}</style>

      <button 
        className={`neo-gradient-btn ${className}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={typeof children === 'string' ? children : 'Acción'}
      >
        {/* Capa decorativa de circuito (trazas rectas 45°/90°, sin pads) */}
        <div className="pcb" aria-hidden>
          <svg viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              {/* Glow suave para los pulsos */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Red de trazas ortogonales y a 45° que recorren todo el botón */}
            <path id="t1" className="trace" d="M0 28 H110 L150 68 H250 L290 28 H390 L430 68 H540 L580 28 H700"/>
            <path id="t2" className="trace" d="M0 58 H80 L120 38 L170 38 L210 78 H330 L370 38 L480 38 L520 78 H700"/>
            <path id="t3" className="trace" d="M0 92 H130 L170 52 H260 L300 72 L360 72 L400 52 H470 L510 92 H700"/>
            <path id="t4" className="trace" d="M0 12 H100 L140 32 L220 32 L260 12 H330 L370 32 L450 32 L490 12 H700"/>
            <path id="t5" className="trace" d="M0 106 H90 L140 86 H240 L300 106 H420 L470 86 H560 L610 106 H700"/>

            {/* Pulsos que siguen exactamente las mismas rutas */}
            <path className="pulse a" d="M0 28 H110 L150 68 H250 L290 28 H390 L430 68 H540 L580 28 H700"/>
            <path className="pulse b" d="M0 58 H80 L120 38 L170 38 L210 78 H330 L370 38 L480 38 L520 78 H700"/>
            <path className="pulse c" d="M0 92 H130 L170 52 H260 L300 72 L360 72 L400 52 H470 L510 92 H700"/>
            <path className="pulse b" d="M0 12 H100 L140 32 L220 32 L260 12 H330 L370 32 L450 32 L490 12 H700"/>
            <path className="pulse c" d="M0 106 H90 L140 86 H240 L300 106 H420 L470 86 H560 L610 106 H700"/>
          </svg>
        </div>

        {icon && (
          <span className="neo-plus layer" aria-hidden>
            {icon}
          </span>
        )}
        
        <span className="text-[18px] layer">{children}</span>
      </button>
    </>
  )
}

export default NeoGradientButton
