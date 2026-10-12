import "@fontsource-variable/archivo/standard.css";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

// A day on a solar-heavy grid, 6 AM to 6 AM.
// Solar charges storage during the day; after sunset a 4-hour lithium-ion system runs out,
// while a vanadium flow battery sized for 12 hours carries the load to morning.
// Ends on the empty starting state so it loops seamlessly.

export const DAY_LOOP = 330; // 11 s
const SWEEP_END = 250;

const BG = "#0E2A47";
const YELLOW = "#E8B93E";
const VIOLET = "#7B4BC4";
const LI = "#9AA9BA";
const TEXT = "#DCE6F2";
const MUTED = "#8FA6C0";

// Chart geometry (hours 0..24 mapped from 6 AM)
const X0 = 150;
const X1 = 1500;
const xAt = (h: number) => X0 + ((X1 - X0) * h) / 24;
const BASE = 470; // chart baseline
const TOP = 120;

const solar = (h: number) => (h <= 0 || h >= 12 ? 0 : Math.sin((Math.PI * h) / 12)); // 6 AM..6 PM
// Demand: morning bump, midday dip, strong evening peak
const demand = (h: number) =>
  0.42 + 0.12 * Math.exp(-((h - 2) ** 2) / 4) + 0.38 * Math.exp(-((h - 13.5) ** 2) / 6) - 0.08 * Math.exp(-((h - 7) ** 2) / 10);

const curve = (f: (h: number) => number, scale: number) =>
  Array.from({ length: 97 }, (_, i) => {
    const h = i / 4;
    return `${xAt(h)} ${BASE - f(h) * scale}`;
  });

const SCALE = 330;

const lane = (y: number, label: string, sub: string) => (
  <>
    <text x={X0} y={y - 18} fill={TEXT} fontSize={32} fontWeight={600}>
      {label}
    </text>
    <text x={X0 + (label.length > 12 ? 300 : 210)} y={y - 18} fill={MUTED} fontSize={28}>
      {sub}
    </text>
    <rect x={X0} y={y} width={X1 - X0} height={46} rx={10} fill="#163A60" />
  </>
);

