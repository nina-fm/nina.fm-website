import { describe, expect, it } from 'vitest'
import { headerProblem, pageProblem, robotsProblem } from './indexing.ts'

const page = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`
const STATCOUNTER = '<script src="https://www.statcounter.com/counter/counter.js"></script>'

describe('pageProblem', () => {
  describe('noindex', () => {
    it('should pass when the page carries noindex and nofollow', () => {
      expect(pageProblem(page('<meta name="robots" content="noindex, nofollow">'), 'noindex')).toBeNull()
    })

    it('should fail when the page has no robots meta', () => {
      expect(pageProblem(page('<title>Nina.fm</title>'), 'noindex')).toBe('aucune meta robots')
    })

    it('should fail when the robots meta still lets links be followed', () => {
      expect(pageProblem(page('<meta name="robots" content="noindex">'), 'noindex')).toContain('noindex')
    })

    it('should fail when statcounter is loaded', () => {
      const html = page(`<meta name="robots" content="noindex, nofollow">${STATCOUNTER}`)
      expect(pageProblem(html, 'noindex')).toBe('statcounter chargé hors production')
    })
  })

  describe('indexable', () => {
    it('should pass when the page has no robots meta and counts its visits', () => {
      expect(pageProblem(page(STATCOUNTER), 'indexable')).toBeNull()
    })

    it('should fail when a robots meta closes the page, even partly', () => {
      expect(pageProblem(page(`<meta name="robots" content="noindex">${STATCOUNTER}`), 'indexable')).toContain(
        'noindex',
      )
      expect(pageProblem(page(`<meta name="robots" content="nofollow">${STATCOUNTER}`), 'indexable')).toContain(
        'nofollow',
      )
    })

    it('should fail when statcounter is missing', () => {
      expect(pageProblem(page('<title>Nina.fm</title>'), 'indexable')).toBe('statcounter absent en production')
    })
  })
})

describe('robotsProblem', () => {
  it('should pass when robots.txt closes the whole site of a staging', () => {
    expect(robotsProblem('User-agent: *\nDisallow: /\n', 'noindex')).toBeNull()
  })

  it('should fail when the robots.txt of a staging allows crawling', () => {
    expect(robotsProblem('User-agent: *\nAllow: /\n', 'noindex')).not.toBeNull()
    expect(robotsProblem('User-agent: *\nDisallow: /\nAllow: /\n', 'noindex')).not.toBeNull()
  })

  it('should pass when the robots.txt of the production allows crawling', () => {
    expect(robotsProblem('User-agent: *\nAllow: /\n', 'indexable')).toBeNull()
  })

  it('should fail when the robots.txt of the production closes the site', () => {
    expect(robotsProblem('User-agent: *\nDisallow: /\n', 'indexable')).toBe('robots.txt contient « Disallow: / »')
  })
})

describe('headerProblem', () => {
  it('should pass when the header of a staging carries noindex and nofollow', () => {
    expect(headerProblem('noindex, nofollow', 'noindex')).toBeNull()
  })

  it('should fail when the header of a staging is missing or partial', () => {
    expect(headerProblem(null, 'noindex')).toBe('aucun en-tête X-Robots-Tag')
    expect(headerProblem('nofollow', 'noindex')).not.toBeNull()
  })

  it('should pass when the production sends no closing header', () => {
    expect(headerProblem(null, 'indexable')).toBeNull()
    expect(headerProblem('noarchive', 'indexable')).toBeNull()
  })

  it('should fail when the production sends a closing header, even partly', () => {
    expect(headerProblem('noindex, nofollow', 'indexable')).not.toBeNull()
    expect(headerProblem('nofollow', 'indexable')).not.toBeNull()
  })
})
