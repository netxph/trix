import { describe, expect, it } from 'bun:test'
import { bullDart, miss, numberDart } from './types'
import { endGame, newGame, newRun, nextGame, runStatistics, statistics, submitRound } from './rules'

const play = (game: ReturnType<typeof newGame>, darts: Parameters<typeof submitRound>[1]) => submitRound(game, darts).game

describe('dart scoring', () => {
  it('scores a submitted three-dart round', () => {
    const result = submitRound(newGame(501, 10), [numberDart(20, 3), numberDart(20, 1), miss()])
    expect(result.round.scored).toBe(80)
    expect(result.game.remaining).toBe(421)
  })
  it('busts on one and restores the round score', () => {
    const result = submitRound(newGame(40, 10), [numberDart(20, 1), numberDart(20, 1), miss()])
    expect(result.round.busted).toBe(true)
    expect(result.round.scored).toBe(0)
    expect(result.game.remaining).toBe(40)
  })
  it('requires a double checkout', () => {
    const single = submitRound(newGame(20, 10), [numberDart(20, 1), miss(), miss()])
    expect(single.round.busted).toBe(true)
    const double = submitRound(newGame(40, 10), [numberDart(20, 2), miss(), miss()])
    expect(double.game.status).toBe('checkout')
  })
  it('retains post-bust darts for statistics', () => {
    const game = play(newGame(50, 10), [numberDart(20, 2), numberDart(20, 2), numberDart(1, 1)])
    const stats = statistics(game)
    expect(stats.totalDarts).toBe(3)
    expect(stats.doubles).toBe(2)
    expect(stats.singles).toBe(1)
  })
  it('counts bull and checkout attempts', () => {
    const game = play(newGame(50, 10), [bullDart(true), miss(), miss()])
    const stats = statistics(game)
    expect(stats.bulls).toBe(1)
    expect(stats.checkoutAttempts).toBe(0)
    expect(stats.checkouts).toBe(1)
    const low = play(newGame(40, 10), [numberDart(20, 2), miss(), miss()])
    expect(statistics(low).checkoutAttempts).toBe(1)
  })

  it('starts the next game with the run configuration and preserves the finished game', () => {
    const run = newRun(301, 8)
    const finished = endGame(run.currentGame)
    const next = nextGame({ ...run, currentGame: finished })
    expect(next.currentGame.startingScore).toBe(301)
    expect(next.currentGame.roundLimit).toBe(8)
    expect(next.currentGame.status).toBe('active')
    expect(next.completedGames).toEqual([finished])
  })

  it('aggregates completed game statistics and results', () => {
    const run = newRun(40, 10)
    const win = play(run.currentGame, [numberDart(20, 2), miss(), miss()])
    const loss = endGame(newGame(40, 10))
    const stats = runStatistics({ ...run, currentGame: loss, completedGames: [win] })
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
    expect(stats.winningPercentage).toBe(50)
    expect(stats.totalDarts).toBe(3)
    expect(stats.perRound).toHaveLength(1)
  })
})
