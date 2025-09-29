export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-transparent bg-transparent text-gray-300">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center">
        <img
          src="/logo_footer.png"
          alt="NIOXTEC"
          className="h-auto w-64 select-none"
          draggable="false"
        />
        <p className="max-w-xl text-sm text-gray-400 mt-2">
          Panel inteligente para controlar tus operaciones financieras: facturas, gastos y analíticas profundas con una experiencia visual moderna.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-gray-500">
          <span>© {year} Nioxtec</span>
          <span className="h-0.5 w-6 rounded-full bg-gray-700/60"></span>
          <a href="https://nioxtec.com/privacy" target="_blank" rel="noreferrer" className="transition-colors hover:text-brand">
            Privacidad
          </a>
          <span className="h-0.5 w-6 rounded-full bg-gray-700/60"></span>
          <a href="https://nioxtec.com/security" target="_blank" rel="noreferrer" className="transition-colors hover:text-brand">
            Seguridad
          </a>
          <span className="h-0.5 w-6 rounded-full bg-gray-700/60"></span>
          <a href="https://nioxtec.com/status" target="_blank" rel="noreferrer" className="transition-colors hover:text-brand">
            Estado
          </a>
        </div>
      </div>
    </footer>
  )
}
