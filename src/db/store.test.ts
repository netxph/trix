import { describe, expect, it } from 'bun:test'
import { clearGame, loadGame, saveGame } from './store'
import { newGame } from '../game/rules'

describe('current game storage', () => {
  it('replaces the current game and clears it for a new game', async () => {
    await saveGame(newGame(501, 10))
    await saveGame(newGame(301, 8))
    expect((await loadGame())?.startingScore).toBe(301)
    await clearGame()
    expect(await loadGame()).toBeUndefined()
  })
})
