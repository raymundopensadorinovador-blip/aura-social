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
  collectionNumber: "ESP-001",
  rarity: "Especial",
};

const LOCAL_ALBUM_KEY = "aura-social-album-key";
const LOCAL_PASTED_AURAS = "aura-social-pasted-auras";
const LOCAL_PRESENCE_DAYS = "aura-social-presence-days";
const LOCAL_HEXA_UNLOCKED = "aura-social-hexa-unlocked";
const LOCAL_HEXA_PASTED = "aura-social-hexa-pasted";
const LOCAL_AURA_PROFILE_KEY = "aura-social-profile";

const HEXA_POINTS_TARGET = 1800;

function generateAlbumKey(scope?: string | null) {
  if (scope) {
    return `album-${scope}`;
  }

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

function getScopedStorageKey(baseKey: string, scope: string) {
  return `${baseKey}-${scope}`;
}

function AlbumContent() {
  const searchParams = useSearchParams();
  const highlightedAura = searchParams.get("aura");
  const shareSlug = searchParams.get("slug");
  const storageScope = shareSlug ?? "local";
const pastedAurasStorageKey = getScopedStorageKey(
  LOCAL_PASTED_AURAS,
  storageScope
);
const presenceDaysStorageKey = getScopedStorageKey(
  LOCAL_PRESENCE_DAYS,
  storageScope
);
const hexaUnlockedStorageKey = getScopedStorageKey(
  LOCAL_HEXA_UNLOCKED,
  storageScope
);
const hexaPastedStorageKey = getScopedStorageKey(
  LOCAL_HEXA_PASTED,
  storageScope
);
  
  const [albumKey, setAlbumKey] = useState("");
  const [profileKey, setProfileKey] = useState("");
  const [pastedAuras, setPastedAuras] = useState<string[]>([]);
  const [albumMessage, setAlbumMessage] = useState("");
  const [selectedAuraId, setSelectedAuraId] = useState("");
  const [isSavingAura, setIsSavingAura] = useState(false);
  const [hexaFriendCount, setHexaFriendCount] = useState(0);
  const [hexaAuraPoints, setHexaAuraPoints] = useState(0);
  const [presenceDays, setPresenceDays] = useState(0);
  const [isHexaUnlocked, setIsHexaUnlocked] = useState(false);
  const [isHexaPasted, setIsHexaPasted] = useState(false);
  const [isLoadingHexaProgress, setIsLoadingHexaProgress] = useState(false);

  const canUnlockHexa =
  hexaFriendCount >= 3 &&
  hexaAuraPoints >= HEXA_POINTS_TARGET &&
  presenceDays >= 3;
const totalAlbumCards = auraTypes.length + 1;
const collectedCards = pastedAuras.length + (isHexaPasted ? 1 : 0);
const albumEnergyPercent = Math.min(
  100,
  Math.round((collectedCards / totalAlbumCards) * 100)
); 

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
      const savedProfile = window.localStorage.getItem(LOCAL_AURA_PROFILE_KEY);
    
      if (!savedProfile) return;
    
      try {
        const parsed = JSON.parse(savedProfile) as {
          profileKey?: string;
        };
    
        setProfileKey(parsed.profileKey ?? "");
      } catch {
        window.localStorage.removeItem(LOCAL_AURA_PROFILE_KEY);
      }
    }, []);

    useEffect(() => {
      const today = new Date().toISOString().slice(0, 10);
      const saved = window.localStorage.getItem(presenceDaysStorageKey);
    
      let days: string[] = [];
    
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as string[];
    
          if (Array.isArray(parsed)) {
            days = parsed;
          }
        } catch {
          window.localStorage.removeItem(presenceDaysStorageKey);
        }
      }
    
      const updatedDays = Array.from(new Set([...days, today]));
    
      window.localStorage.setItem(
        presenceDaysStorageKey,
        JSON.stringify(updatedDays)
      ); 
    
      setPresenceDays(updatedDays.length);
    }, [presenceDaysStorageKey]);

    useEffect(() => {
      const savedUnlocked = window.localStorage.getItem(hexaUnlockedStorageKey);
      const savedPasted = window.localStorage.getItem(hexaPastedStorageKey);
    
      setIsHexaUnlocked(savedUnlocked === "true");
      setIsHexaPasted(savedPasted === "true");
    }, [hexaUnlockedStorageKey, hexaPastedStorageKey]);
    
    useEffect(() => {
      async function loadHexaFromSupabase() {
        const key = generateAlbumKey(shareSlug);
    
        setAlbumKey(key);
    
        const { data, error } = await supabase
          .from("aura_album_entries")
          .select("aura_type")
          .eq("album_key", key)
          .eq("aura_type", specialAura.id)
          .maybeSingle();
    
        if (error) {
          console.error(error);
          return;
        }
    
        if (data) {
          window.localStorage.setItem(hexaUnlockedStorageKey, "true");
          window.localStorage.setItem(hexaPastedStorageKey, "true");
    
          setIsHexaUnlocked(true);
          setIsHexaPasted(true);
        }
      }
    
      loadHexaFromSupabase();
    }, [shareSlug, hexaUnlockedStorageKey, hexaPastedStorageKey]); 

    useEffect(() => {
        async function loadAlbum() {
          const key = generateAlbumKey(shareSlug);
          setAlbumKey(key);
          
          const localSaved = window.localStorage.getItem(pastedAurasStorageKey); 
      
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved) as string[];
      
              if (Array.isArray(parsed)) {
                setPastedAuras(parsed);
              }
            } catch {
              window.localStorage.removeItem(pastedAurasStorageKey);
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
            window.localStorage.setItem(pastedAurasStorageKey, JSON.stringify(merged));
            return merged;
          });
        }
      
        loadAlbum();
      }, [shareSlug, pastedAurasStorageKey]);

      useEffect(() => {
        async function loadHexaFriendProgress() {
          if (!shareSlug) {
            setHexaFriendCount(0);
            setHexaAuraPoints(0);
            return;
          }  
      
          setIsLoadingHexaProgress(true);
      
          const { data: sessionData, error: sessionError } = await supabase
  .from("aura_sessions")
  .select("id, score")
  .eq("share_slug", shareSlug)
  .maybeSingle();

if (sessionError) {
  console.error("Erro ao buscar sessão da aura:", sessionError);
  setHexaFriendCount(0);
  setHexaAuraPoints(0);
  setIsLoadingHexaProgress(false);
  return;
}

if (!sessionData) {
  setHexaFriendCount(0);
  setHexaAuraPoints(0);
  setIsLoadingHexaProgress(false);
  return;
}
      
          const { count, error: countError } = await supabase
            .from("friend_reviews")
            .select("id", { count: "exact", head: true })
            .eq("aura_session_id", sessionData.id);
      
          if (countError) {
            console.error(countError);
            setHexaFriendCount(0);
setHexaAuraPoints(0);
setIsLoadingHexaProgress(false);
            return;
          }
      
          const friendCount = count ?? 0;
          const baseScore = Number(sessionData.score ?? 0);
          const friendBonus = friendCount * 25;
          
          setHexaFriendCount(friendCount);
          setHexaAuraPoints(baseScore + friendBonus);
          setIsLoadingHexaProgress(false); 
        }
      
        loadHexaFriendProgress();
      }, [shareSlug]);

      async function pasteAura(auraId: string) {
        const aura = auraTypes.find((item) => item.id === auraId);
      
        if (!aura) return;
      
        const key = albumKey || generateAlbumKey(shareSlug); 
      
        setAlbumKey(key);
        setIsSavingAura(true);
      
        const nextAuras = Array.from(new Set([...pastedAuras, auraId]));
      
        setPastedAuras(nextAuras);
        window.localStorage.setItem(
          pastedAurasStorageKey,
          JSON.stringify(nextAuras)
        );
      
        const { error } = await supabase.from("aura_album_entries").upsert(
          {
            album_key: key,
            profile_key: profileKey || null,
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
      async function pasteHexaAura() {
        if (!isHexaUnlocked) return;
      
        const key = albumKey || generateAlbumKey(shareSlug);
      
        setAlbumKey(key);
        setIsSavingAura(true);
      
        window.localStorage.setItem(hexaPastedStorageKey, "true");
        setIsHexaPasted(true);
      
        const { error } = await supabase.from("aura_album_entries").upsert(
          {
            album_key: key,
            profile_key: profileKey || null,
            aura_type: specialAura.id,
            aura_name: specialAura.name,
            share_slug: shareSlug,
            source: "hexa_special_paste",
          },
          {
            onConflict: "album_key,aura_type",
          }
        );
      
        setIsSavingAura(false);
      
        if (error) {
          console.error(error);
          setAlbumMessage(
            "Aura do Hexa colada neste navegador, mas não conseguimos salvar no Supabase."
          );
        } else {
          setAlbumMessage("Aura do Hexa colada como figurinha especial!");
        }
      
        window.setTimeout(() => {
          setAlbumMessage("");
        }, 2800);
      }
      function unlockHexaAura() {
        if (!canUnlockHexa) return;
      
        window.localStorage.setItem(hexaUnlockedStorageKey, "true");
        setIsHexaUnlocked(true);
        setAlbumMessage("Aura do Hexa desbloqueada!");
      
        window.setTimeout(() => {
          setAlbumMessage("");
        }, 2800);
      } 

      function showAlbumMessage(message: string) {
        setAlbumMessage(message);
      
        window.setTimeout(() => {
          setAlbumMessage("");
        }, 2400);
      }
      
      function getFriendLink() {
        if (!shareSlug) return "";
      
        return `${window.location.origin}/a/${shareSlug}`;
      }
      
      function getResultLink() {
        if (!shareSlug) return "";
      
        return `${window.location.origin}/resultado/${shareSlug}`;
      }
      
      async function copyFriendLinkFromAlbum() {
        const friendLink = getFriendLink();
      
        if (!friendLink) {
          showAlbumMessage("Esse álbum não tem link de aura para compartilhar.");
          return;
        }
      
        await navigator.clipboard?.writeText(
          `Farmei minha Aura Social. Agora quero ver como você lê minha vibe. Responde aqui: ${friendLink}`
        );
      
        showAlbumMessage("Link para a galera copiado.");
      }
      
      function shareAlbumOnWhatsApp() {
        const friendLink = getFriendLink();
      
        if (!friendLink) {
          showAlbumMessage("Esse álbum não tem link de aura para mandar.");
          return;
        }
      
        const message = `Farmei minha Aura Social.
      
      Agora quero ver como você lê minha vibe. Responde aqui:
      ${friendLink}`;
      
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        showAlbumMessage("Abrindo WhatsApp.");
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
              seu álbum
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Cole suas cartas, carregue energia e libere raras.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Cada aura farmada pode virar figurinha no álbum. Quanto mais você cola, mais energia carrega. As cartas especiais aparecem por missão, evento e presença no app. 
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-[2px] shadow-[0_0_70px_rgba(56,189,248,0.14)]">
  <div className="relative overflow-hidden rounded-[1.9rem] bg-slate-950/75 p-5 backdrop-blur-xl sm:p-6">
    <div className="pointer-events-none absolute left-[-90px] top-[-90px] h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
    <div className="pointer-events-none absolute right-[-90px] bottom-[-90px] h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200">
          energia do álbum
        </p>

        <h3 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Energia subindo...
        </h3>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
        Cada figurinha colada aumenta sua energia no álbum. A Aura do Hexa entra como carta especial e pesa mais na coleção.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          progresso
        </p>
        <p className="mt-1 text-4xl font-black text-white">
          {albumEnergyPercent}%
        </p>
        <p className="mt-1 text-xs font-bold text-slate-400">
          {collectedCards}/{totalAlbumCards} coladas
        </p>
      </div>
    </div>

    <div className="relative mt-6">
      <div className="h-5 overflow-hidden rounded-full border border-white/10 bg-white/10 p-[3px]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-yellow-300 shadow-[0_0_35px_rgba(56,189,248,0.45)] transition-all duration-700"
          style={{ width: `${albumEnergyPercent}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>início</span>
        <span>full aura</span>
      </div>
    </div>

    <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          base
        </p>
        <p className="mt-2 text-xl font-black text-white">
          {pastedAuras.length}/{auraTypes.length}
        </p>
        <p className="mt-1 text-xs text-slate-400">cartas base</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          especial
        </p>
        <p
          className={`mt-2 text-xl font-black ${
            isHexaPasted ? "text-yellow-100" : "text-slate-500"
          }`}
        >
          {isHexaPasted ? "1/1" : "0/1"}
        </p>
        <p className="mt-1 text-xs text-slate-400">Aura do Hexa</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          status
        </p>
        <p className="mt-2 text-xl font-black text-cyan-100">
          {albumEnergyPercent >= 100
            ? "Completo"
            : albumEnergyPercent >= 70
              ? "Carregado"
              : albumEnergyPercent >= 35
                ? "Em expansão"
                : "Começando"}
        </p>
        <p className="mt-1 text-xs text-slate-400">nível atual</p>
      </div>
    </div>
  </div>
</div>

          <div
  className={`mt-8 rounded-[2rem] border p-5 shadow-2xl backdrop-blur-xl sm:p-6 ${
    isHexaPasted
      ? "border-yellow-300/40 bg-yellow-300/15 shadow-[0_0_80px_rgba(250,204,21,0.16)]"
      : isHexaUnlocked
        ? "border-emerald-300/30 bg-emerald-400/10"
        : "border-yellow-300/25 bg-yellow-300/10"
  }`}
>  
  <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${specialAura.gradient} p-[3px] shadow-[0_0_100px_rgba(250,204,21,0.32)]`}
    >
      <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-[1.85rem] bg-slate-950/78 p-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.38),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,197,94,0.22),transparent_32%,rgba(250,204,21,0.18)_52%,transparent_72%,rgba(37,99,235,0.22))]" />
        <div className="pointer-events-none absolute left-[-22%] top-[-22%] h-48 w-48 rounded-full bg-green-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-18%] top-[20%] h-44 w-44 rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-24%] left-[20%] h-52 w-52 rounded-full bg-blue-500/25 blur-3xl" />

        <div className="relative flex w-full items-center justify-between gap-3">
          <div className="rounded-full border border-yellow-200/30 bg-yellow-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-yellow-100">
            carta especial
          </div>

          <div className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[10px] font-black text-slate-200">
            {specialAura.collectionNumber}
          </div>
        </div>

        <div className="relative mt-8 flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_0_90px_rgba(250,204,21,0.34)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
          <span className="relative text-7xl">{specialAura.symbol}</span>
        </div>

        <div className="relative mt-6 rounded-full border border-green-300/20 bg-green-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-green-100">
          {specialAura.visualTitle}
        </div>

        <h3 className="relative mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
          {specialAura.name}
        </h3>

        <p className="relative mt-4 max-w-xs text-base font-bold leading-7 text-slate-100">
          “{specialAura.phrase}”
        </p>

        <div className="relative mt-6 grid w-full gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              raridade
            </p>
            <p className="mt-1 font-black text-yellow-100">
              {specialAura.rarity}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              evento
            </p>
            <p className="mt-1 font-black text-green-100">Copa 2026</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              status
            </p>
            <p
  className={`mt-1 font-black ${
    isHexaPasted
      ? "text-yellow-100"
      : isHexaUnlocked
        ? "text-emerald-100"
        : "text-slate-200"
  }`}
>
  {isHexaPasted
    ? "Colada"
    : isHexaUnlocked
      ? "Desbloqueada"
      : "Bloqueada"}
</p> 
          </div>
        </div>
      </div>
    </div>

    <div>
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-200">
      carta mais disputada
      </p>

      <h3 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
      A Aura do Hexa é a carta especial do Brasil 2026.
      </h3>

      <p className="mt-4 leading-7 text-slate-300">
      Essa carta não cai fácil. Para liberar, você precisa chamar a galera, farmar pontos e voltar em dias diferentes. Rara de verdade não vem de graça.
      </p>

      {isHexaUnlocked && (
  <div
    className={`mt-5 rounded-2xl border p-4 ${
      isHexaPasted
        ? "border-yellow-300/25 bg-yellow-300/10"
        : "border-emerald-300/20 bg-emerald-500/10"
    }`}
  >
    <p
      className={`text-sm font-black uppercase tracking-[0.25em] ${
        isHexaPasted ? "text-yellow-100" : "text-emerald-100"
      }`}
    >
      {isHexaPasted ? "especial colada" : "carta liberada"}
    </p>
    <p
      className={`mt-2 text-sm leading-6 ${
        isHexaPasted ? "text-yellow-100/80" : "text-emerald-100/80"
      }`}
    >
      {isHexaPasted
        ? "A Aura do Hexa já está colada no seu álbum. Essa é para deixar em destaque."
        : "A Aura do Hexa foi liberada. Agora é só colar a especial no álbum."}
    </p>
  </div>
)}  

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4">
          <p className="text-sm font-black text-yellow-100">
            Como liberar
          </p>
          <p className="mt-2 text-sm leading-6 text-yellow-100/80">
          Nessa aura: {Math.min(hexaFriendCount, 3)}/3 amigos responderam,{" "}
{Math.min(hexaAuraPoints, HEXA_POINTS_TARGET)}/{HEXA_POINTS_TARGET} pontos foram farmados e{" "}
{Math.min(presenceDays, 3)}/3 dias de presença foram registrados.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-black text-cyan-100">
            Por que tem trava
          </p>
          <p className="mt-2 text-sm leading-6 text-cyan-100/80">
          Porque carta rara precisa de missão. Se liberar fácil, vira enfeite e perde graça.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          missão para liberar
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
        Complete as missões para liberar a carta especial. Depois de colada, ela fica como destaque no álbum.
        </p>

        <div className="mt-5 grid gap-3">
  <HexaMissionItem
    label={
      isLoadingHexaProgress
        ? "Checando respostas da galera"
        : "Amigos que responderam sua aura"
    }
    current={Math.min(hexaFriendCount, 3)}
    target={3}
  />

  <HexaMissionItem
    label={
      isLoadingHexaProgress
        ? "Carregando pontos de aura"
        : "Pontos de aura farmados"
    }
    current={Math.min(hexaAuraPoints, HEXA_POINTS_TARGET)}
    target={HEXA_POINTS_TARGET}
  />

  <HexaMissionItem
    label="Dias voltando para o app"
    current={Math.min(presenceDays, 3)}
    target={3}
  />
</div>

        {isHexaUnlocked ? (
  <button
    onClick={pasteHexaAura}
    disabled={isHexaPasted || isSavingAura}
    className={`mt-5 w-full rounded-2xl border px-5 py-4 font-black transition ${
      isHexaPasted
        ? "cursor-default border-yellow-300/25 bg-yellow-300/10 text-yellow-100"
        : "border-emerald-300/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
    }`}
  >
  {isSavingAura
  ? "Colando especial..."
  : isHexaPasted
    ? "✓ Especial colada no álbum"
    : "Colar especia no álbum"}  
  </button>
) : (
  <button
    onClick={unlockHexaAura}
    disabled={!canUnlockHexa}
    className={`mt-5 w-full rounded-2xl border px-5 py-4 font-black transition ${
      canUnlockHexa
        ? "border-yellow-300/30 bg-yellow-300/15 text-yellow-100 hover:bg-yellow-300/20"
        : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
    }`}
  >
  {canUnlockHexa
  ? "Liberar Aura do Hexa"
  : hexaFriendCount >= 3 && hexaAuraPoints >= HEXA_POINTS_TARGET
    ? "Falta voltar mais dias"
    : hexaFriendCount >= 3
      ? "Missão feita: a galera respondeu"
      : hexaAuraPoints >= HEXA_POINTS_TARGET
        ? "Missão feita: pontos farmados"
        : presenceDays >= 3
          ? "Missão feita: presença garantida"
          : "Hexa ainda bloqueada"}  
  </button>
)} 
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
                  Cartas base
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
    onClick={() => setSelectedAuraId(aura.id)}
    className={`group relative scroll-mt-10 cursor-pointer overflow-hidden rounded-[2rem] border bg-white/[0.04] p-4 transition ${
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
    : "Slot vazio"}  
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
  ? "Já está colada. Toque na carta para mandar o link de novo ou ver a leitura da galera."
  : isHighlighted
    ? "Essa foi a carta que você farmou. Cola ela no álbum agora."
    : "Farme essa aura para ocupar esse slot."}  
  </p>

  {isHighlighted && !isPasted && (
    <button
  onClick={(event) => {
    event.stopPropagation();
    pasteAura(aura.id);
  }}
    disabled={isSavingAura}
    className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isSavingAura ? "Colando..." : "Colar carta"}
  </button>
)}  

{selectedAuraId === aura.id && (
  <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
      ações da carta
    </p>

    <p className="mt-2 text-sm leading-6 text-cyan-100/80">
    Mande o link de novo, veja a leitura da galera ou chame mais gente para responder sua vibe.
    </p>

    <div className="mt-4 grid gap-2">
      <button
        onClick={(event) => {
          event.stopPropagation();
          copyFriendLinkFromAlbum();
        }}
        className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.01]"
      >
        Mandar link de novo
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          shareAlbumOnWhatsApp();
        }}
        className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/15"
      >
        WhatsApp
      </button>

      {shareSlug && (
        <a
          href={getResultLink()}
          onClick={(event) => event.stopPropagation()}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-white/10"
        >
          Ver leitura da galera
        </a>
      )}
    </div>

    <button
      onClick={(event) => {
        event.stopPropagation();
        setSelectedAuraId("");
      }}
      className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-cyan-100/80 transition hover:bg-white/5"
    >
      Fechar
    </button>
  </div>
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

function HexaMissionItem({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const percent = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-200">{label}</p>
        <p className="text-sm font-black text-yellow-100">
          {current}/{target}
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-300 to-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
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