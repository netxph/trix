import { openDB } from 'idb'
import type { Run } from '../game/types'

const dbPromise = openDB('dart-tracker', 2, { upgrade(db) {
  if (db.objectStoreNames.contains('game')) db.deleteObjectStore('game')
  if (!db.objectStoreNames.contains('run')) db.createObjectStore('run')
} })

export const loadRun = async (): Promise<Run | undefined> => {
  try {
    const db = await Promise.race([
      dbPromise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('IndexedDB unavailable')), 1500)),
    ])
    return await db.get('run', 'current') as Run | undefined
  } catch {
    return undefined
  }
}

export const saveRun = (run: Run) => dbPromise.then((db) => db.put('run', run, 'current'))
export const clearRun = () => dbPromise.then((db) => db.delete('run', 'current'))
