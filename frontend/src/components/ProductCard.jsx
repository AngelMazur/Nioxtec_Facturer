import React, { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * ProductCard
 * Tarjeta específica para Productos con borde visible y estética "pricing card"
 * Se inspira en el estilo de la referencia, usando el color azul principal del proyecto.
 */
const ProductCard = ({ children, className = '', onClick }) => {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)

  const handlePointerMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    el.style.setProperty('--mx', `${mx}px`)
    el.style.setProperty('--my', `${my}px`)
    if (!reduceMotion) {
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rx = ((my - cy) / cy) * -2
      const ry = ((mx - cx) / cx) * 2
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
  }
  const handlePointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
    el.style.transform = ''
  }

  return (
    <div
      ref={ref}
      className={`niox-product-card ${className}`}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <style>{`
        .niox-product-card{
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 22px;
          /* Capa 1: gradiente superior sutil / Capa 2: fondo oscuro / Capa 3: textura puntos */
          background-image:
            radial-gradient(120% 100% at 50% 0%, rgba(24,180,216,0.12) 0%, rgba(24,180,216,0.05) 40%, rgba(0,0,0,0) 70%),
            linear-gradient(180deg, rgba(12,18,26,0.80) 0%, rgba(12,18,26,0.66) 100%),
            url('/bg-dots.avif');
          background-repeat: no-repeat, no-repeat, repeat;
          background-size: cover, cover, 320px 320px;
          background-position: center, center, center;
          border: 1px solid rgba(24,180,216,0.45);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.06),
            0 12px 28px rgba(0,0,0,0.32),
            0 4px 12px rgba(0,0,0,0.22);
          transition: box-shadow .3s ease, transform .25s ease, border-color .3s ease, filter .3s ease;
        }
        /* Iluminación inferior */
        .niox-product-card::after{
          content: "";
          position: absolute;
          left: -10px; right: -10px; bottom: -10px; height: 90px;
          pointer-events: none;
          background: radial-gradient(60% 120% at 50% 120%, rgba(24,180,216,0.18) 0%, rgba(24,180,216,0.08) 40%, transparent 70%);
          filter: blur(12px);
          opacity: .9;
          z-index: 0;
        }
        /* Borde exterior y realce en hover */
        .niox-product-card .niox-card-border{ position:absolute; inset:0; border-radius:inherit; pointer-events:none; }
        .niox-product-card .niox-card-border::before{
          content:""; position:absolute; inset:0; border-radius:inherit;
          box-shadow: 0 0 0 1px rgba(24,180,216,0.75), 0 0 60px rgba(24,180,216,0.14) inset, 0 0 24px rgba(24,180,216,0.08);
          opacity:.7; transition: opacity .3s ease, box-shadow .3s ease;
        }
        .niox-product-card:hover{
          transform: translateY(-1px);
          border-color: rgba(24,180,216,0.7);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 16px 36px rgba(0,0,0,0.36),
            0 6px 16px rgba(0,0,0,0.26),
            0 0 14px rgba(24,180,216,0.08);
          filter: saturate(1.02);
        }
        .niox-product-card:hover::before{ opacity: 1; }
        .niox-product-card:focus-within::before{ opacity: 1; }
        .niox-product-card:hover .niox-card-border::before{
          opacity: .95;
          box-shadow: 0 0 0 1px rgba(24,180,216,0.9), 0 0 80px rgba(24,180,216,0.18) inset, 0 0 30px rgba(24,180,216,0.12);
        }

        /* Fila de modelo estilo botón con borde suave y glow */
        .niox-model-row{
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00));
          border: 1px solid rgba(24,180,216,0.16);
          border-radius: 12px;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease, background-color .2s ease;
          backdrop-filter: blur(2px);
        }
        .niox-model-row::before{
          content:""; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none;
          background: radial-gradient(60% 120% at 50% 120%, rgba(24,180,216,0.22), transparent 70%);
          filter: blur(8px);
          opacity: 0; transition: opacity .2s ease;
        }
        .niox-model-row:hover{
          border-color: rgba(24,180,216,0.5);
          box-shadow: 0 0 0 1px rgba(24,180,216,0.35) inset, 0 8px 24px rgba(24,180,216,0.10);
        }
        .niox-model-row:hover::before{ opacity: .6; }

        @media (min-width:768px){
          .niox-product-card{ border-radius: 20px; padding: 24px; }
        }
        @media (min-width:1024px){
          .niox-product-card{ border-radius: 22px; padding: 26px; }
        }
      `}</style>
      <div className="niox-card-border" />
      {children}
    </div>
  )
}

export default ProductCard
