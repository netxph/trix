import { describe, expect, it } from 'bun:test'
import { clearRun, loadRun, saveRun } from './store'
import { newRun } from '../game/rules'

describe('run storage', () => {
  it('replaces the current run and clears it for a new run', async () => {
    await saveRun(newRun(501, 10))
    await saveRun(newRun(301, 8))
    expect((await loadRun())?.startingScore).toBe(301)
    expect((await loadRun())?.roundLimit).toBe(8)
    await clearRun()
    expect(await loadRun()).toBeUndefined()
  })
})
