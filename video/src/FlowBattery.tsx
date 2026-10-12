import "@fontsource-variable/archivo/standard.css";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";

// One full charge/discharge cycle. Every motion below is periodic in LOOP
// frames, so the rendered video loops seamlessly on the website.
export const LOOP = 360;

// Vanadium electrolyte really changes color with its oxidation state:
// V2+ violet / V3+ green on the negative side, V5+ yellow / V4+ blue on the positive side.
const POS_CHARGED = "#E8B93E";
const LINE = "#5E7FA3";
const BG = "#0E2A47";

const TAU = Math.PI * 2;

type Pt = [number, number];

// Position along a polyline at fraction t (0..1)
const along = (pts: Pt[], t: number): Pt => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const k = d / segs[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

const toPath = (pts: Pt[]) => "M" + pts.map((p) => p.join(" ")).join(" L");

// Tanks
const L_TANK = { x: 120, y: 400, w: 330, h: 470 };
const R_TANK = { x: 1150, y: 400, w: 330, h: 470 };
// Cell stack
const STACK = { x: 640, y: 450, w: 320, h: 340 };

// Electrolyte loops: out of the tank bottom, through the stack, back into the tank top
const L_LOOP: Pt[] = [
  [450, 800], [560, 800], [560, 740], [640, 740], // supply into stack
  [720, 740], [720, 510], [640, 510], // through the half-cell
  [560, 510], [560, 470], [450, 470], // return to tank
];
const R_LOOP: Pt[] = [
  [1150, 800], [1040, 800], [1040, 740], [960, 740],
  [880, 740], [880, 510], [960, 510],
  [1040, 510], [1040, 470], [1150, 470],
];
// Power bus: sun -> junction -> stack top, and stack top -> junction -> grid
const BUS_IN: Pt[] = [[250, 210], [800, 210], [800, 450]];
const BUS_OUT: Pt[] = [[800, 450], [800, 210], [1350, 210]];

const Tank: React.FC<{ box: typeof L_TANK; color: string; level: number; frame: number; side: number }> = ({
  box, color, level, frame, side,
}) => {
  const top = box.y + box.h * (1 - level);
  // Wavy surface, periodic in LOOP/4 frames
  const wave = Array.from({ length: 34 }, (_, i) => {
    const x = box.x + (box.w * i) / 33;
    const y = top + 7 * Math.sin(TAU * (i / 11 + (side * frame) / (LOOP / 4)));
    return `${x} ${y}`;
  });
  const d = `M${wave.join(" L")} L${box.x + box.w} ${box.y + box.h} L${box.x} ${box.y + box.h} Z`;
  return (
    <g>
      <clipPath id={`tank${side}`}>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={34} />
      </clipPath>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={34} fill="#0B2239" />
      <path d={d} fill={color} clipPath={`url(#tank${side})`} opacity={0.92} />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={34} fill="none" stroke={LINE} strokeWidth={4} />
    </g>
  );
};

export const FlowBattery: React.FC = () => {
  const frame = useCurrentFrame();


  const phase = (frame % LOOP) / LOOP;
  // State of charge: 0 (empty) -> 1 (full) -> 0, smooth and seamless
  const soc = 0.5 - 0.5 * Math.cos(TAU * phase);
  const charging = phase < 0.5;
  // How hard power is flowing right now (0 at the turnarounds)
  const power = Math.abs(Math.sin(TAU * phase));

  // Blend around the hue wheel so mid-charge colors stay vivid
  // (half-charged positive electrolyte really is green: blue V4+ + yellow V5+).
  const neg = `hsl(${interpolate(soc, [0, 1], [142, 266])} 46% ${interpolate(soc, [0, 1], [43, 53])}%)`;
  const pos = `hsl(${interpolate(soc, [0, 1], [211, 43])} ${66 - 26 * Math.sin(Math.PI * soc)}% ${interpolate(soc, [0, 1], [48, 58])}%)`;

  const particles = (loop: Pt[], color: string, offset: number) =>
    Array.from({ length: 16 }, (_, i) => {
      const [x, y] = along(loop, i / 16 + (frame / (LOOP / 3)) + offset);
      return <circle key={i} cx={x} cy={y} r={9} fill={color} stroke={BG} strokeWidth={3} />;
    });

  const pulses = Array.from({ length: 6 }, (_, i) => {
    const t = i / 6 + frame / (LOOP / 4);
    const [x, y] = along(charging ? BUS_IN : BUS_OUT, t);
    return <circle key={i} cx={x} cy={y} r={11} fill="#FFFFFF" opacity={0.25 + 0.75 * power} />;
  });

  // Protons crossing the membrane: right->left while charging, left->right while discharging
  const protons = Array.from({ length: 7 }, (_, i) => {
    const t = ((i * 0.37 + frame / (LOOP / 6)) % 1 + 1) % 1;
    const dir = charging ? -1 : 1;
    const x = 800 + dir * interpolate(t, [0, 1], [-60, 60]);
    const y = 545 + i * 30;
    return <circle key={i} cx={x} cy={y} r={5} fill="#FFFFFF" opacity={power * Math.sin(Math.PI * t)} />;
  });

  const rotor = (cx: number, cy: number, dir: number) => (
    <g transform={`rotate(${(dir * frame * 360 * 6) / LOOP} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={30} fill={BG} stroke={LINE} strokeWidth={4} />
      <path d={[0, 1, 2].map((k) => `M${cx} ${cy} L${cx + 19 * Math.cos((k * TAU) / 3)} ${cy + 19 * Math.sin((k * TAU) / 3)}`).join(" ")} stroke="#B9CBE0" strokeWidth={5} strokeLinecap="round" />
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "'Archivo Variable', sans-serif" }}>
      <svg viewBox="0 0 1600 1000" width="100%" height="100%">
        {/* Power bus */}
        <path d={toPath([[250, 210], [1350, 210]])} stroke={LINE} strokeWidth={6} fill="none" />
        <path d={toPath([[800, 210], [800, 450]])} stroke={LINE} strokeWidth={6} fill="none" />
        {pulses}

        {/* Sun */}
        <g opacity={charging ? 1 : 0.35}>
          <circle cx={190} cy={210} r={42} fill={POS_CHARGED} />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * TAU + (frame / LOOP) * TAU;
            return (
              <line key={i} x1={190 + 58 * Math.cos(a)} y1={210 + 58 * Math.sin(a)} x2={190 + 76 * Math.cos(a)} y2={210 + 76 * Math.sin(a)}
                stroke={POS_CHARGED} strokeWidth={7} strokeLinecap="round" />
            );
          })}
        </g>

        {/* Transmission tower */}
        <g opacity={charging ? 0.35 : 1} stroke="#DCE6F2" strokeWidth={6} fill="none" strokeLinejoin="round">
          <path d="M1370 300 L1410 120 L1450 300 M1384 240 L1436 240 M1396 180 L1424 180 M1360 150 L1460 150 M1384 240 L1424 180 M1436 240 L1396 180" />
        </g>

        {/* Pipes */}
        {[L_LOOP, R_LOOP].map((loop, i) => (
          <path key={i} d={toPath(loop)} stroke="#21456B" strokeWidth={30} fill="none" strokeLinejoin="round" />
        ))}
        {particles(L_LOOP, neg, 0)}
        {particles(R_LOOP, pos, 0.5)}

        {/* Tanks */}
        <Tank box={L_TANK} color={neg} level={0.78} frame={frame} side={1} />
        <Tank box={R_TANK} color={pos} level={0.78} frame={frame} side={-1} />

        {/* Pumps on the supply lines */}
        {rotor(505, 800, 1)}
        {rotor(1095, 800, -1)}

        {/* Cell stack */}
        <rect x={STACK.x} y={STACK.y} width={STACK.w} height={STACK.h} rx={18} fill="#132F4F" stroke={LINE} strokeWidth={4} />
        <rect x={STACK.x + 14} y={STACK.y + 14} width={STACK.w / 2 - 22} height={STACK.h - 28} rx={8} fill={neg} opacity={0.35} />
        <rect x={800 + 8} y={STACK.y + 14} width={STACK.w / 2 - 22} height={STACK.h - 28} rx={8} fill={pos} opacity={0.35} />
        <line x1={800} y1={STACK.y + 10} x2={800} y2={STACK.y + STACK.h - 10} stroke="#DCE6F2" strokeWidth={4} strokeDasharray="12 10" />
        {protons}
      </svg>

      <Interactive.Div
        name="Status"
        style={{ position: "absolute", left: 0, right: 0, top: 72, textAlign: "center", color: "#FFFFFF", fontSize: 44, fontWeight: 650, fontStretch: "112%" }}
      >
        <span style={{ opacity: interpolate(power * (charging ? 1 : 0), [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) }}>
          Charging from solar
        </span>
        <span style={{ position: "absolute", left: 0, right: 0, opacity: interpolate(power * (charging ? 0 : 1), [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) }}>
          Powering the grid
        </span>
      </Interactive.Div>

      {/* State of charge */}
      <div style={{ position: "absolute", left: 640, width: 320, top: 830 }}>
        <div style={{ height: 18, borderRadius: 9, backgroundColor: "#21456B", overflow: "hidden" }}>
          <div style={{ width: `${soc * 100}%`, height: "100%", backgroundColor: "#FFFFFF" }} />
        </div>
        <div style={{ marginTop: 14, textAlign: "center", color: "#DCE6F2", fontSize: 32, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(soc * 100)}% charged
        </div>
      </div>

      <Interactive.Div name="Negative label" style={{ position: "absolute", left: 120, width: 330, top: 890, textAlign: "center", color: "#DCE6F2", fontSize: 32, fontWeight: 500 }}>
        Negative electrolyte
      </Interactive.Div>
      <Interactive.Div name="Positive label" style={{ position: "absolute", left: 1150, width: 330, top: 890, textAlign: "center", color: "#DCE6F2", fontSize: 32, fontWeight: 500 }}>
        Positive electrolyte
      </Interactive.Div>
    </AbsoluteFill>
  );
};
