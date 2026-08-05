import { useEffect, useMemo, useState } from 'react'
import { clearRun, loadRun, saveRun } from './db/store'
import { dartLabel, bullDart, miss, numberDart, type Dart, type Multiplier, type Run } from './game/types'
import { endGame, newRun, nextGame, runStatistics, submitRound } from './game/rules'

const button = 'rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm active:scale-95 disabled:opacity-40'
const practiceMessages = ['Good morning, how about a round of darts today?', 'Ready to sharpen your game with a round today?', 'A little practice today can make a big difference.', 'How about taking a few minutes to practice today?']

export function Setup({ onStart, onUpdate }: { onStart: (score: number, rounds: number) => void; onUpdate?: (() => void) | null }) {
  const [score, setScore] = useState('501'); const [rounds, setRounds] = useState('10'); const [error, setError] = useState('')
  const [message] = useState(() => practiceMessages[Math.floor(Math.random() * practiceMessages.length)])
  const start = () => { const s = Number(score), r = Number(rounds); if (!Number.isInteger(s) || s < 2 || s > 9999 || !Number.isInteger(r) || r < 1 || r > 100) return setError('Enter a valid score (2–9999) and 1–100 rounds.'); onStart(s, r) }
  return <main className="mx-auto flex h-dvh max-w-md flex-col justify-start overflow-hidden px-5 py-6"><div className="shrink-0 pt-2"><p className="text-sm font-black uppercase tracking-widest text-slate-400">TRIX</p><p className="mt-1 text-sm text-slate-500">Track every dart. Learn your game.</p><div className="mt-8 flex items-center gap-3"><div className="flex-1 rounded-2xl bg-sky-50 p-4"><h1 className="text-3xl font-black tracking-tight">{message}</h1></div><img className="h-24 w-24 shrink-0" src="/owl.svg" alt="Friendly owl saying the practice message" /></div></div><section className="mt-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl"><label className="block text-sm font-semibold text-slate-300">Starting score<input aria-label="Starting score" className="mt-2 w-full rounded-xl border-0 bg-white px-4 py-3 text-2xl font-bold text-slate-900" type="number" value={score} onChange={e => setScore(e.target.value)} /></label><label className="mt-5 block text-sm font-semibold text-slate-300">Round limit<input aria-label="Round limit" className="mt-2 w-full rounded-xl border-0 bg-white px-4 py-3 text-2xl font-bold text-slate-900" type="number" value={rounds} onChange={e => setRounds(e.target.value)} /></label><div className="mt-5"><p className="mb-2 text-sm font-semibold text-slate-300">Quick start</p><div className="grid grid-cols-3 gap-2">{[[501, 10], [201, 5], [121, 3]].map(([score, rounds]) => <button key={`${score}-${rounds}`} className="rounded-xl border border-slate-600 px-2 py-3 text-sm font-bold text-white" onClick={() => onStart(score, rounds)}>{score} - {rounds}</button>)}</div></div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}<button className="mt-6 w-full rounded-xl bg-sky-400 px-4 py-4 font-black text-slate-950" onClick={start}>Start run</button>{onUpdate && <button className="mt-2 w-full rounded-xl border-2 border-sky-200 bg-sky-50 px-4 py-3 font-black text-sky-700" onClick={onUpdate}>App update</button>}</section><a className="fixed bottom-4 right-4 rounded-full bg-white p-2 shadow-md" href="https://github.com/netxph/trix" target="_blank" rel="noreferrer" aria-label="trix on GitHub" title="trix on GitHub"><svg className="h-6 w-6" aria-hidden="true"><use href="/icons.svg#github-icon" /></svg></a></main>
}

const boardNumbers = Array.from({ length: 20 }, (_, index) => 20 - index)

