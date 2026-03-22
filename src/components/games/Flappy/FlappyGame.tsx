'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const W = 400
const H = 600
const BIRD_X = 60
const BIRD_R = 14
const PIPE_W = 60
const PIPE_GAP = 160
const PIPE_SPEED = 2.5
const GRAVITY = 0.35
const JUMP = -8.5
const PIPE_SPAWN = 100

type Pipe = { x: number; top: number; bottom: number; scored: boolean }

export const FlappyGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'dead'>('idle')
  const [countdown, setCountdown] = useState(3)

  const birdYRef = useRef(H / 3)
  const velRef = useRef(0)
  const pipesRef = useRef<Pipe[]>([])
  const frameRef = useRef(0)
  const loopRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = useCallback(() => {
    if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null }
    birdYRef.current = H / 3
    velRef.current = 0
    pipesRef.current = []
    frameRef.current = 0
    setScore(0)
    setCountdown(3)
  }, [])

  const start = useCallback(() => {
    reset()
    setCountdown(3)
    setGameState('countdown')

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownTimerRef.current!)
          countdownTimerRef.current = null
          setGameState('playing')
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [reset])

  const jump = useCallback(() => {
    if (gameState === 'idle' || gameState === 'dead') { start(); return }
    if (gameState === 'countdown') {
      if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null }
      setGameState('playing')
      return
    }
    velRef.current = JUMP
  }, [gameState, start])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [jump])

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'countdown') {
      if (loopRef.current) cancelAnimationFrame(loopRef.current)
      return
    }

    const update = () => {
      frameRef.current++

      // Skip physics during countdown
      if (gameState === 'countdown') return

      // Bird physics
      velRef.current += GRAVITY
      birdYRef.current += velRef.current

      // Ceiling/floor
      if (birdYRef.current < BIRD_R) { birdYRef.current = BIRD_R; velRef.current = 0 }
      if (birdYRef.current > H - BIRD_R) {
        setGameState('dead')
        setHighScore(s => Math.max(s, score))
        return
      }

      // Spawn pipes
      if (frameRef.current % PIPE_SPAWN === 0) {
        const top = 80 + Math.random() * (H - PIPE_GAP - 200)
        pipesRef.current.push({ x: W, top, bottom: top + PIPE_GAP, scored: false })
      }

      // Move pipes
      pipesRef.current = pipesRef.current.filter(p => p.x > -PIPE_W)

      // Collision + score
      for (const pipe of pipesRef.current) {
        pipe.x -= PIPE_SPEED

        const birdLeft = BIRD_X - BIRD_R
        const birdRight = BIRD_X + BIRD_R
        const birdTop = birdYRef.current - BIRD_R
        const birdBottom = birdYRef.current + BIRD_R

        if (
          birdRight > pipe.x && birdLeft < pipe.x + PIPE_W &&
          (birdTop < pipe.top || birdBottom > pipe.bottom)
        ) {
          setGameState('dead')
          setHighScore(s => Math.max(s, score))
          return
        }

        if (!pipe.scored && birdLeft > pipe.x + PIPE_W) {
          pipe.scored = true
          setScore(s => s + 1)
        }
      }
    }

    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0a0f')
      grad.addColorStop(0.5, '#13132a')
      grad.addColorStop(1, '#1a1a3a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Pipes
      for (const pipe of pipesRef.current) {
        ctx.shadowBlur = 10
        ctx.shadowColor = '#ff375f'
        ctx.fillStyle = '#ff375f'
        ctx.fillRect(pipe.x, 0, PIPE_W, pipe.top)
        ctx.fillRect(pipe.x, pipe.bottom, PIPE_W, H - pipe.bottom)

        // Pipe caps
        ctx.shadowBlur = 0
        ctx.fillStyle = '#ff6b8a'
        ctx.fillRect(pipe.x - 4, pipe.top - 16, PIPE_W + 8, 16)
        ctx.fillRect(pipe.x - 4, pipe.bottom, PIPE_W + 8, 16)
      }

      // Bird
      const by = birdYRef.current
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffd60a'
      ctx.fillStyle = '#ffd60a'
      ctx.beginPath()
      ctx.arc(BIRD_X, by, BIRD_R, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.shadowBlur = 0
      ctx.fillStyle = '#0a0a0f'
      ctx.beginPath()
      ctx.arc(BIRD_X + 5, by - 4, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(BIRD_X + 6, by - 5, 2, 0, Math.PI * 2)
      ctx.fill()

      // Wing
      ctx.fillStyle = '#ff9f0a'
      ctx.beginPath()
      ctx.ellipse(BIRD_X - 4, by + 4, 8, 5, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
    }

    const loop = () => {
      update()
      render()
      if (gameState === 'playing') loopRef.current = requestAnimationFrame(loop)
    }
    loopRef.current = requestAnimationFrame(loop)
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current) }
  }, [gameState, score])

  // Idle/dead render
  useEffect(() => {
    if (gameState === 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#0a0a0f')
    grad.addColorStop(0.5, '#13132a')
    grad.addColorStop(1, '#1a1a3a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    if (gameState === 'idle') {
      ctx.fillStyle = '#ffd60a'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffd60a'
      ctx.beginPath()
      ctx.arc(BIRD_X, H / 3, BIRD_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }, [gameState])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-lg font-mono">
        <div className="text-yellow-400">SCORE <span className="text-white font-bold">{score}</span></div>
        <div className="text-gray-500">BEST <span className="text-white font-bold">{highScore}</span></div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-xl border border-dark-border max-w-full"
        />

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/80 rounded-xl">
            <div className="text-5xl mb-4">🕊️</div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">FLAPPY</div>
            <div className="text-gray-400 text-sm mb-6">SPACE / ↑ / W pour sauter</div>
            <button
              onClick={start}
              className="px-8 py-3 rounded-lg bg-yellow-400/20 border border-yellow-400 text-yellow-400 font-bold hover:bg-yellow-400/30 transition-all cursor-pointer"
            >
              JOUER
            </button>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/60 rounded-xl">
            <div className="text-8xl font-bold text-yellow-400 animate-pulse">{countdown}</div>
            <div className="text-gray-400 text-sm mt-4">Prépare-toi !</div>
          </div>
        )}

        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/80 rounded-xl">
            <div className="text-5xl mb-4">💀</div>
            <div className="text-2xl font-bold text-neon-pink mb-2">GAME OVER</div>
            <div className="text-gray-400 mb-2">Score: <span className="text-white font-bold">{score}</span></div>
            {score >= highScore && score > 0 && <div className="text-yellow-400 mb-4 text-sm">🎉 BEST !</div>}
            <button
              onClick={start}
              className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all cursor-pointer"
            >
              REJOUER
            </button>
          </div>
        )}
      </div>

      <div className="text-gray-600 text-sm font-mono">SPACE / ↑ / W · clique ou appuie</div>
    </div>
  )
}
