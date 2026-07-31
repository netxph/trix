import type { Dart, Game, Round } from './types'
import { miss } from './types'

export const isDouble = (dart: Dart) => dart.kind === 'number' ? dart.multiplier === 2 : dart.kind === 'bull' && dart.score === 50

export function submitRound(game: Game, darts: Dart[]): { game: Game; round: Round } {
  const entries = [...darts, miss(), miss()].slice(0, 3)
  const before = game.remaining
  let running = before
  let busted = false
  let checkout = false
  for (const dart of entries) {
    if (busted || checkout || dart.kind === 'miss') continue
    const next = running - dart.score
    if (next < 0 || next === 1 || (next === 0 && !isDouble(dart))) { busted = true; continue }
    running = next
    if (running === 0) checkout = true
  }
  const scored = busted ? 0 : before - running
  const after = busted ? before : running
  const round: Round = { number: game.rounds.length + 1, darts: entries, scored, remainingBefore: before, remainingAfter: after, busted, checkout }
  const status = checkout ? 'checkout' : round.number >= game.roundLimit ? 'limit' : 'active'
  return { round, game: { ...game, remaining: after, rounds: [...game.rounds, round], status } }
}

export const newGame = (startingScore: number, roundLimit: number): Game => ({ id: 'current', startingScore, roundLimit, remaining: startingScore, rounds: [], status: 'active' })

export function statistics(game: Game) {
  const darts = game.rounds.flatMap((round) => round.darts)
  const scoredRounds = game.rounds.map((round) => round.scored)
  const attempts = darts.filter((dart) => {
    const round = game.rounds.find((candidate) => candidate.darts.includes(dart))
    if (!round || dart.kind === 'miss') return false
    const dartIndex = round.darts.indexOf(dart)
    return round.remainingBefore - round.darts.slice(0, dartIndex).reduce((sum, item) => sum + item.score, 0) <= 40
  })
  const successes = game.rounds.filter((round) => round.checkout).length
  return {
    totalDarts: darts.length,
    average: game.rounds.length ? scoredRounds.reduce((a, b) => a + b, 0) / game.rounds.length : 0,
    perRound: scoredRounds,
    bestRound: Math.max(0, ...scoredRounds),
    singles: darts.filter((dart) => dart.kind === 'number' && dart.multiplier === 1).length,
    doubles: darts.filter((dart) => dart.kind === 'number' && dart.multiplier === 2).length,
    triples: darts.filter((dart) => dart.kind === 'number' && dart.multiplier === 3).length,
    bulls: darts.filter((dart) => dart.kind === 'bull').length,
    misses: darts.filter((dart) => dart.kind === 'miss').length,
    highestDart: Math.max(0, ...darts.map((dart) => dart.score)),
    checkoutAttempts: attempts.length,
    checkouts: successes,
    checkoutPercentage: attempts.length ? (successes / attempts.length) * 100 : 0,
  }
}
