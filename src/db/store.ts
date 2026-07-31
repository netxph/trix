import { openDB } from 'idb'
import type { Game } from '../game/types'

const dbPromise = openDB('dart-tracker', 1, { upgrade(db) { db.createObjectStore('game') } })
export const loadGame = async (): Promise<Game | undefined> => {
  try {
    const db = await Promise.race([
      dbPromise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('IndexedDB unavailable')), 1500)),
    ])
    return await db.get('game', 'current') as Game | undefined
  } catch {
    return undefined
  }
}

export const saveGame = (game: Game) => dbPromise.then((db) => db.put('game', game, 'current'))
export const clearGame = () => dbPromise.then((db) => db.delete('game', 'current'))
