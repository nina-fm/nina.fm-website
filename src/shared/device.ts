/** L'appareil tourne sous iOS, iPad compris, qui se présente comme un Mac à écran tactile. */
export function isIos(userAgent: string, touchPoints: number): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1)
}
