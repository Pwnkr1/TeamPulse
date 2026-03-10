"use client";

const NODES = [
  { x: 8, y: 12, r: 2.5, delay: 0, dur: 4 },
  { x: 22, y: 35, r: 1.5, delay: 0.8, dur: 5 },
  { x: 45, y: 8, r: 3, delay: 1.2, dur: 3.5 },
  { x: 67, y: 22, r: 2, delay: 0.3, dur: 6 },
  { x: 82, y: 48, r: 1, delay: 1.8, dur: 4.5 },
  { x: 14, y: 58, r: 2.5, delay: 2.2, dur: 5 },
  { x: 35, y: 72, r: 1.5, delay: 0.6, dur: 4 },
  { x: 56, y: 65, r: 2, delay: 1.5, dur: 5.5 },
  { x: 76, y: 78, r: 3, delay: 0.2, dur: 6 },
  { x: 91, y: 88, r: 1, delay: 2, dur: 4 },
  { x: 5, y: 88, r: 2, delay: 0.9, dur: 5 },
  { x: 50, y: 88, r: 1.5, delay: 2.8, dur: 4 },
  { x: 72, y: 5, r: 2, delay: 0.4, dur: 3 },
  { x: 88, y: 62, r: 1, delay: 1.1, dur: 5 },
  { x: 30, y: 42, r: 2.5, delay: 1.7, dur: 6 },
  { x: 18, y: 82, r: 1.5, delay: 0.5, dur: 4 },
  { x: 62, y: 38, r: 2, delay: 2.5, dur: 5 },
  { x: 95, y: 28, r: 1, delay: 0.7, dur: 4 },
  { x: 42, y: 52, r: 3, delay: 1.4, dur: 6 },
  { x: 8, y: 38, r: 1.5, delay: 2.1, dur: 4 },
];

const CONNECTIONS = [
  [0, 1], [1, 14], [2, 6], [3, 4], [5, 6], [6, 7],
  [7, 8], [9, 8], [10, 5], [11, 7], [12, 3], [13, 4],
  [14, 15], [16, 18], [17, 12], [18, 7], [19, 1],
];

export default function AnimatedBg({ variant = "cyan" }: { variant?: "cyan" | "purple" }) {
  const c = variant === "cyan" ? "#06B6D4" : "#8B5CF6";
  const orbs =
    variant === "cyan"
      ? [
          { size: 380, x: 8, y: 15, delay: "0s", dur: "8s" },
          { size: 480, x: 70, y: 62, delay: "2.5s", dur: "10s" },
          { size: 260, x: 85, y: 8, delay: "5s", dur: "7s" },
          { size: 320, x: 28, y: 80, delay: "1.5s", dur: "9s" },
        ]
      : [
          { size: 400, x: 5, y: 20, delay: "0s", dur: "9s" },
          { size: 500, x: 72, y: 55, delay: "3s", dur: "11s" },
          { size: 280, x: 90, y: 5, delay: "6s", dur: "8s" },
          { size: 340, x: 30, y: 85, delay: "2s", dur: "10s" },
        ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${c}14 1px, transparent 1px), linear-gradient(90deg, ${c}14 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating glow orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle, ${c}12 0%, transparent 70%)`,
            animation: `float ${orb.dur} ${orb.delay} ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Neural network SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke={c}
            strokeWidth="0.2"
            strokeOpacity="0.35"
          />
        ))}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={c}
            style={{
              animation: `neuralPulse ${n.dur}s ${n.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
