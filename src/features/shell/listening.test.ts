import { describe, expect, it } from 'vitest'
import type { PlaybackStatus } from '~/features/playback/player.ts'
import { listeningFlags, overlayView, showsRelaunch } from './listening.ts'

const SILENT: PlaybackStatus[] = ['stopped', 'paused', 'error', 'offline', 'interrupted']

describe('listeningFlags', () => {
  it('should count a reconnection as loading, like the prod', () => {
    expect(listeningFlags('reconnecting', 'allowed')).toEqual({ loading: true, locked: false, playing: false })
  })

  it('should stay locked until the listener starts the stream when autoplay is refused', () => {
    expect(listeningFlags('stopped', 'blocked').locked).toBe(true)
    expect(listeningFlags('stopped', 'unknown').locked).toBe(false)
  })
})

describe('overlayView', () => {
  it('should leave the stage alone when it plays', () => {
    expect(overlayView(listeningFlags('playing', 'allowed'))).toBe('hidden')
  })

  it('should offer to play when autoplay is refused', () => {
    expect(overlayView(listeningFlags('stopped', 'blocked'))).toBe('play')
  })

  it('should show the loader when the stream loads or reconnects', () => {
    expect(overlayView(listeningFlags('loading', 'allowed'))).toBe('loader')
    expect(overlayView(listeningFlags('reconnecting', 'allowed'))).toBe('loader')
  })

  it('should only veil the stage when nothing plays and autoplay is not refused', () => {
    for (const status of SILENT) expect(overlayView(listeningFlags(status, 'allowed')), status).toBe('veil')
  })
})

describe('showsRelaunch', () => {
  it('should offer a relaunch only when the listening stopped without the listener', () => {
    expect(SILENT.filter(showsRelaunch)).toEqual(['paused', 'error', 'interrupted'])
  })
})
