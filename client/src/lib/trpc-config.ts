# Criar um arquivo de configuração central para o tRPC
cat > client/src/lib/trpc-config.ts << 'EOF'
// Configuração centralizada do tRPC para garantir URL correta

export function getBaseUrl() {
  // No navegador, usa a origem atual
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // No build/SSR, tenta usar VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback para desenvolvimento local
  return "http://localhost:5000";
}

export const TRPC_URL = `${getBaseUrl()}/api/trpc`;
EOF
