import type { AuraType } from "@/lib/auraData";

type AuraShareCardProps = {
  nickname: string;
  aura: AuraType;
  score: number;
};

const rarityLabels: Record<AuraType["rarity"], string> = {
  comum: "Comum",
  rara: "Rara",
  épica: "Épica",
};

export function AuraShareCard({ nickname, aura, score }: AuraShareCardProps) {
  return (
    <div
      className={`relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] bg-gradient-to-br ${aura.gradient} p-[2px] shadow-[0_0_80px_rgba(124,58,237,0.4)]`}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-[#090A14] p-5 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_42%)]" />
        <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-100px] right-[-90px] h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
            Aura Social
          </div>

          <div className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-[10px] font-black text-slate-300">
            {aura.collectionNumber}
          </div>
        </div>

        <div className="relative mt-7">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
            carta revelada
          </p>

          <p className="mt-3 break-words text-sm font-bold text-slate-400">
            {nickname}
          </p>

          <h2 className="mt-2 text-4xl font-black leading-none tracking-tight text-white">
            {aura.name}
          </h2>
        </div>

        <div className="relative mt-5 flex justify-center">
          <div
            className={`relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${aura.gradient} p-[2px] shadow-[0_0_70px_rgba(56,189,248,0.38)]`}
          >
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.9rem] bg-slate-950/75">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),transparent_48%)]" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_55px_rgba(255,255,255,0.2)] backdrop-blur">
                <span className="text-7xl leading-none">{aura.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
          <div className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-100">
            {rarityLabels[aura.rarity]}
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
            {aura.visualTitle}
          </div>

          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
            {score} pts
          </div>
        </div>

        <div className="relative mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-lg font-black leading-tight text-white">
            “{aura.phrase}”
          </p>
        </div>

        <div className="relative mt-4 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            missão
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-white">
            {aura.mission}
          </p>
        </div>

        <div className="relative mt-5 border-t border-white/10 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            sua vibe fala antes de você
          </p>
        </div>
      </div>
    </div>
  );
}