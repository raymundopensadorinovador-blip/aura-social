"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import {
  type Answer,
  calculateAura,
  generateAuraSlug,
  questions,
} from "@/lib/auraData";
import { supabase } from "@/lib/supabase";
import { AuraCard } from "@/components/AuraCard";
import { AuraShareCard } from "@/components/AuraShareCard";

const LOCAL_DAILY_AURA_KEY = "aura-social-daily-aura";
const LOCAL_LAST_AURA_LINK_KEY = "aura-social-last-aura-link";
const LOCAL_AURA_PROFILE_KEY = "aura-social-profile";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateProfileKey() {
  return `profile-${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-5)}`;
}

function generateDisplayCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeNickname(value: string) {
  return value.trim().slice(0, 24);
}

export default function Home() {
  const [step, setStep] = useState<
  "home" | "profile" | "quiz" | "result" | "daily-limit"
>("home");

const [afterProfileAction, setAfterProfileAction] = useState<
  "start-quiz" | "open-album" | "open-last-aura" | ""
>(""); 


  const [nickname, setNickname] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const [auraSlug, setAuraSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [hasDailyAura, setHasDailyAura] = useState(false);
const [lastAuraSlug, setLastAuraSlug] = useState("");
const [lastAuraType, setLastAuraType] = useState("");
const [activeNickname, setActiveNickname] = useState("");
const [lastAuraName, setLastAuraName] = useState("");
const [profileKey, setProfileKey] = useState("");
const [displayCode, setDisplayCode] = useState("");
const [isRepeatedAura, setIsRepeatedAura] = useState(false);
const [previousAuraCount, setPreviousAuraCount] = useState(0);
const shareCardRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  const saved = window.localStorage.getItem(LOCAL_DAILY_AURA_KEY);
  const lastLink = window.localStorage.getItem(LOCAL_LAST_AURA_LINK_KEY);
  const savedProfile = window.localStorage.getItem(LOCAL_AURA_PROFILE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as {
        date?: string;
        slug?: string;
        auraType?: string;
      };
  
      if (parsed.date === getTodayKey() && parsed.slug) {
        setHasDailyAura(true);
        setLastAuraSlug(parsed.slug);
        setLastAuraType(parsed.auraType ?? "");
      }
    } catch {
      window.localStorage.removeItem(LOCAL_DAILY_AURA_KEY);
    }
  } 

  if (lastLink) {
    try {
      const parsed = JSON.parse(lastLink) as {
        slug?: string;
        auraType?: string;
      };

      if (parsed.slug) {
        setLastAuraSlug(parsed.slug);
        setLastAuraType(parsed.auraType ?? "");
      }
    } catch {
      window.localStorage.removeItem(LOCAL_LAST_AURA_LINK_KEY);
    }
  }
  if (savedProfile) {
    try {
      
      const parsed = JSON.parse(savedProfile) as {
        profileKey?: string;
        nickname?: string;
        displayCode?: string;
        auraName?: string;
        auraType?: string;
        slug?: string;
      };
  
      setActiveNickname(parsed.nickname ?? "");
      setNickname(parsed.nickname ?? "");
      setLastAuraName(parsed.auraName ?? "");
      setLastAuraType(parsed.auraType ?? "");
      setLastAuraSlug(parsed.slug ?? "");
      setProfileKey(parsed.profileKey ?? "");
      setDisplayCode(parsed.displayCode ?? "");  
    } catch {
      window.localStorage.removeItem(LOCAL_AURA_PROFILE_KEY);
    }
  }

}, []);
  const result = useMemo(() => {
    if (selectedAnswers.length < questions.length) return null;
    return calculateAura(selectedAnswers);
  }, [selectedAnswers]);

  function requireProfile(
    action: "start-quiz" | "open-album" | "open-last-aura"
  ) {
    if (!activeNickname.trim()) {
      setAfterProfileAction(action);
      setStep("profile");
      return;
    }
  
    if (action === "start-quiz") {
      if (hasDailyAura) {
        setStep("daily-limit");
        return;
      }
  
      setStep("profile");
      return;
    }
  
    if (action === "open-album") {
      if (lastAuraSlug && lastAuraType) {
        window.location.href = `/album?aura=${lastAuraType}&slug=${lastAuraSlug}`;
        return;
      }
  
      setAfterProfileAction("start-quiz");
      setStep("profile");
      return;
    }
  
    if (action === "open-last-aura") {
      if (lastAuraSlug) {
        window.location.href = `/resultado/${lastAuraSlug}`;
        return;
      }
  
      setAfterProfileAction("start-quiz");
      setStep("profile");
    }
  }

  async function ensureLocalProfile() {
    const cleanName = normalizeNickname(nickname || activeNickname);
  
    if (!cleanName) {
      return null;
    }
  
    let currentProfileKey = profileKey;
    let currentDisplayCode = displayCode;
  
    if (!currentProfileKey) {
      currentProfileKey = generateProfileKey();
    }
  
    if (!currentDisplayCode) {
      currentDisplayCode = generateDisplayCode();
    }
  
    const profilePayload = {
      profileKey: currentProfileKey,
      nickname: cleanName,
      displayCode: currentDisplayCode,
      auraName: lastAuraName,
      auraType: lastAuraType,
      slug: lastAuraSlug,
    };
  
    window.localStorage.setItem(
      LOCAL_AURA_PROFILE_KEY,
      JSON.stringify(profilePayload)
    );
  
    setProfileKey(currentProfileKey);
    setDisplayCode(currentDisplayCode);
    setActiveNickname(cleanName);
    setNickname(cleanName);
  
    const { error } = await supabase.from("aura_profiles").upsert(
      {
        profile_key: currentProfileKey,
        nickname: cleanName,
        display_code: currentDisplayCode,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "profile_key",
      }
    );
  
    if (error) {
      console.error(error);
    }
  
    return {
      profileKey: currentProfileKey,
      nickname: cleanName,
      displayCode: currentDisplayCode,
    };
  }

  async function startQuiz() {
    const profile = await ensureLocalProfile();
  
    if (!profile) {
      return;
    }
  
    if (afterProfileAction === "open-album" && lastAuraSlug && lastAuraType) {
      setAfterProfileAction("");
      window.location.href = `/album?aura=${lastAuraType}&slug=${lastAuraSlug}`;
      return;
    }
  
    if (afterProfileAction === "open-last-aura" && lastAuraSlug) {
      setAfterProfileAction("");
      window.location.href = `/resultado/${lastAuraSlug}`;
      return;
    }
  
    setAfterProfileAction("");
    setStep("quiz");
  }

  async function selectAnswer(answer: Answer) {
    const newAnswers = [...selectedAnswers, answer];
    setSelectedAnswers(newAnswers);
  
    if (currentQuestion + 1 >= questions.length) {
      const newSlug = generateAuraSlug();
      const calculatedResult = calculateAura(newAnswers);
      const profile = await ensureLocalProfile();

      if (!profile) {
        setSaveError("Coloque um apelido para farmar sua aura.");
        return;
      }
  
      setAuraSlug(newSlug);
      setIsSaving(true);
      setSaveError("");

      const { count: previousCount, error: previousError } = await supabase
  .from("aura_sessions")
  .select("id", { count: "exact", head: true })
  .eq("profile_key", profile.profileKey)
  .eq("aura_type", calculatedResult.aura.id);

if (previousError) {
  console.error(previousError);
}

const alreadyFarmed = (previousCount ?? 0) > 0;

setIsRepeatedAura(alreadyFarmed);
setPreviousAuraCount(previousCount ?? 0);
  
const { error } = await supabase.from("aura_sessions").insert({
  profile_key: profile.profileKey,
  nickname: profile.nickname, 
        aura_type: calculatedResult.aura.id,
        aura_name: calculatedResult.aura.name,
        aura_phrase: calculatedResult.aura.phrase,
        score: calculatedResult.score,
        answers: newAnswers.map((item) => item.label),
        scores: calculatedResult.scores,
        share_slug: newSlug,
      });
  
      setIsSaving(false);
  
      if (error) {
        console.error(error);
        setSaveError(
          "Sua aura apareceu, mas o link ainda não salvou. Tenta de novo daqui a pouco."
        );
      }
     
      window.localStorage.setItem(
        LOCAL_LAST_AURA_LINK_KEY,
        JSON.stringify({
          slug: newSlug,
          auraType: calculatedResult.aura.id,
        })
      );

      window.localStorage.setItem(
        LOCAL_AURA_PROFILE_KEY,
        JSON.stringify({
          nickname: nickname.trim(),
          auraName: calculatedResult.aura.name,
          auraType: calculatedResult.aura.id,
          slug: newSlug,
        })
      );
      
       setActiveNickname(profile.nickname);
       setDisplayCode(profile.displayCode);
       setProfileKey(profile.profileKey);
       setLastAuraName(calculatedResult.aura.name);
      
      setHasDailyAura(true);
      setLastAuraSlug(newSlug);
      setLastAuraType(calculatedResult.aura.id);

      setStep("result");
      return;
    }
  
    setCurrentQuestion((prev) => prev + 1);
  }

  function restart() {
    if (hasDailyAura) {
      setStep("daily-limit");
      return;
    }
  
    setStep("profile");
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setAuraSlug("");
    setIsSaving(false);
    setSaveError("");
    setCopyMessage("");
    setIsRepeatedAura(false);
    setPreviousAuraCount(0);
  } 

  function showCopyMessage(message: string) {
    setCopyMessage(message);
  
    window.setTimeout(() => {
      setCopyMessage("");
    }, 2200);
  }

  async function createShareCardFile() {
    if (!shareCardRef.current || !result) return null;
  
    const blob = await toBlob(shareCardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#090A14",
    });
  
    if (!blob) return null;
  
    return new File([blob], `aura-social-${result.aura.id}.png`, {
      type: "image/png",
    });
  }

  async function saveShareCardAsImage() {
    if (!shareCardRef.current || !result) return;
  
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#090A14",
      });
  
      const link = document.createElement("a");
      link.download = `aura-social-${result.aura.id}.png`;
      link.href = dataUrl;
      link.click();
  
      showCopyMessage("Carta salva na galeria.");
    } catch (error) {
      console.error(error);
      showCopyMessage("Não deu para salvar a carta agora.");
    }
  }

  async function shareAuraCard() {
    if (!result) return;
  
    const friendLink = `${window.location.origin}/a/${auraSlug}`;
    const shareText = `Farmei minha Aura Social: ${result.aura.name}. Agora quero ver como você lê minha vibe. Responde aqui: ${friendLink}`;
  
    try {
      const file = await createShareCardFile();
  
      if (
        file &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: "Minha Aura Social",
          text: shareText,
          files: [file],
        });
  
        showCopyMessage("Carta enviada.");
        return;
      }
  
      if (navigator.share) {
        await navigator.share({
          title: "Minha Aura Social",
          text: shareText,
          url: friendLink,
        });
  
        showCopyMessage("Link enviado.");
        return;
      }
  
      await navigator.clipboard?.writeText(shareText);
      showCopyMessage("Não abriu o compartilhamento. Copiei o link.");
    } catch (error) {
      console.error(error);
      showCopyMessage("Não deu para compartilhar agora.");
    }
  }

  function shareAuraOnWhatsApp() {
    if (!result) return;
  
    const friendLink = `${window.location.origin}/a/${auraSlug}`;
  
    const message = `Farmei minha Aura Social: ${result.aura.name}.

    "${result.aura.phrase}"
    
    Agora quero ver como você lê minha vibe. Responde aqui:
    ${friendLink}`;
  
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  
    showCopyMessage("Abrindo WhatsApp.");
  }

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  return (
    <main className="min-h-screen overflow-hidden bg-[#090A14] text-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute right-[-90px] top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between gap-4">
  <div className="min-w-0">
    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
      Aura Social
    </p>
    <h1 className="mt-1 truncate text-lg font-black tracking-tight text-white">
    {activeNickname
  ? `Entrando como ${activeNickname}${
      displayCode ? `#${displayCode}` : ""
    }${lastAuraName ? ` · ${lastAuraName}` : ""}`
  : "Entre com apelido para farmar sua aura."}
    </h1>
  </div>

  <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
    beta aberto
  </div>
</header>

        {step === "home" && (
          <div className="flex flex-1 items-center py-12">
            <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
              <div className="mb-5 inline-flex rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-sm font-bold text-fuchsia-100 backdrop-blur">
  Quiz + carta + álbum + vibe da galera
</div>

<h2 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
  Farme sua aura e veja como a galera lê sua vibe.
</h2>

<p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
  Responda o quiz, ganhe uma carta de aura, mande o link para os amigos e cole
  suas figurinhas no álbum. A Aura do Hexa fica bloqueada para quem realmente
  carregar energia no app.
</p>  

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

    <button
    onClick={() => requireProfile("start-quiz")}
     className="rounded-2xl bg-white px-6 py-4 text-base font-black text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.25)] transition hover:scale-[1.02]"
  >
    Farmar aura de hoje
  </button>

  <a
  href="#como-funciona"
  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-base font-bold text-white backdrop-blur transition hover:bg-white/10"
>
  Como funciona
</a> 

<button
  onClick={() => requireProfile("open-album")}
  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-4 text-center text-base font-bold text-cyan-100 backdrop-blur transition hover:bg-cyan-300/15"
>
  Abrir álbum
</button>  
</div>

{lastAuraSlug && (
  <div className="mt-6 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5 shadow-2xl backdrop-blur-xl">
    <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-200">
      sua aura ativa
    </p>

    <h3 className="mt-3 text-2xl font-black text-white">
      {activeNickname
        ? `${activeNickname}, sua carta está pronta para rodar.`
        : "Sua carta está pronta para rodar."}
    </h3>

    <p className="mt-3 text-sm leading-6 text-fuchsia-100/80">
      Mande o link para seus amigos responderem como leem sua vibe. Quanto mais
      gente responde, mais forte fica sua leitura da galera.
    </p>

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <button
        onClick={() => {
          const friendLink = `${window.location.origin}/a/${lastAuraSlug}`;

          navigator.clipboard?.writeText(
            `Farmei minha Aura Social${lastAuraName ? `: ${lastAuraName}` : ""}. Quero ver como você lê minha vibe. Responde aqui: ${friendLink}`
          );

          showCopyMessage("Link da aura copiado.");
        }}
        className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.01]"
      >
        Copiar link
      </button>

      <button
        onClick={() => {
          const friendLink = `${window.location.origin}/a/${lastAuraSlug}`;

          const message = `Farmei minha Aura Social${lastAuraName ? `: ${lastAuraName}` : ""}.

Quero ver como você lê minha vibe. Responde aqui:
${friendLink}`;

          window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener,noreferrer"
          );

          showCopyMessage("Abrindo WhatsApp.");
        }}
        className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/15"
      >
        WhatsApp
      </button>

      <button
  onClick={() => requireProfile("open-last-aura")}
  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15"
>
  Ver leitura
</button> 
    </div>
  </div>
)}

{copyMessage && (
  <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
    <p className="font-bold text-emerald-100">{copyMessage}</p>
  </div>
)}

                <p className="mt-5 text-xs leading-5 text-slate-500">
                É uma experiência leve de autopercepção. Não é teste psicológico, diagnóstico ou avaliação clínica.
                </p>
                <div
  id="como-funciona"
  className="mt-8 grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-2"
>
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
      01
    </p>
    <h3 className="mt-2 font-black text-white">Farme sua aura</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Responda situações rápidas e receba uma carta com sua vibe do dia.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
      02
    </p>
    <h3 className="mt-2 font-black text-white">Mande para a galera</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Compartilhe o link e descubra como seus amigos percebem sua presença.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
      03
    </p>
    <h3 className="mt-2 font-black text-white">Cole no álbum</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Cada aura farmada pode virar figurinha. O álbum carrega energia conforme
      você coleciona.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
      04
    </p>
    <h3 className="mt-2 font-black text-white">Libere cartas especiais</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      A Aura do Hexa exige amigos, pontos e presença. Raro sem missão é só
      brinde digital.
    </p>
  </div>
</div>
              </div>

              <div className="relative mx-auto w-full max-w-sm">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-fuchsia-500 via-violet-600 to-cyan-400 blur-2xl opacity-60" />

                <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="rounded-[1.5rem] bg-[#0D1020] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                        Carta farmada
                      </span>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                        780 pts
                      </span>
                    </div>

                    <div className="mt-8 aspect-square rounded-[2rem] bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-400 p-[2px]">
                      <div className="flex h-full flex-col items-center justify-center rounded-[1.9rem] bg-slate-950/80 p-6 text-center">
                        <div className="mb-5 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-purple-700 shadow-[0_0_60px_rgba(56,189,248,0.65)]" />
                        <h3 className="text-3xl font-black">Aura Lunar</h3>
                        <p className="mt-3 text-sm text-slate-300">
                          Minha aura não grita. Ela observa.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">
                        Missão da vibe:
                      </p>
                      <p className="mt-1 font-bold text-white">
                        Dizer uma coisa verdadeira sem esperar que descubram.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

{step === "daily-limit" && (
  <div className="flex flex-1 items-center justify-center py-12">
    <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
        aura de hoje já foi
      </p>

      <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
      {activeNickname
  ? `${activeNickname}, sua aura de hoje já foi farmada.`
  : "Sua aura de hoje já foi farmada."}
      </h2>

      <p className="mt-4 text-slate-300">
  Coloque seu nome ou apelido para o app saber qual aura está ativa neste celular.
  Sem senha, sem cadastro e sem novela.
</p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {lastAuraSlug && (
          <a
            href={`/resultado/${lastAuraSlug}`}
            className="rounded-2xl bg-white px-5 py-4 text-center font-black text-slate-950 transition hover:scale-[1.01]"
          >
            Ver aura de hoje
          </a>
        )}

        {lastAuraSlug && lastAuraType && (
          <a
            href={`/album?aura=${lastAuraType}&slug=${lastAuraSlug}`}
            className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-center font-black text-yellow-100 transition hover:bg-yellow-300/15"
          >
            Abrir meu álbum
          </a>
        )}
        {lastAuraSlug && (
  <button
    onClick={() => {
      const friendLink = `${window.location.origin}/a/${lastAuraSlug}`;

      const message = `Farmei minha Aura Social${lastAuraName ? `: ${lastAuraName}` : ""}.

Quero ver como você lê minha vibe. Responde aqui:
${friendLink}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );

      showCopyMessage("Abrindo WhatsApp.");
    }}
    className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-center font-black text-emerald-100 transition hover:bg-emerald-300/15 sm:col-span-2"
  >
    Mandar link no WhatsApp
  </button>
)}
{copyMessage && (
  <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
    <p className="font-bold text-emerald-100">{copyMessage}</p>
  </div>
)}
      </div>

      <button
        onClick={() => setStep("home")}
        className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 transition hover:bg-white/5"
      >
        Voltar ao início
      </button>
    </div>
  </div>
)}

        {step === "profile" && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
  entrar no app
</p> 

<h2 className="mt-4 text-4xl font-black tracking-tight">
  Quem está usando agora?
</h2>

              <p className="mt-4 text-slate-300">
              Hoje já deu farm. Volta amanhã para puxar uma nova aura. Enquanto isso, abre o álbum, manda o link para a galera e vê como estão lendo sua vibe.
              </p>

              <label className="mt-8 block text-sm font-bold text-slate-200">
                Nome ou apelido
              </label>

              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Ex: Soph, Nick, Alpha..."
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-lg font-bold text-white outline-none ring-0 placeholder:text-slate-600 focus:border-cyan-300"
              />

              <button
                onClick={startQuiz}
                disabled={!nickname.trim()}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-4 text-base font-black text-white shadow-[0_0_40px_rgba(236,72,153,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
              >
               {afterProfileAction === "open-album"
  ? "Entrar e abrir álbum"
  : afterProfileAction === "open-last-aura"
    ? "Entrar e ver leitura"
    : "Entrar e farmar aura"} 
              </button>

              <button
                onClick={() => setStep("home")}
                className="mt-4 w-full rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {step === "quiz" && (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-2xl">
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>
                    Pergunta {currentQuestion + 1} de {questions.length}
                  </span>
                  <span>{progress}%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                  {nickname}
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  {questions[currentQuestion].question}
                </h2>

                <div className="mt-8 grid gap-3">
                  {questions[currentQuestion].answers.map((answer) => (
                    <button
                      key={answer.label}
                      onClick={() => selectAnswer(answer)}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-left text-base font-bold text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/10"
                    >
                      {answer.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

{step === "result" && result && (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-2xl">
              <AuraCard
                nickname={nickname}
                aura={result.aura}
                score={result.score}
                code={auraSlug}
              />

{isRepeatedAura && (
  <div className="mt-6 rounded-[2rem] border border-yellow-300/20 bg-yellow-300/10 p-5 text-center shadow-2xl backdrop-blur-xl">
    <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-200">
      boost aplicado
    </p>

    <h3 className="mt-3 text-3xl font-black text-white">
      Você já tinha farmado essa aura.
    </h3>

    <p className="mt-3 text-sm leading-6 text-yellow-100/80">
      Essa carta não veio repetida à toa. Ela ganhou mais energia no seu histórico.
      Quanto mais essa aura aparece, mais forte ela fica na sua leitura.
    </p>

    <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-black text-yellow-100">
      Farmada {previousAuraCount + 1}x
    </p>
  </div>
)}     

<div className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
  <div>
    <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
      carta para postar
    </p>
    <p className="mt-2 text-sm leading-6 text-slate-400">
    Salve, mande no WhatsApp ou jogue no story. A carta já nasceu querendo aparecer.
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
  <button
    onClick={shareAuraCard}
    disabled={isSaving || !!saveError || !auraSlug}
    className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-300/15 disabled:cursor-not-allowed disabled:opacity-40"
  >
    Compartilhar
  </button>

  <button
    onClick={shareAuraOnWhatsApp}
    disabled={isSaving || !!saveError || !auraSlug}
    className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-40"
  >
    WhatsApp
  </button>

  <button
    onClick={saveShareCardAsImage}
    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/15"
  >
    Salvar imagem
  </button>
</div> 
</div> 

  <div ref={shareCardRef}>
  <AuraShareCard
    nickname={nickname}
    aura={result.aura}
    score={result.score}
  />
</div>
</div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${nickname} farmou ${result.aura.name} no Aura Social: "${result.aura.phrase}"`
                    );

                    showCopyMessage("Sua aura foi copiada.");
                  }}
                  className="rounded-2xl bg-white px-5 py-4 font-black text-slate-950 transition hover:scale-[1.01]"
                >
                  Copiar carta
                </button>

                <button
                  onClick={() => {
                    const futureLink = `${window.location.origin}/a/${auraSlug}`;

                    navigator.clipboard?.writeText(
                      `Farmei minha Aura Social: ${result.aura.name}. Agora quero ver como você lê minha vibe. Responde aqui: ${futureLink}`
                    );

                    showCopyMessage("Link da vibe copiado.");
                  }}
                  disabled={isSaving || !!saveError || !auraSlug}
                  className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mandar para a galera
                </button>
              </div>

              <a
                href={`/resultado/${auraSlug}`}
                className={`mt-3 block rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-center font-black text-cyan-100 transition hover:bg-cyan-300/15 ${
                  isSaving || saveError || !auraSlug
                    ? "pointer-events-none cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                Ver leitura da galera
              </a>

              <a
  href={`/album?aura=${result.aura.id}&slug=${auraSlug}`}
  className="mt-3 block rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-center font-black text-yellow-100 transition hover:bg-yellow-300/15"
>
  Abrir álbum de auras
</a> 

              {copyMessage && (
                <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
                  <p className="font-bold text-emerald-100">{copyMessage}</p>
                </div>
              )}

              <button
                onClick={restart}
                className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 transition hover:bg-white/5"
              >
                Tentar de novo
              </button>
            </div>
          </div>
        )}   
          </section>
    </main>
  );
}
