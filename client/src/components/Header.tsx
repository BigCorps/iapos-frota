import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-lg">
            IA
          </div>
          <span className="text-xl font-bold text-foreground">IAPOS</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-foreground hover:text-accent transition-colors">
            Funcionalidades
          </a>
          <a href="#benefits" className="text-foreground hover:text-accent transition-colors">
            Benefícios
          </a>
          <a href="#pricing" className="text-foreground hover:text-accent transition-colors">
            Planos
          </a>
          <a href="#contact" className="text-foreground hover:text-accent transition-colors">
            Contato
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.414 5.414a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM5 8a1 1 0 100-2H4a1 1 0 100 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Login Button */}
          <a
            href={getLoginUrl()}
            className="hidden rounded-lg bg-accent px-6 py-2 font-semibold text-accent-foreground transition-all hover:opacity-90 sm:inline-block"
          >
            Entrar
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <a
              href="#features"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="#benefits"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefícios
            </a>
            <a
              href="#pricing"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planos
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </a>
            <a
              href={getLoginUrl()}
              className="rounded-lg bg-accent px-6 py-2 font-semibold text-accent-foreground text-center transition-all hover:opacity-90"
            >
              Entrar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
