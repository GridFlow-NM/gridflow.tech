# gridflow.tech
GridFlow Inc. Official Company Website

Static site built with [Astro](https://astro.build), deployed to GitHub Pages.

## Work on the site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

- Pages live in `src/pages/` (`index.astro`, `contact-us.astro`, `press.astro`). The old WordPress URLs `/contact-us/` and `/press/` are kept.
- Shared header and footer: `src/layouts/Base.astro`. Colors and type: `src/styles/global.css`.
- Press links: `src/data/press.ts`.
- Images, video and logos: `public/media/` and `public/brand/`.

## Animations (Remotion)

The animations are a [Remotion](https://www.remotion.dev) project in `video/`:

| Composition | Where it's used | File in `public/media/` |
|---|---|---|
| `HeroIntro` | Not used on the site right now (welcome intro: "Welcome to GridFlow", then the flow lines meet at the G) | — |
| `HeroLoop` | Roadmap section background | `hero-loop.mp4` |
| `DayCycle` | "One day on a solar grid": 4-hour lithium vs 12-hour vanadium | `day-cycle.mp4` |
| `FlowBattery` | Technology section: how a flow battery charges and discharges | `flow-battery.mp4` |

```bash
cd video
npm install
npm run dev     # preview and edit in Remotion Studio
# re-render one, e.g.:
npx remotion render DayCycle out/DayCycle.mp4 --codec=h264 --crf=27 --scale=0.75
cp out/DayCycle.mp4 ../public/media/day-cycle.mp4
```

Every loop is seamless, and the last frame of `HeroIntro` matches the first frame of `HeroLoop`. Electrolyte colors follow real vanadium charge states (V²⁺ violet, V³⁺ green, V⁴⁺ blue, V⁵⁺ yellow). On the site, animations only play while on screen, each has a pause button, and they stay still for visitors who have reduced motion turned on.

Remotion is free for companies of up to 3 people. Larger teams need a company license: https://www.remotion.pro/license

## Deploy

Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
