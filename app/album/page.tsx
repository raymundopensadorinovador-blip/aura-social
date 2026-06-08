"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auraTypes } from "@/lib/auraData";
import { supabase } from "@/lib/supabase";

const specialAura = {
  id: "hexa",
  name: "Aura do Hexa",
  short: "A carta especial Brasil 2026.",
  phrase: "Minha energia veste verde, amarelo e sonho.",
  symbol: "🇧🇷",
  visualTitle: "Brasil 2026",
  gradient: "from-green-400 via-yellow-300 to-blue-600",
};

const LOCAL_ALBUM_KEY = "aura-social-album-key";
const LOCAL_PASTED_AURAS = "aura-social-pasted-auras";

function generateAlbumKey() {
  const existingKey = window.localStorage.getItem(LOCAL_ALBUM_KEY);

  if (existingKey) {
    return existingKey;
  }

  const newKey = `album-${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-5)}`;

  window.localStorage.setItem(LOCAL_ALBUM_KEY, newKey);

  return newKey;
}

function AlbumContent() {
    const searchParams = useSearchParams();
const highlightedAura = searchParams.get("aura");
const shareSlug = searchParams.get("slug");

const [albumKey, setAlbumKey] = useState("");
const [pastedAuras, setPastedAuras] = useState<string[]>([]);
const [albumMessage, setAlbumMessage] = useState("");
const [isSavingAura, setIsSavingAura] = useState(false);
  
    useEffect(() => {
      if (!highlightedAura) return;
  
      const timer = window.setTimeout(() => {
        const element = document.getElementById(`aura-${highlightedAura}`);
  
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 250);
  
      return () => window.clearTimeout(timer);
    }, [highlightedAura]);

    useEffect(() => {
        async function loadAlbum() {
          const key = generateAlbumKey();
          setAlbumKey(key);
      
          const localSaved = window.localStorage.getItem(LOCAL_PASTED_AURAS);
      
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved) as string[];
      
              if (Array.isArray(parsed)) {
                setPastedAuras(parsed);
              }
            } catch {
              window.localStorage.removeItem(LOCAL_PASTED_AURAS);
            }
          }
      
          const { data, error } = await supabase
            .from("aura_album_entries")
            .select("aura_type")
            .eq("album_key", key);
      
          if (error) {
            console.error(error);
            return;
          }
      
          const remoteAuras = data?.map((item) => item.aura_type) ?? [];
      
          setPastedAuras((current) => {
            const merged = Array.from(new Set([...current, ...remoteAuras]));
            window.localStorage.setItem(LOCAL_PASTED_AURAS, JSON.stringify(merged));
            return merged;
          });
        }
      
        loadAlbum();
      }, []);
  
      async function pasteAura(auraId: string) {
        const aura = auraTypes.find((item) => item.id === auraId);
      
        if (!aura) return;
      
        const key = albumKey || generateAlbumKey();
      
        setAlbumKey(key);
        setIsSavingAura(true);
      
        const nextAuras = Array.from(new Set([...pastedAuras, auraId]));
      
        setPastedAuras(nextAuras);
        window.localStorage.setItem(LOCAL_PASTED_AURAS, JSON.stringify(nextAuras));
      
        const { error } = await supabase.from("aura_album_entries").upsert(
          {
            album_key: key,
            aura_type: aura.id,
            aura_name: aura.name,
            share_slug: shareSlug,
            source: "album_paste",
          },
          {
            onConflict: "album_key,aura_type",
          }
        );
      
        setIsSavingAura(false);
      
        if (error) {
          console.error(error);
          setAlbumMessage(
            "Figurinha colada neste navegador, mas não conseguimos salvar no Supabase."
          );
        } else {
          setAlbumMessage("Figurinha colada no álbum.");
        }
      
        window.setTimeout(() => {
          setAlbumMessage("");
        }, 2400);
      }
  
    return (
    <main className="min-h-screen overflow-hidden bg-[#090A14] text-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-90px] top-[-90px] h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
        <div className="absolute right-[-120px] top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <section className="relative mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Aura Social
            </p>
            <h1 className="mt-1 text-lg font-black tracking-tight text-white">
              Álbum de Auras
            </h1>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur transition hover:bg-white/10"
          >
            início
          </a>
        </header>

        {albumMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
            <p className="font-bold text-emerald-100">{albumMessage}</p>
          </div>
        )}

        <div className="py-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              coleção inicial
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Cole suas auras e desbloqueie cartas especiais.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Cada aura revelada pode virar uma figurinha no seu álbum. As cartas
              principais formam sua coleção base. As especiais aparecem em
              eventos, missões e desafios. Sim, agora até autopercepção tem
              álbum, porque aparentemente figurinhas venceram a filosofia.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-yellow-300/20 bg-yellow-300/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div
                className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${specialAura.gradient} p-[2px] shadow-[0_0_80px_rgba(250,204,21,0.25)]`}
              >
                <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[1.9rem] bg-slate-950/75 p-6 text-center">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_45%)]" />
                  <div className="pointer-events-none absolute left-[-20%] top-[-20%] h-40 w-40 rounded-full bg-green-300/25 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-[-25%] right-[-20%] h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />

                  <div className="relative rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-yellow-100">
                    carta especial
                  </div>

                  <div className="relative mt-8 flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_70px_rgba(250,204,21,0.25)] backdrop-blur">
                    <span className="text-7xl">{specialAura.symbol}</span>
                  </div>

                  <h3 className="relative mt-6 text-4xl font-black tracking-tight text-white">
                    {specialAura.name}
                  </h3>

                  <p className="relative mt-3 text-sm font-black uppercase tracking-[0.25em] text-white/80">
                    {specialAura.visualTitle}
                  </p>

                  <p className="relative mt-4 max-w-xs text-sm leading-6 text-slate-200">
                    “{specialAura.phrase}”
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-200">
                  slot mais desejado
                </p>

                <h3 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                  Aura do Hexa ficará em destaque no álbum.
                </h3>

                <p className="mt-4 leading-7 text-slate-300">
                  Essa carta não entra no sorteio comum. Ela será desbloqueada
                  por missão especial, pontos de aura ou participação dos amigos.
                  A ideia é ela parecer rara, desejada e temporária, não só mais
                  uma carta largada no meio do álbum como panfleto de mercado.
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm font-bold text-yellow-100">
                    Status: bloqueada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Futuro desbloqueio sugerido: 3 amigos responderem + presença
                    em dias diferentes + pontos de aura.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                  auras principais
                </p>
                <h3 className="mt-2 text-3xl font-black text-white">
                  Coleção base
                </h3>
              </div>

              <p className="text-sm font-bold text-slate-400">
  {pastedAuras.length}/{auraTypes.length} coladas
</p>  
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auraTypes.map((aura) => {
  const isHighlighted = highlightedAura === aura.id;
  const isPasted = pastedAuras.includes(aura.id);

  return (
    <div
      id={`aura-${aura.id}`}
      key={aura.id}
      className={`group relative scroll-mt-10 overflow-hidden rounded-[2rem] border bg-white/[0.04] p-4 transition ${
        isHighlighted
          ? "border-yellow-300/60 shadow-[0_0_50px_rgba(250,204,21,0.22)]"
          : "border-dashed border-white/15 hover:border-cyan-300/30 hover:bg-white/[0.07]"
      }`}
    >

<div
  className={`absolute right-4 top-4 z-10 rounded-full border px-3 py-1 text-xs font-black ${
    isPasted
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : isHighlighted
        ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-100"
        : "border-white/10 bg-slate-950/60 text-slate-500"
  }`}
>
  {isPasted ? "colada" : isHighlighted ? "nova aura" : "vazio"}
</div>
      <div
  className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${aura.gradient} p-[2px] transition ${
    isPasted || isHighlighted
      ? "opacity-100 grayscale-0"
      : "opacity-45 grayscale group-hover:opacity-70 group-hover:grayscale-0"
  } ${isPasted ? "rotate-[-1deg] shadow-[0_0_35px_rgba(16,185,129,0.18)]" : ""}`}
