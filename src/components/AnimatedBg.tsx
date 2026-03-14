"use client";

const ORBS = [
  { size: 520, x: 5,  y: 10, delay: "0s",   dur: "9s",  color: "rgba(124,107,196,0.13)" },
  { size: 440, x: 75, y: 60, delay: "3s",   dur: "11s", color: "rgba(233,160,32,0.10)"  },
  { size: 320, x: 88, y: 8,  delay: "6s",   dur: "8s",  color: "rgba(124,107,196,0.09)" },
  { size: 380, x: 30, y: 82, delay: "1.5s", dur: "10s", color: "rgba(233,160,32,0.08)"  },
  { size: 260, x: 55, y: 35, delay: "4s",   dur: "7s",  color: "rgba(169,157,214,0.10)" },
];

export default function AnimatedBg({ variant = "cyan" }: { variant?: "cyan" | "purple" }) {
  void variant; // theme is now unified — kept for API compatibility
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(124,107,196,0.18) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          opacity: 0.5,
        }}
      />

      {/* Floating soft orbs */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  orb.size,
            height: orb.size,
            left:   `${orb.x}%`,
            top:    `${orb.y}%`,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `float ${orb.dur} ${orb.delay} ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
