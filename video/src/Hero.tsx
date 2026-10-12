import "@fontsource-variable/archivo/standard.css";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Hero background for gridflow.tech.
// HeroIntro plays once ("Welcome to GridFlow", then the flow lines draw in and meet at the G).
// Its last frame matches frame 0 of HeroLoop, which then loops seamlessly behind the headline.

export const INTRO = 150; // 5 s
export const HERO_LOOP = 240; // 8 s

const BG = "#0E2A47";
const COLORS = ["#7B4BC4", "#3F9A62", "#2F78C4", "#E8B93E", "#6FA8DC"];
const C = { x: 1440, y: 540 }; // where the G sits
const R = 250; // ring radius around the G

type Pt = [number, number];

// Orthogonal "pipe" routes from the edges of the frame to points on the ring.
const ringPt = (deg: number): Pt => [C.x + R * Math.cos((deg * Math.PI) / 180), C.y + R * Math.sin((deg * Math.PI) / 180)];

const ROUTES: Pt[][] = (() => {
  const left: Array<[number, number, number, number]> = [
    // startY, bendX, midY, ring angle (deg)
    [90, 420, 250, 222],
    [210, 640, 330, 208],
    [330, 300, 420, 196],
    [470, 760, 470, 186],
    [560, 520, 540, 180],
    [650, 880, 610, 174],
    [770, 360, 660, 164],
    [880, 700, 740, 152],
    [1000, 560, 830, 140],
  ];
  const routes: Pt[][] = left.map(([y0, bx, my, a]) => {
    const [ex, ey] = ringPt(a);
    const approachX = Math.min(ex - 90, 1080);
    return [
      [-20, y0],
      [bx, y0],
      [bx, my],
      [approachX, my],
      [approachX, ey],
      [ex, ey],
    ];
  });
  // From the top and bottom edges
  for (const [x0, a, dir] of [
    [1240, 248, -1],
    [1620, 292, -1],
    [1300, 112, 1],
    [1680, 68, 1],
  ] as Array<[number, number, number]>) {
    const [ex, ey] = ringPt(a);
    const y0 = dir < 0 ? -20 : 1100;
    const midY = dir < 0 ? 140 : 940;
    routes.push([
      [x0, y0],
      [x0, midY],
      [ex, midY],
      [ex, ey],
    ]);
  }
  return routes;
})();

const d = (pts: Pt[]) => "M" + pts.map((p) => p.join(" ")).join(" L");

const Lines: React.FC<{ frame: number; reveal: (i: number) => number; flow: number }> = ({ frame, reveal, flow }) => {
  // Flow dashes move by a whole number of dash periods per loop, so the loop is seamless.
  const t = ((frame % HERO_LOOP) + HERO_LOOP) % HERO_LOOP;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {ROUTES.map((pts, i) => {
        const color = COLORS[i % COLORS.length];
        const p = reveal(i);
        return (
          <g key={i}>
            <path d={d(pts)} pathLength={1} stroke="#1D4470" strokeWidth={10} strokeDasharray={`${p} 2`} />
            <path
              d={d(pts)}
              pathLength={1}
              stroke={color}
              strokeWidth={10}
              strokeDasharray="0.018 0.042"
              strokeDashoffset={-(t / HERO_LOOP) * 0.06 * (2 + (i % 3))}
              opacity={flow}
            />
          </g>
        );
      })}
    </g>
  );
};

const Mark: React.FC<{ frame: number; show: number; ring: number }> = ({ frame, show, ring }) => {
  const k = (((frame % 120) + 120) % 120) / 120;
  const pulse = frame >= 0 ? Math.sin(Math.PI * k) * 0.35 : 0;
  return (
    <>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="#5E7FA3" strokeWidth={6} pathLength={1} strokeDasharray={`${ring} 2`} transform={`rotate(-90 ${C.x} ${C.y})`} />
        <circle cx={C.x} cy={C.y} r={R + 70 * k} fill="none" stroke="#6FA8DC" strokeWidth={4} opacity={pulse} />
      </svg>
      <Img
        name="G mark"
        src={staticFile("g-mark.png")}
        style={{
          position: "absolute",
          left: C.x - 170,
          top: C.y - 170,
          width: 340,
          height: 340,
          opacity: show,
          scale: interpolate(show, [0, 1], [0.85, 1]),
        }}
      />
    </>
  );
};

const Backdrop: React.FC = () => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 25 }, (_, i) => (
      <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke="#14365A" strokeWidth={1} />
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#14365A" strokeWidth={1} />
    ))}
  </svg>
);

export const HeroIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "'Archivo Variable', sans-serif" }}>
      <Backdrop />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Lines
          frame={frame - INTRO}
          reveal={(i) => interpolate(frame, [70 + i * 3, 125 + i * 3], [0, 1], { ...clamp, easing: ease })}
          flow={interpolate(frame, [120, INTRO - 1], [0, 1], clamp)}
        />
      </svg>
      <Mark
        frame={frame - INTRO}
        show={interpolate(frame, [105, 140], [0, 1], { ...clamp, easing: ease })}
        ring={interpolate(frame, [110, INTRO - 1], [0, 1], { ...clamp, easing: ease })}
      />
      <Interactive.Div
        name="Welcome"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 120,
          fontWeight: 760,
          fontStretch: "114%",
          letterSpacing: "-0.01em",
          opacity: interpolate(frame, [0, 24, 68, 92], [0, 1, 1, 0], clamp),
          translate: interpolate(frame, [0, 24], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
          scale: interpolate(frame, [68, 92], [1, 0.96], clamp),
        }}
      >
        Welcome to GridFlow
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Lines frame={frame} reveal={() => 1} flow={1} />
      </svg>
      <Mark frame={frame} show={1} ring={1} />
    </AbsoluteFill>
  );
};