>
                    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[1.4rem] bg-slate-950/85 p-5 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <span className="text-4xl">{aura.symbol}</span>
                      </div>

                      <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                        {aura.visualTitle}
                      </p>

                      <h4 className="mt-3 text-2xl font-black text-white">
                        {aura.name}
                      </h4>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
  {aura.collectionNumber} • {aura.rarity}
</p>
                    </div>
                  </div>

                  <div
  className={`mt-4 rounded-2xl border p-4 ${
    isPasted
      ? "border-emerald-300/20 bg-emerald-500/10"
      : isHighlighted
        ? "border-yellow-300/20 bg-yellow-300/10"
        : "border-white/10 bg-slate-950/40"
  }`}
>
  <p
    className={`font-bold ${
      isPasted
        ? "text-emerald-100"
        : isHighlighted
          ? "text-yellow-100"
          : "text-slate-300"
    }`}
  >
  {isPasted
  ? "✓ Figurinha colada"
  : isHighlighted
    ? "Aura recém-revelada"
    : "Ainda não colada"}  
  </p>

  <p
    className={`mt-2 text-sm leading-6 ${
      isPasted
        ? "text-emerald-100/80"
        : isHighlighted
          ? "text-yellow-100/80"
          : "text-slate-500"
    }`}
  >
   {isPasted
  ? "Essa aura já está colada no seu álbum. Mais uma figurinha para sua coleção."
  : isHighlighted
    ? "Essa é a aura que saiu no seu teste. Você pode colar essa figurinha agora."
    : "Revele essa aura para colar a figurinha neste espaço."} 
  </p>

  {isHighlighted && !isPasted && (
  <button
    onClick={() => pasteAura(aura.id)}
    disabled={isSavingAura}
    className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isSavingAura ? "Colando..." : "Colar figurinha"}
  </button>
)}  
</div>  
                  </div>
  );
})}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
export default function AlbumPage() {
    return (
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#090A14] px-5 py-8 text-slate-50">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Aura Social
                </p>
                <h1 className="mt-4 text-4xl font-black">
                  Carregando álbum...
                </h1>
              </div>
            </div>
          </main>
        }
      >
        <AlbumContent />
      </Suspense>
    );
  }