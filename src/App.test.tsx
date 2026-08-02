import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, mock } from 'bun:test'
import App, { Setup } from './App'
import { clearRun, loadRun, saveRun } from './db/store'
import { endGame, newRun, nextGame } from './game/rules'

describe('primary flow', () => {
  it('validates setup and starts a configured run', async () => {
    const user = userEvent.setup(); const onStart = mock()
    render(<Setup onStart={onStart} />)
    await user.clear(screen.getByLabelText('Starting score'))
    await user.type(screen.getByLabelText('Starting score'), '301')
    await user.click(screen.getByRole('button', { name: 'Start run' }))
    expect(onStart).toHaveBeenCalledWith(301, 10)
  })

  it('ends an active game as a loss and starts the next configured game', async () => {
    await clearRun(); await saveRun({ ...newRun(301, 8), currentGame: endGame(newRun(301, 8).currentGame) })
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText('Wins')).toBeTruthy()
    expect(screen.getByText('0/1', { selector: 'b' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Next game' }))
    expect(await screen.findByText('Live score 301')).toBeTruthy()
    expect((await loadRun())?.completedGames).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'End game' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Confirm end game' }))
    await user.click(screen.getByRole('button', { name: 'New run' }))
    await waitFor(() => screen.getByLabelText('Starting score'))
    expect(await loadRun()).toBeUndefined()
  })

  it('advances the selected dart after each pick and wraps around', async () => {
    await clearRun(); await saveRun(newRun(301, 8))
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Live score 301')
    const score = screen.getByRole('button', { name: 'Single 20' })
    await user.click(score)
    expect(screen.getByRole('button', { name: /Dart 2 Miss/ }).className).toContain('border-sky-500')
    await user.click(score)
    await user.click(score)
    expect(screen.getByRole('button', { name: /Dart 1 S20/ }).className).toContain('border-sky-500')
  })

  it('preserves the run configuration when advancing games', () => {
    const run = newRun(501, 10)
    const next = nextGame({ ...run, currentGame: endGame(run.currentGame) })
    expect(next.currentGame.startingScore).toBe(501)
    expect(next.currentGame.roundLimit).toBe(10)
  })
})
