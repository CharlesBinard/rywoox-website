// TODO: integrate leaderboard

export interface ScoreEntry {
  score: number
  date: string
  name?: string
}

const MAX_SCORES = 100

/**
 * Save a score for a given game to localStorage.
 */
export function saveScore(gameId: string, score: number, playerName?: string): void {
  try {
    const raw = localStorage.getItem(`leaderboard_${gameId}`)
    const scores: ScoreEntry[] = raw ? JSON.parse(raw) : []
    scores.push({ score, date: new Date().toISOString(), name: playerName })
    // Keep only the last MAX_SCORES to avoid unbounded growth
    const trimmed = scores.slice(-MAX_SCORES)
    localStorage.setItem(`leaderboard_${gameId}`, JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable — silently fail
  }
}

/**
 * Get all scores for a given game, sorted descending by score.
 */
export function getScores(gameId: string): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(`leaderboard_${gameId}`)
    if (!raw) return []
    const scores: ScoreEntry[] = JSON.parse(raw)
    return scores.sort((a, b) => b.score - a.score)
  } catch {
    return []
  }
}

/**
 * Clear all scores for a given game.
 */
export function clearScores(gameId: string): void {
  try {
    localStorage.removeItem(`leaderboard_${gameId}`)
  } catch {
    // silently fail
  }
}
