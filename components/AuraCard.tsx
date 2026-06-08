import type { AuraType } from "@/lib/auraData";

type AuraCardProps = {
  nickname: string;
  aura: AuraType;
  score: number;
  code?: string;
  compact?: boolean;
};

const rarityStyles: Record<
  AuraType["rarity"],
  {
    label: string;
    className: string;
  }
> = {
  comum: {
    label: "Comum",
    className: "border-slate-300/20 bg-slate-300/10 text-slate-100",
  },
  rara: {
    label: "Rara",
    className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  },
  épica: {
    label: "Épica",
    className: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100",
  },
};

export function AuraCard({
  nickname,
  aura,
  score,
  code,
  compact = false,
}: AuraCardProps) {
  const rarity = rarityStyles[aura.rarity];

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${aura.gradient} p-[2px] shadow-[0_0_80px_rgba(124,58,237,0.38)]`}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-[#090A14]/95 p-5 backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_28%,rgba(255,255,255,0.06)_50%,transparent_70%)]" />
        <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-90px] right-[-90px] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-white/80">
              Aura Social
            </div>

            <div className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-black text-slate-300">
              {aura.collectionNumber}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">
                carta de aura
              </p>

              <p className="mt-3 break-words text-sm font-bold text-slate-400">
                {nickname}
              </p>

              <h2 className="mt-2 text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">
                {aura.name}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                aura
              </p>
              <p className="text-3xl font-black text-white">{score}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <div
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${rarity.className}`}
            >
              {rarity.label}
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-300">
              {aura.visualTitle}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div
              className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${aura.gradient} p-[2px] ${
                compact ? "h-44 w-44" : "h-60 w-60"
              } shadow-[0_0_90px_rgba(56,189,248,0.45)]`}
            >
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.9rem] bg-slate-950/70 p-4 text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_45%)]" />
                <div className="pointer-events-none absolute left-[-30%] top-[-30%] h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <div className="pointer-events-none absolute bottom-[-35%] right-[-30%] h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_50px_rgba(255,255,255,0.18)] backdrop-blur sm:h-32 sm:w-32">
                  <span
                    className={`leading-none ${
                      compact ? "text-6xl" : "text-7xl"
                    }`}
                  >
                    {aura.symbol}
                  </span>
                </div>

                <p className="relative mt-5 text-xs font-black uppercase tracking-[0.22em] text-white/80">
                  {aura.visualTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xl font-black text-white">{aura.short}</p>

            {!compact && (
              <p className="mt-3 leading-7 text-slate-300">
                {aura.description}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-200">
              frase da aura
            </p>
            <p className="mt-3 text-2xl font-black leading-tight text-white">
              “{aura.phrase}”
            </p>
          </div>

          {!compact && (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <AuraInfo title="Força" text={aura.strength} />
                <AuraInfo title="Sombra" text={aura.shadow} />
                <AuraInfo title="Ganha aura quando" text={aura.gain} />
                <AuraInfo title="Perde aura quando" text={aura.lose} />
              </div>

              <div className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">
                  missão de hoje
                </p>
                <p className="mt-3 text-lg font-black text-white">
                  {aura.mission}
                </p>
              </div>
            </>
          )}

          {code && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                código da aura
              </p>
              <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-200">
                {code}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Coleção base
            </p>
            <p className="text-xs font-bold text-slate-400">
              sua vibe fala antes de você
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuraInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 font-semibold leading-6 text-slate-100">{text}</p>
    </div>
  );
}