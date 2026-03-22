# Rywoox.com 🚀

Personal website with a futuristic AI chat interface powered by Gemini 3.1 Flash.

![Rywoox](https://img.shields.io/badge/Rywoox-Fullstack%20Developer-blue)

## Features

- 💬 **AI Chat** - Ask questions about Charles Binard (Rywoox) and his projects
- 🎨 **Futuristic UI** - Dark theme with neon accents and smooth animations
- 📂 **GitHub Integration** - Automatically fetches public repositories
- ⚡ **Fast** - Built with React 19 + Vite + Bun
- 📱 **Responsive** - Works on all devices

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- Framer Motion
- Gemini 3.1 Flash API
- Vercel AI SDK

## Setup

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file with your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key at: https://aistudio.google.com/app/apikey

4. Run the development server:

```bash
bun dev
```

5. Build for production:

```bash
bun build
```

## Project Structure

```
src/
├── components/
│   ├── About.tsx       # About section
│   ├── Chat.tsx       # AI chat interface
│   ├── Hero.tsx       # Hero section
│   ├── Navigation.tsx # Navigation bar
│   ├── Projects.tsx   # GitHub repos display
│   └── Skills.tsx     # Tech stack display
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles + Tailwind
```

## Deploy

This project is optimized for deployment on Vercel:

```bash
bun vercel
```

Or set the `VITE_GEMINI_API_KEY` environment variable in your Vercel project settings.

## License

MIT
