# Fonts for the Design Check printable

Pinned so the PDF prints the same on any machine (system fonts such as Aptos or Georgia otherwise win, and change the line breaks). Static, not variable, fonts: Chrome embeds variable fonts as Type 3, which bloats the PDF and prints less crisply.

| File | Source | Licence |
|---|---|---|
| `Inter-{Regular,Italic,Bold,BoldItalic}.woff2` | Inter 4.1 release, `web/` folder: github.com/rsms/inter/releases/tag/v4.1 (zip SHA-256 `9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e`) | SIL OFL 1.1, `Inter-OFL.txt` |
| `Gelasio-Bold.woff2` | github.com/SorkinType/Gelasio, `fonts/webfonts/`, commit `7ab20e7` (version 1.008) | SIL OFL 1.1, `Gelasio-OFL.txt` |
| `DCSymbols-DejaVuSans-subset.woff2` | DejaVu Sans 2.37 (github.com/dejavu-fonts/dejavu-fonts, `dejavu-sans-ttf-2.37.zip`, SHA-256 `5c6e497a2f36552cb5ffb112c413a6af39c0f3c47653662b90b4fa6499822fd7`), subset with fontTools to space ✓ ✗ ● ◐ ○ and renamed "DC Symbols", as the Vera licence asks of modified versions. Inter has no ◐, so all five come from here and match | Bitstream Vera licence; DejaVu changes public domain. `DejaVu-LICENSE.txt` |
