import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, mock } from 'bun:test'
import App, { Setup } from './App'
import { clearGame, loadGame, saveGame } from './db/store'
import { newGame } from './game/rules'

describe('primary flow', () => {
  it('validates setup and starts a configured game', async () => {
    const user = userEvent.setup(); const onStart = mock()
    render(<Setup onStart={onStart} />)
    await user.clear(screen.getByLabelText('Starting score'))
    await user.type(screen.getByLabelText('Starting score'), '301')
    await user.click(screen.getByRole('button', { name: 'Start game' }))
    expect(onStart).toHaveBeenCalledWith(301, 10)
  })

  it('clears an active game before returning to setup', async () => {
    await clearGame(); await saveGame(newGame(301, 8))
    window.confirm = mock(() => true)
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText('Live score 301')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Single 20' }))
    expect(screen.getByText('Live score 281')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'New game' }))
    await waitFor(() => screen.getByLabelText('Starting score'))
    expect(await loadGame()).toBeUndefined()
  })
})
