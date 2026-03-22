# Rywoox

> Hub de jeux rétro personalisé — [https://rywoox.com](https://rywoox.com)

[![CI](https://github.com/CharlesBinard/rywoox-website/actions/workflows/ci.yml/badge.svg)](https://github.com/CharlesBinard/rywoox-website/actions/workflows/ci.yml)
[![Deploy](https://github.com/CharlesBinard/rywoox-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/CharlesBinard/rywoox-website/actions/workflows/deploy.yml)

---

## 🎮 Jeux Disponibles

| Jeu | Description |
|-----|-------------|
| 🎮 **Connect Four** | Classique jeu de Puissance 4 contre l'IA — aligne 4 pions pour gagner |
| 🐦 **Flappy** | Bird qui évite les tuyaux — un classique infini |
| 🧠 **Memory** | Retrouve les paires de cartes — entraîne ta mémoire |
| 🏓 **Pong** | Le jeu de ping-pong originel — 1v1 ou vs IA |
| 🐍 **Snake** | Mange, grandis, évite de te mordre la queue |
| 🧱 **Tetris** | Blocs qui tombent, lignes qui disparaissent — le grand classique |
| ❌⭕ **TicTacToe** | Morpion au tour par tour — simple mais efficace |

Chaque jeu intègre des features IA via **Gemini AI** (via `@ai-sdk/google`).

---

## 🛠 Stack

- ⚡ **Vite** + **React 19**
- 🎨 **Tailwind CSS 4**
- 🔀 **TanStack Router**
- 🦾 **TypeScript**
- ✨ **Framer Motion**
- 🤖 **Gemini AI** (`@ai-sdk/google`)

---

## 🚀 Installation

```bash
git clone https://github.com/CharlesBinard/rywoox-website.git
cd rywoox-website
bun install
bun run dev
```

> Le fichier `.env.production.example` contient les variables nécessaires pour la prod.

---

## 🐳 Déploiement

### Docker

```bash
cp .env.production.example .env
# Édite .env et ajoute ta clé API Gemini
docker compose up -d --build
```

Le conteneur expose le site sur **port 3000** et sert les assets statiques via **nginx**.

---

## ⚙️ Development

```bash
bun run dev      # dev server
bun run build    # production build
bun run preview  # preview production build
bun run lint     # lint avec Biome
bun run format   # format avec Biome
bun run check    # lint + format check
bun run typecheck # vérification TypeScript
```

---

## 🔄 CI/CD

Push sur n'importe quelle branche → **lint → typecheck → build**

Push sur `main` → build & push de l'image Docker vers **GHCR** (`ghcr.io/CharlesBinard/rywoox-website`)

---

## 📦 Fonctionnalités

- 📱 **PWA** installable — Service Worker + manifest.json
- 🏆 **Leaderboard local** — scores sauvegardés dans localStorage
- 🌙 **UI dark/neon** — theme retro avec animations fluides via Framer Motion
- 🔄 **Routing** — navigation SPA avec TanStack Router

---

## 🤝 Contributing

Les contributions sont les bienvenues ! Ouvre une PR.

---

## 📜 License

MIT