function DartPicker({ onPick }: { onPick: (dart: Dart) => void }) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1)
  const multiplierName = multiplier === 1 ? 'Single' : multiplier === 2 ? 'Double' : 'Triple'
  return <div>
    <div className="rounded-2xl bg-white p-2 shadow-sm">
      <div className="grid grid-cols-3 gap-2">{([1, 2, 3] as Multiplier[]).map(m => <button key={m} aria-pressed={multiplier === m} className={`min-h-11 rounded-xl border-2 px-2 font-bold ${m === 1 ? 'border-sky-200 bg-sky-50 text-sky-700' : m === 2 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'} ${multiplier === m ? 'ring-2 ring-slate-900 ring-offset-1' : 'opacity-60'}`} onClick={() => setMultiplier(m)}><span className="block text-lg">{m === 1 ? 'S' : m === 2 ? 'D' : 'T'}</span><span className="text-xs">{m === 1 ? 'Single' : m === 2 ? 'Double' : 'Triple'}</span></button>)}</div>
    </div>
    <div className="mt-2 rounded-2xl bg-white p-2 shadow-sm">
      <div className="grid grid-cols-5 gap-1.5">{boardNumbers.map(value => <button key={value} aria-label={`${multiplierName} ${value}`} className={`min-h-16 rounded-xl border-2 bg-white px-1 font-sans text-3xl font-bold tracking-tight text-slate-800 shadow-sm active:scale-95 ${multiplier === 1 ? 'border-sky-300' : multiplier === 2 ? 'border-emerald-300' : 'border-rose-300'}`} onClick={() => onPick(numberDart(value, multiplier))}>{value}</button>)}</div>
    </div>
    <div className="mt-2 grid grid-cols-3 gap-2"><button className={`${button} min-h-16 border-2 border-amber-300 bg-amber-50 text-lg font-bold tracking-tight text-amber-900`} onClick={() => onPick(bullDart(false))}>Bull<br /><small>25</small></button><button className={`${button} min-h-16 border-2 border-amber-300 bg-amber-100 text-lg font-bold tracking-tight text-amber-950`} onClick={() => onPick(bullDart(true))}>Bullseye<br /><small>50</small></button><button className={`${button} min-h-16 border-2 border-slate-300 bg-slate-100 text-lg font-bold tracking-tight text-slate-800`} onClick={() => onPick(miss())}>Miss</button></div>
  </div>
}