export const DayCycle: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Clock hand: 0..24 hours
  const hour = interpolate(frame, [12, SWEEP_END], [0, 24], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const cursorX = xAt(hour);
  const fadeOut = interpolate(frame, [DAY_LOOP - 30, DAY_LOOP - 4], [1, 0], clamp);
  const cursorOpacity = interpolate(frame, [0, 12], [0, 1], clamp) * fadeOut;

  // Lithium: charges during the day, discharges 6 PM-10 PM, then empty.
  // Vanadium: charges during the day, discharges 6 PM-6 AM.
  const segW = (from: number, to: number) => Math.max(0, xAt(Math.min(hour, to)) - xAt(from));

  const LI_Y = 660;
  const V_Y = 800;

  const liRanOut = hour > 16;
  const status = (h0: number, h1: number) => interpolate(hour, [h0, h0 + 0.6, h1 - 0.6, h1], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "'Archivo Variable', sans-serif" }}>
      <svg viewBox="0 0 1600 960" width="100%" height="100%">
        <defs>
          <clipPath id="sweep">
            <rect x={0} y={0} width={cursorX} height={960} />
          </clipPath>
        </defs>

        {/* Night shading after sunset */}
        <rect x={xAt(12)} y={TOP - 20} width={xAt(24) - xAt(12)} height={BASE - TOP + 20} fill="#0A2038" />

        {/* Axis */}
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="#36597F" strokeWidth={3} />
        {[
          [0, "6 AM"],
          [6, "Noon"],
          [12, "6 PM"],
          [18, "Midnight"],
          [24, "6 AM"],
        ].map(([h, t]) => (
          <g key={`${h}${t}`}>
            <line x1={xAt(h as number)} y1={BASE} x2={xAt(h as number)} y2={BASE + 14} stroke="#36597F" strokeWidth={3} />
            <text x={xAt(h as number)} y={BASE + 52} fill={MUTED} fontSize={28} textAnchor="middle">
              {t}
            </text>
          </g>
        ))}

        <g clipPath="url(#sweep)" opacity={fadeOut}>
          {/* Solar generation */}
          <path d={`M${curve(solar, SCALE).join(" L")} L${X1} ${BASE} L${X0} ${BASE} Z`} fill={YELLOW} opacity={0.85} />
          {/* Demand */}
          <path d={`M${curve(demand, SCALE).join(" L")}`} fill="none" stroke="#FFFFFF" strokeWidth={5} />
        </g>

        {/* Legend */}
        <g opacity={interpolate(frame, [0, 20], [0, 1], clamp) * fadeOut}>
          <rect x={X1 - 470} y={TOP - 64} width={28} height={28} rx={6} fill={YELLOW} />
          <text x={X1 - 430} y={TOP - 40} fill={TEXT} fontSize={28}>
            Solar
          </text>
          <line x1={X1 - 300} y1={TOP - 50} x2={X1 - 262} y2={TOP - 50} stroke="#FFFFFF" strokeWidth={5} />
          <text x={X1 - 248} y={TOP - 40} fill={TEXT} fontSize={28}>
            Demand
          </text>
        </g>

        {/* Storage lanes */}
        {lane(LI_Y, "Lithium-ion", "4-hour system")}
        {lane(V_Y, "Vanadium flow", "12-hour system")}

        <g opacity={fadeOut}>
          {/* charging during daylight */}
          <rect x={X0} y={LI_Y} width={segW(0, 12)} height={46} rx={10} fill="#2F5C8A" />
          <rect x={X0} y={V_Y} width={segW(0, 12)} height={46} rx={10} fill="#2F5C8A" />
          {/* discharging after sunset */}
          <rect x={xAt(12)} y={LI_Y} width={segW(12, 16)} height={46} fill={LI} />
          <rect x={xAt(12)} y={V_Y} width={segW(12, 24)} height={46} fill={VIOLET} />
          {/* lithium empty */}
          <rect x={xAt(16)} y={LI_Y} width={segW(16, 24)} height={46} fill="url(#hatch)" />
        </g>
        <defs>
          <pattern id="hatch" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={16} height={16} fill="#163A60" />
            <line x1={0} y1={0} x2={0} y2={16} stroke="#C2554B" strokeWidth={6} />
          </pattern>
        </defs>

        {/* Status words inside lanes */}
        <g fontSize={26} fontWeight={600} opacity={fadeOut} clipPath="url(#sweep)">
          <text x={xAt(6)} y={LI_Y + 32} fill="#DCE6F2" textAnchor="middle" opacity={status(1, 12)}>
            Charging
          </text>
          <text x={xAt(6)} y={V_Y + 32} fill="#DCE6F2" textAnchor="middle" opacity={status(1, 12)}>
            Charging
          </text>
          <text x={xAt(14)} y={LI_Y + 32} fill={BG} textAnchor="middle" opacity={interpolate(hour, [12.5, 13.2], [0, 1], clamp)}>
            Powering homes
          </text>
          <text x={xAt(18)} y={V_Y + 32} fill="#FFFFFF" textAnchor="middle" opacity={interpolate(hour, [12.5, 13.2], [0, 1], clamp)}>
            Powering homes all night
          </text>
          <text x={xAt(20)} y={LI_Y + 32} fill="#FFFFFF" textAnchor="middle" opacity={liRanOut ? interpolate(hour, [16.2, 17], [0, 1], clamp) : 0}>
            Empty
          </text>
        </g>

        {/* Clock cursor */}
        <g opacity={cursorOpacity}>
          <line x1={cursorX} y1={TOP - 10} x2={cursorX} y2={V_Y + 60} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="8 8" />
          <circle cx={cursorX} cy={BASE} r={10} fill="#FFFFFF" />
        </g>
      </svg>

      <Interactive.Div
        name="Title"
        style={{ position: "absolute", left: 150, top: 46, color: "#FFFFFF", fontSize: 40, fontWeight: 700, fontStretch: "110%" }}
      >
        One day on a solar grid
      </Interactive.Div>
    </AbsoluteFill>
  );
};
