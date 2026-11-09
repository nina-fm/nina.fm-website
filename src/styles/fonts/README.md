# Polices

Servies par le site lui-même (`public/fonts/`), en woff2 seulement : aucune requête ne sort
de son origine, et le service worker les garde hors ligne. Chaque thème importe les siennes.

| Fichier                       | Police                  | Origine                                        |
| ----------------------------- | ----------------------- | ---------------------------------------------- |
| `avenir-next.css`             | Avenir Next             | reprise de `public/fonts/` (Nuxt), thème Peak  |
| `caveat.css`                  | Caveat                  | Google Fonts, SIL OFL, thème Peak              |
| `airbnb-cereal.css`           | Airbnb Cereal           | reprise de `public/fonts/` (Nuxt), thème Vinyl |
| `dot-digital-7.css`           | Dot Digital-7           | reprise de `public/fonts/` (Nuxt), thème Vinyl |
| `bebas-neue.css`              | Bebas Neue              | Google Fonts, SIL OFL, thème Vinyl             |
| `waiting-for-the-sunrise.css` | Waiting for the Sunrise | Google Fonts, SIL OFL, thème Vinyl             |

Les Google Fonts ne gardent que les sous-ensembles `latin` et `latin-ext`, téléchargés depuis
l'API CSS2 le 2026-11-07 ; `font-display` reste celui de la prod.
