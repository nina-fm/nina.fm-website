import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_DURATION_MS, dismissToast, showToast, toaster } from './toast.store.ts'

const ids = () => toaster.toasts().map((toast) => `${toast.id}:${toast.message}`)

describe('toaster', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    for (const toast of toaster.toasts()) dismissToast(toast.id)
    vi.useRealTimers()
  })

  it('should replace the toast when shown again with the same id', () => {
    showToast({ id: 'a', kind: 'loading', message: 'un' }, null)
    showToast({ id: 'b', kind: 'success', message: 'autre' })
    showToast({ id: 'a', kind: 'error', message: 'deux' }, null)

    expect(ids()).toEqual(['b:autre', 'a:deux'])
  })

  it('should take the toast away after its duration, the default one when none is given', () => {
    showToast({ id: 'a', kind: 'success', message: 'un' })
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1)
    expect(toaster.has('a')).toBe(true)

    vi.advanceTimersByTime(1)
    expect(toaster.has('a')).toBe(false)
  })

  it('should keep a toast without duration until it is dismissed', () => {
    showToast({ id: 'a', kind: 'loading', message: 'un' }, null)
    vi.advanceTimersByTime(60_000)
    expect(toaster.has('a')).toBe(true)

    dismissToast('a')
    expect(toaster.has('a')).toBe(false)
  })

  it('should not let the timer of a replaced toast take away its successor', () => {
    showToast({ id: 'a', kind: 'success', message: 'un' }, 1_000)
    showToast({ id: 'a', kind: 'loading', message: 'deux' }, null)
    vi.advanceTimersByTime(1_000)

    expect(ids()).toEqual(['a:deux'])
  })
})
