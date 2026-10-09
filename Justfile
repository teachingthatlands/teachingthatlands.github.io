# Teaching That Lands — Justfile
# Run `just` to list available commands.

set shell := ["zsh", "-cu"]

site := "site"

# List available commands (default)
default:
    @just --list

# Install dependencies
install:
    @cd {{site}} && npm install

# Dev server with hot reload
dev:
    @cd {{site}} && npm run dev

# Production build
build:
    @cd {{site}} && npm run build

# Build then preview the production output locally
preview: build
    @cd {{site}} && npm run preview

# Type-check without building
check:
    @cd {{site}} && npm run astro check

# Clean build output
clean:
    @rm -rf {{site}}/dist {{site}}/.astro

# Rebuild the one-day decks from the three session decks (--check: only verify)
one-day-decks *args:
    @uv run -q tools/one_day_decks.py {{args}}

# Fetch GoatCounter numbers into site/public/stats.json (needs GOATCOUNTER_TOKEN)
stats:
    @uv run -q tools/goatcounter_stats.py

# Print the Teaching Design Check PDF from its HTML source (needs Chrome or Chromium; set CHROME to its path)
design-check-pdf:
    @"${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}" --headless --no-pdf-header-footer --print-to-pdf=site/public/handouts/design-check.pdf "file://$PWD/tools/design-check/design-check.html"

# Print the Redesign Worksheet PDF from its HTML source (needs Chrome or Chromium; set CHROME to its path)
redesign-worksheet-pdf:
    @"${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}" --headless --no-pdf-header-footer --print-to-pdf=site/public/handouts/redesign-worksheet.pdf "file://$PWD/tools/redesign-worksheet/redesign-worksheet.html"
