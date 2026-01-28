# Page Design — Smart Theme + i18n (50 locales) + Activity + Localized Insights/News

## Global styles (desktop-first)
- Layout system: CSS Grid for page-level layout; Flexbox for inline alignment (top bar controls, list rows). Responsive: desktop first (≥1280px), then collapse right column below 1024px into stacked sections.
- Theme tokens: use CSS variables on `:root` and `[data-theme="dark"]`.
  - Background: `--bg`, `--surface`, `--surface-2`
  - Text: `--text`, `--text-muted`
  - Borders: `--border`
  - Accent: `--accent`, `--accent-contrast`
  - Chart palette: `--chart-up`, `--chart-down`, `--chart-grid`, `--chart-tooltip`
- Components: buttons (primary/secondary/ghost), focus ring visible, hover states adjust opacity not hue; ensure contrast AA.
- i18n: all strings via i18n keys; typography supports CJK; RTL support by switching `dir="rtl"` at `<html>` for RTL locales.

## Theme resolution rules (global behavior)
- Priority: Manual override > Time-based schedule > Device preference.
- Time-based schedule: compare current time in selected timezone; switch theme at boundaries; update on interval (e.g., every minute) and on app resume.
- Persistence: always store last-used theme+locale in local storage; if logged in, sync to server profile and hydrate on load.

## Page: Dashboard
### Meta information
- Title: “Hybrid Trade AI — Dashboard”
- Description: “Market chart, trade activity, and localized AI insights/news.”
- Open Graph: title, description, type=website.

### Page structure
- Top navigation (sticky): left brand + optional page tabs; right controls (Language, Theme).
- Main content grid (desktop):
  - Left (8/12): Market chart card
  - Right (4/12): Trades activity card
  - Full-width below: Localized AI insights/news feed card

### Sections & components
1. Top bar
   - Language switcher: current locale label + globe icon; opens popover with search input and scrollable list (50 locales). Selecting updates UI instantly.
   - Theme control: segmented control or dropdown (Device / Time / Manual). If Manual selected, show Light/Dark toggle. If Time selected, show “Configured in Settings” link.
2. Market chart card
   - Header: instrument selector (if existing), timeframe chips (1D/1W/1M/1Y), last updated.
   - Body: chart canvas with theme-aware colors; tooltip uses locale-aware number/date formatting.
   - States: skeleton loading; empty (“No data”); error with retry.
3. Trades activity card
   - Header: filters (symbol dropdown, side chips), refresh.
   - List: rows with timestamp, symbol, side (color-coded with theme-aware up/down colors), qty, price, status.
   - Interaction: clicking a row opens Trade Details modal/panel.
4. Trade details modal/panel
   - Shows full fields available (id, time, symbol, side, qty, price, fees, notes if present); close via X and overlay.
5. Localized AI insights/news feed
   - Header: “Insights & News” + locale badge + refresh.
   - Items: title, 2–3 line summary, source, published time, optional “open source” link.
   - Dedupe indicator: do not show repeated items; show “Updated just now” toast on refresh.

## Page: Settings
### Meta information
- Title: “Hybrid Trade AI — Settings”
- Description: “Customize theme automation and language preferences.”

### Page structure
- Two-column settings layout (desktop): left section nav (Theme, Language), right settings panels.

### Sections & components
1. Theme panel
   - Mode selector: Device / Time / Manual.
   - Manual: light/dark radio.
   - Time-based schedule: start time, end time, timezone selector, and live preview (shows which theme is active now).
   - Reset button.
2. Language panel
   - Locale selector: searchable dropdown list of 50 locales.
   - Formatting preview: sample date/number/currency rendered in selected locale.
   - RTL note for RTL locales (auto-enabled).
3. Save behavior
   - Inline save (auto-save) with “Saved” indicator; error message on failure with retry.