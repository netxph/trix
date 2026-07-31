import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
await import('fake-indexeddb/auto')

const { expect } = await import('bun:test')
const matchers = await import('@testing-library/jest-dom/matchers')
expect.extend(matchers as Omit<typeof matchers, 'default'>)
