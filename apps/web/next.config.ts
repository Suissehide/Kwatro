import path from 'node:path'
import type { NextConfig } from 'next'

// Le .env est à la racine du monorepo (NEXT_PUBLIC_API_URL) ; sans effet sur les variables déjà définies (build Docker)
try {
  process.loadEnvFile(path.join(__dirname, '../../.env'))
} catch {}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Image Docker légère : serveur Node autonome (voir deploy/web/Dockerfile)
  output: 'standalone',
  // Monorepo : trace les dépendances depuis la racine du dépôt
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Design system en React Native, rendu sur le web par react-native-web
  transpilePackages: ['@kwatro/design-system', 'react-native-web'],
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
      // Icônes du design system : même API, rendues en <svg> du DOM (react-native-svg ne compile pas ici)
      'lucide-react-native': 'lucide-react',
    },
    resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
}

export default nextConfig
