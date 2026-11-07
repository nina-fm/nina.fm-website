import { describe, expect, it } from 'vitest'
import { headerProblem, pageProblem, robotsProblem } from './noindex.ts'

const page = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`

describe('pageProblem', () => {
  it('should pass when the page carries noindex and nofollow', () => {
    expect(pageProblem(page('<meta name="robots" content="noindex, nofollow">'))).toBeNull()
  })

  it('should fail when the page has no robots meta', () => {
    expect(pageProblem(page('<title>Nina.fm</title>'))).toBe('aucune meta robots')
  })

  it('should fail when the robots meta still lets links be followed', () => {
    expect(pageProblem(page('<meta name="robots" content="noindex">'))).toContain('noindex')
  })

  it('should fail when statcounter is loaded', () => {
    const html = page(
      '<meta name="robots" content="noindex, nofollow"><script src="https://www.statcounter.com/counter/counter.js"></script>',
    )
    expect(pageProblem(html)).toBe('statcounter chargé hors production')
  })
})

describe('robotsProblem', () => {
  it('should pass when robots.txt closes the whole site', () => {
    expect(robotsProblem('User-agent: *\nDisallow: /\n')).toBeNull()
  })

  it('should fail when robots.txt allows crawling', () => {
    expect(robotsProblem('User-agent: *\nAllow: /\n')).not.toBeNull()
    expect(robotsProblem('User-agent: *\nDisallow: /\nAllow: /\n')).not.toBeNull()
  })
})

describe('headerProblem', () => {
  it('should pass when the header carries noindex and nofollow', () => {
    expect(headerProblem('noindex, nofollow')).toBeNull()
  })

  it('should fail when the header is missing or partial', () => {
    expect(headerProblem(null)).toBe('aucun en-tête X-Robots-Tag')
    expect(headerProblem('nofollow')).not.toBeNull()
  })
})
