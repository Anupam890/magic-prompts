export function AuroraBg({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[color:var(--aurora-1)] opacity-30 blur-[120px] animate-aurora" />
      <div
        className="absolute top-20 right-0 h-[600px] w-[600px] rounded-full bg-[color:var(--aurora-2)] opacity-25 blur-[140px] animate-aurora"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[color:var(--aurora-3)] opacity-25 blur-[140px] animate-aurora"
        style={{ animationDelay: "-14s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
