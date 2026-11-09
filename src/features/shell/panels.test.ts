import { beforeEach, describe, expect, it } from 'vitest'
import {
  closeContent,
  closeDetails,
  openContent,
  openDetails,
  panels,
  toggleContent,
  toggleDetails,
} from './panels.store.ts'

describe('panels', () => {
  beforeEach(() => {
    closeDetails()
    closeContent()
  })

  it('should close the content when the details open, and the other way round', () => {
    openContent()
    openDetails()
    expect([panels.details(), panels.content()]).toEqual([true, false])

    openContent()
    expect([panels.details(), panels.content()]).toEqual([false, true])
  })

  it('should open then close a panel when toggled twice', () => {
    toggleDetails()
    expect(panels.details()).toBe(true)
    toggleDetails()
    expect(panels.details()).toBe(false)

    toggleContent()
    expect(panels.content()).toBe(true)
  })
})
