export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-background text-foreground">
      <div className="rounded-3xl border border-white/20 bg-white/10 px-10 py-8 text-center backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">ElderShield</p>
        <h1 className="mt-4 font-serif text-5xl text-white">Loading clarity.</h1>
      </div>
    </div>
  );
}
