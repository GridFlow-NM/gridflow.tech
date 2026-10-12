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

## Hero animation (Remotion)

The flow-battery animation in the hero is a [Remotion](https://www.remotion.dev) project in `video/`.

```bash
cd video
npm install
npm run dev                                   # preview and edit in Remotion Studio
npx remotion render FlowBattery out/flow-battery.mp4 --codec=h264 --crf=26 --scale=0.8
cp out/flow-battery.mp4 ../public/media/
npx remotion still FlowBattery out/poster.png --frame=0 --scale=0.8   # then convert to public/media/flow-battery-poster.webp
```

The animation is one 12-second charge/discharge cycle and loops seamlessly. Electrolyte colors follow real vanadium charge states (V²⁺ violet, V³⁺ green, V⁴⁺ blue, V⁵⁺ yellow).

Remotion is free for companies of up to 3 people. Larger teams need a company license: https://www.remotion.pro/license

## Deploy

Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