function Play({ run, onChange, onEnd }: { run: Run; onChange: (run: Run) => void; onEnd: () => void }) {
  const game = run.currentGame
  const [draft, setDraft] = useState<Dart[]>([miss(), miss(), miss()]); const [selected, setSelected] = useState(0); const [confirmEnd, setConfirmEnd] = useState(false)
  const pick = (dart: Dart) => { setDraft(current => current.map((item, index) => index === selected ? dart : item)); setSelected((selected + 1) % 3) }
  const liveScore = submitRound(game, draft).game.remaining
  const submit = () => { const result = submitRound(game, draft); onChange({ ...run, currentGame: result.game }); setDraft([miss(), miss(), miss()]); setSelected(0) }
  return <main className="mx-auto flex h-dvh max-w-md flex-col overflow-y-auto px-4 pb-3 pt-4">
    <header className="flex shrink-0 items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-sky-600">Round {game.rounds.length + 1} / {game.roundLimit}</p><h1 className="mt-1 text-5xl font-black">{game.remaining}</h1><p className="text-slate-500">remaining</p></div><div className="text-right"><div className="rounded-2xl bg-white px-3 py-2 text-sm shadow-sm"><span className="block text-slate-400">Starting</span><b>{game.startingScore}</b></div><button className="mt-2 min-h-11 w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white shadow-md active:scale-95" onClick={() => setConfirmEnd(true)}>End game</button></div></header>
    <section className="mt-3 flex min-h-20 flex-1 flex-col overflow-hidden rounded-2xl bg-slate-200/60 p-2">
      <h2 className="mb-1 px-1 text-sm font-bold">Submitted rounds</h2>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {game.rounds.length === 0 && <p className="px-1 py-2 text-sm text-slate-500">No rounds submitted yet.</p>}
        {[...game.rounds].reverse().map(round => <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2 shadow-sm" key={round.number}><div><b className="text-sm">Round {round.number}</b><p className="text-xs text-slate-500">{round.darts.map(dartLabel).join(' · ')}</p></div><span className={round.busted ? 'text-sm font-bold text-rose-500' : 'text-sm font-bold text-sky-700'}>{round.busted ? 'Bust · 0' : `−${round.scored}`}</span></div>)}
      </div>
    </section>
    <section className="mt-3 shrink-0"><div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Your three darts</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">Live score {liveScore}</span></div><div className="grid grid-cols-3 gap-2">{draft.map((dart, index) => <button key={index} className={`rounded-2xl border-2 p-3 text-left ${selected === index ? 'border-sky-500 bg-sky-50' : 'border-transparent bg-white'}`} onClick={() => setSelected(index)}><span className="block text-xs text-slate-400">Dart {index + 1}</span><b>{dartLabel(dart)}</b><span className="block text-sm text-slate-500">{dart.score} pts</span></button>)}</div></section>
    <section className="mt-3 shrink-0"><DartPicker onPick={pick} /></section>
    <button className="mt-3 w-full shrink-0 rounded-xl bg-slate-900 px-4 py-4 font-black text-white" onClick={submit}>Submit round</button>
    {confirmEnd && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/50 px-5" role="presentation"><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="end-game-title"><h2 id="end-game-title" className="text-xl font-black">End this game?</h2><p className="mt-2 text-slate-600">This game will count as a loss.</p><div className="mt-5 grid grid-cols-2 gap-2"><button className="rounded-xl border border-slate-200 px-4 py-3 font-bold" onClick={() => setConfirmEnd(false)}>Cancel</button><button aria-label="Confirm end game" className="rounded-xl bg-rose-600 px-4 py-3 font-black text-white" onClick={() => { setConfirmEnd(false); onEnd() }}>End game</button></div></div></div>}
  </main>
}

function Result({ run, onNext, onNew }: { run: Run; onNext: () => void; onNew: () => void }) {
  const game = run.currentGame; const stats = useMemo(() => runStatistics(run), [run]); const won = game.status === 'checkout'
  return <main className="mx-auto flex h-dvh max-w-md flex-col overflow-y-auto px-4 py-4">
    <div className={`shrink-0 rounded-3xl p-5 text-white ${won ? 'bg-emerald-600' : 'bg-slate-900'}`}><p className="text-sm font-bold uppercase tracking-widest text-white/70">Game complete</p><h1 className="mt-1 text-4xl font-black">{won ? 'Congratulations!' : 'Sorry, not this time.'}</h1><p className="mt-1 text-white/80">{won ? 'You checked out!' : game.status === 'ended' ? 'You ended the game.' : `You finished with ${game.remaining} remaining.`}</p></div>
    <section className="mt-4 shrink-0"><h2 className="mb-2 text-xl font-black">Your statistics</h2><div className="grid grid-cols-2 gap-2">{[['Round average', stats.average.toFixed(1)], ['Best round', stats.bestRound], ['Darts thrown', stats.totalDarts], ['Highest dart', stats.highestDart], ['Checkout', `${stats.checkoutPercentage.toFixed(0)}%`], ['Attempts', stats.checkoutAttempts], ['Wins', `${stats.wins}/${stats.wins + stats.losses}`], ['Winning percentage', `${stats.winningPercentage.toFixed(0)}%`]].map(([label, value]) => <div className="rounded-xl bg-white p-3 shadow-sm" key={label as string}><p className="text-sm text-slate-500">{label}</p><b className="text-xl">{value}</b></div>)}</div><div className="mt-2 rounded-xl bg-white p-3 shadow-sm"><p className="mb-1 font-bold">Shot breakdown</p><p className="text-sm text-slate-600">Singles {stats.singles} · Doubles {stats.doubles} · Triples {stats.triples}</p><p className="text-sm text-slate-600">Bulls {stats.bulls} · Misses {stats.misses}</p></div></section>
    <section className="mt-3 flex min-h-24 flex-1 flex-col overflow-hidden rounded-2xl bg-slate-200/60 p-2"><h2 className="mb-1 px-1 text-lg font-black">Round scores</h2><div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1">{game.rounds.map(round => <div className="flex justify-between rounded-lg bg-white px-3 py-2 shadow-sm" key={round.number}><span>Round {round.number}</span><b>{round.busted ? 'Bust · 0' : round.scored}</b></div>)}</div></section>
    <div className="mt-3 grid grid-cols-2 gap-2"><button className="rounded-xl bg-sky-500 px-4 py-4 font-black text-slate-950" onClick={onNext}>Next game</button><button className="rounded-xl bg-slate-900 px-4 py-4 font-black text-white" onClick={onNew}>New run</button></div>
  </main>
}

function useAppUpdate() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let disposed = false
    const watch = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) { setRegistration(reg); setAvailable(true); return }
      const worker = reg.installing
      if (!worker) return
      worker.addEventListener('statechange', () => {
        if (!disposed && worker.state === 'installed' && navigator.serviceWorker.controller) { setRegistration(reg); setAvailable(true) }
      })
    }
    let current: ServiceWorkerRegistration | undefined
    const onUpdateFound = () => { if (current) watch(current) }
    navigator.serviceWorker.ready.then(reg => {
      if (disposed) return
      current = reg; watch(reg); reg.addEventListener('updatefound', onUpdateFound); void reg.update()
    })
    return () => { disposed = true; current?.removeEventListener('updatefound', onUpdateFound) }
  }, [])
  if (!available || !registration?.waiting) return null
  const waiting = registration.waiting
  return () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export default function App() {
  const appUpdate = useAppUpdate()
  const [run, setRun] = useState<Run | null>(null)
  useEffect(() => {
    let mounted = true
    const fallback = window.setTimeout(() => { if (mounted) setRun(null) }, 1600)
    loadRun().then((saved) => { if (mounted) setRun(saved ?? null); window.clearTimeout(fallback) })
    return () => { mounted = false; window.clearTimeout(fallback) }
  }, [])
  useEffect(() => { if (run) void saveRun(run).catch(() => undefined) }, [run])
  const resetRun = async () => { await clearRun(); setRun(null) }
  if (!run) return <Setup onStart={(score, rounds) => setRun(newRun(score, rounds))} onUpdate={appUpdate} />
  if (run.currentGame.status !== 'active') return <Result run={run} onNext={() => setRun(nextGame(run))} onNew={resetRun} />
  return <Play run={run} onChange={setRun} onEnd={() => setRun({ ...run, currentGame: endGame(run.currentGame) })} />
}
