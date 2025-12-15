export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                IA
              </div>
              <span className="text-lg font-bold text-foreground">IAPOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestão de frotas e rede de postos simplificada.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Produto</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-accent transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-accent transition-colors">
                  Planos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Empresa</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Termos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Segurança
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} IAPOS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20v-7.21H5.33V9.25h2.96V7.02c0-2.92 1.78-4.51 4.39-4.51 1.25 0 2.32.09 2.63.13v3.05h-1.81c-1.41 0-1.69.67-1.69 1.66V9.25h3.37l-.44 3.54h-2.93V20h-3.03z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
