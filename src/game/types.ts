export type Multiplier = 1 | 2 | 3
export type DartKind = 'number' | 'bull' | 'miss'
export type GameStatus = 'active' | 'checkout' | 'limit'

export type Dart = { kind: DartKind; value: number; multiplier: Multiplier; score: number }
export type Round = { number: number; darts: Dart[]; scored: number; remainingBefore: number; remainingAfter: number; busted: boolean; checkout: boolean }
export type Game = { id: 'current'; startingScore: number; roundLimit: number; remaining: number; rounds: Round[]; status: GameStatus }

export const miss = (): Dart => ({ kind: 'miss', value: 0, multiplier: 1, score: 0 })
export const numberDart = (value: number, multiplier: Multiplier): Dart => ({ kind: 'number', value, multiplier, score: value * multiplier })
export const bullDart = (double: boolean): Dart => ({ kind: 'bull', value: 25, multiplier: double ? 2 : 1, score: double ? 50 : 25 })
export const dartLabel = (dart: Dart) => dart.kind === 'miss' ? 'Miss' : dart.kind === 'bull' ? (dart.score === 50 ? 'Bull 50' : 'Bull 25') : `${dart.multiplier === 1 ? 'S' : dart.multiplier === 2 ? 'D' : 'T'}${dart.value}`
