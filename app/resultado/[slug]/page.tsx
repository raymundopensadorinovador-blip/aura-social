"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuraCard } from "@/components/AuraCard";
import { auraTypes } from "@/lib/auraData";

type AuraSession = {
  id: string;
  nickname: string;
  aura_type: string;
  aura_name: string;
  aura_phrase: string;
  score: number;
  share_slug: string;
  created_at: string;
};

type FriendReview = {
  id: string;
  friend_nickname: string;
  perception_title: string;
  perception_text: string;
  perception_scores: Record<string, number>;
  created_at: string;
};

const traitLabels: Record<string, string> = {
  paz: "paz",
  misterio: "mistério",
  intensidade: "intensidade",
  confianca: "confiança",
  criatividade: "criatividade",
  presenca: "presença",
  sensibilidade: "sensibilidade",
  lealdade: "lealdade",
  distancia: "distância",
  forca: "força",
};

export default function AuraResultPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [auraSession, setAuraSession] = useState<AuraSession | null>(null);
  const [reviews, setReviews] = useState<FriendReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  const loadResult = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!slug) return;

      if (!options?.silent) {
        setIsLoading(true);
      }

      setLoadError("");

      const { data: sessionData, error: sessionError } = await supabase
        .from("aura_sessions")
        .select(
          "id, nickname, aura_type, aura_name, aura_phrase, score, share_slug, created_at"
        )
        .eq("share_slug", slug)
        .single();

      if (sessionError || !sessionData) {
        console.error(sessionError);
        setLoadError("Não encontramos essa aura. O link pode estar incompleto.");
        setAuraSession(null);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("friend_reviews")
        .select(
          "id, friend_nickname, perception_title, perception_text, perception_scores, created_at"
        )
        .eq("aura_session_id", sessionData.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error(reviewsError);
        setLoadError(
          "Encontramos a aura, mas não conseguimos carregar as respostas dos amigos."
        );
        setAuraSession(sessionData);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      setAuraSession(sessionData);
      setReviews(reviewsData ?? []);
      setIsLoading(false);
    },
    [slug]
  );

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  const currentAura = useMemo(() => {
    if (!auraSession) return null;

    return (
      auraTypes.find((aura) => aura.id === auraSession.aura_type) ?? null
    );
  }, [auraSession]);

  const analysis = useMemo(() => {
    const totalScores: Record<string, number> = {};

    reviews.forEach((review) => {
      Object.entries(review.perception_scores ?? {}).forEach(([trait, value]) => {
        totalScores[trait] = (totalScores[trait] ?? 0) + Number(value ?? 0);
      });
    });

    const sortedTraits = Object.entries(totalScores).sort((a, b) => b[1] - a[1]);

    const mainTrait = sortedTraits[0]?.[0] ?? "";
    const secondTrait = sortedTraits[1]?.[0] ?? "";

    const topPerceptionTitle = reviews.reduce<Record<string, number>>(
      (acc, review) => {
        acc[review.perception_title] = (acc[review.perception_title] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const mostRepeatedTitle =
      Object.entries(topPerceptionTitle).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "";

    return {
      totalScores,
      sortedTraits,
      mainTrait,
      secondTrait,
      mostRepeatedTitle,
    };
  }, [reviews]);

  function getAwarenessText() {
    if (!auraSession) return "";

    if (reviews.length === 0) {
      return "Ainda falta o olhar dos amigos para comparar com sua própria aura. Compartilhe o link e veja o que muda quando outras pessoas entram na leitura.";
    }

    if (analysis.mainTrait === "distancia") {
      return "Seus amigos estão percebendo uma energia mais difícil de acessar. Talvez o que para você pareça proteção, para os outros esteja parecendo afastamento.";
    }

    if (analysis.mainTrait === "presenca" || analysis.mainTrait === "intensidade") {
      return "Seus amigos percebem uma presença forte em você. Isso pode ser carisma, intensidade ou impacto. A questão é usar essa força sem atropelar o ambiente.";
    }

    if (analysis.mainTrait === "sensibilidade" || analysis.mainTrait === "paz") {
      return "Seus amigos percebem uma energia sensível e acolhedora. Isso mostra presença emocional, mas também pede cuidado para você não carregar tudo sozinho.";
    }

    if (analysis.mainTrait === "criatividade" || analysis.mainTrait === "misterio") {
      return "Seus amigos percebem algo diferente e curioso em você. Sua aura parece chamar atenção sem precisar se explicar demais.";
    }

    if (analysis.mainTrait === "lealdade" || analysis.mainTrait === "confianca") {
      return "Seus amigos percebem firmeza e confiança em você. Essa é uma presença que passa segurança, mas não precisa virar obrigação de ser forte o tempo todo.";
    }

    return "Seus amigos percebem uma energia própria em você. O mais interessante agora é comparar se isso combina com a forma como você se enxerga.";
  }

  function showCopyMessage(message: string) {
    setCopyMessage(message);
  
    window.setTimeout(() => {
      setCopyMessage("");
    }, 2200);
  }

  async function refreshResult() {
    setIsRefreshing(true);
    setRefreshMessage("");

    await loadResult({ silent: true });

    setIsRefreshing(false);
    setRefreshMessage("Comparativo atualizado.");

    window.setTimeout(() => {
      setRefreshMessage("");
    }, 2200);
  }

  function copyFriendLink() {
    if (!auraSession) return;
  
    const link = `${window.location.origin}/a/${auraSession.share_slug}`;
  
    navigator.clipboard?.writeText(
      `Minha Aura Social saiu: ${auraSession.aura_name}. Agora quero ver como você me percebe. Responde aqui: ${link}`
    );
  
    showCopyMessage("Link para amigos copiado.");
  }

  function copyResultLink() {
    if (!auraSession) return;
  
    const link = `${window.location.origin}/resultado/${auraSession.share_slug}`;
  
    navigator.clipboard?.writeText(
      `Veja o comparativo da minha Aura Social: ${link}`
    );
  
    showCopyMessage("Link do comparativo copiado.");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090A14] text-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-90px] top-[-90px] h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute right-[-120px] top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Aura Social
            </p>
            <h1 className="mt-1 text-lg font-black tracking-tight text-white">
              Comparativo de aura
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshResult}
              disabled={isLoading || isRefreshing}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 backdrop-blur transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRefreshing ? "atualizando..." : "atualizar"}
            </button>

            <a
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur transition hover:bg-white/10"
            >
              início
            </a>
          </div>
        </header>

        {refreshMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
            <p className="font-bold text-emerald-100">{refreshMessage}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                lendo respostas
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Carregando comparativo...
              </h2>
              <p className="mt-4 text-slate-300">
                Juntando sua aura com a percepção dos amigos.
              </p>
            </div>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-2xl rounded-[2rem] border border-red-300/20 bg-red-500/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-200">
                algo deu errado
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Não deu para abrir esse comparativo.
              </h2>
              <p className="mt-4 leading-7 text-red-100">{loadError}</p>
            </div>
          </div>
        )}

        {!isLoading && !loadError && auraSession && (
          <div className="py-10">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                  como você se vê
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                  {auraSession.nickname}
                </h2>

                {currentAura ? (
                  <div className="mt-6">
                    <AuraCard
                      nickname={auraSession.nickname}
                      aura={currentAura}
                      score={auraSession.score}
                      code={auraSession.share_slug}
                      compact
                    />
                  </div>
                ) : (
                  <div className="mt-6 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
                    <p className="text-sm text-fuchsia-200">Aura revelada</p>
                    <p className="mt-2 text-3xl font-black text-white">
                      {auraSession.aura_name}
                    </p>
                    <p className="mt-3 text-xl font-black leading-tight text-white">
                      “{auraSession.aura_phrase}”
                    </p>
                    <p className="mt-4 text-sm font-bold text-slate-300">
                      Pontuação: {auraSession.score}
                    </p>
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    código da aura
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-200">
                    {auraSession.share_slug}
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
  <button
    onClick={copyFriendLink}
    className="rounded-2xl bg-white px-5 py-4 font-black text-slate-950 transition hover:scale-[1.01]"
  >
    Chamar amigos para responder
  </button>

  <a
    href={`/album?aura=${auraSession.aura_type}&slug=${auraSession.share_slug}`}
    className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-center font-black text-yellow-100 transition hover:bg-yellow-300/15"
  >
    Ver álbum de auras
  </a>

  <button
    onClick={copyResultLink}
    className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-black text-white transition hover:bg-white/15"
  >
    Copiar link do comparativo
  </button>
</div>      

{copyMessage && (
  <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
    <p className="font-bold text-emerald-100">{copyMessage}</p>
  </div>
)}  
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                  como amigos te veem
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-tight">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "resposta" : "respostas"}
                </h2>

                {reviews.length === 0 ? (
  <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/40 p-5">
    <p className="text-xl font-black text-white">
      Ainda falta o olhar dos amigos.
    </p>

    <p className="mt-3 leading-7 text-slate-300">
      Sua aura já foi revelada, mas o comparativo só ganha força quando outras
      pessoas respondem como percebem sua presença.
    </p>

    <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <p className="text-sm font-bold text-cyan-100">
        Chame pelo menos 3 amigos para ter uma leitura mais interessante.
      </p>
    </div>

    <button
      onClick={copyFriendLink}
      className="mt-5 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950 transition hover:scale-[1.01]"
    >
      Chamar amigos para responder
    </button>
    {copyMessage && (
  <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center">
    <p className="font-bold text-emerald-100">{copyMessage}</p>
  </div>
)}
  </div>
) : (
                  <>
                    <div className="mt-6 rounded-[2rem] border border-emerald-300/20 bg-emerald-500/10 p-5">
                      <p className="text-sm text-emerald-200">
                        percepção mais forte
                      </p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {analysis.mainTrait
                          ? traitLabels[analysis.mainTrait] ?? analysis.mainTrait
                          : "presença"}
                      </p>
                      {analysis.secondTrait && (
                        <p className="mt-2 text-sm font-bold text-slate-300">
                          Também apareceu:{" "}
                          {traitLabels[analysis.secondTrait] ??
                            analysis.secondTrait}
                        </p>
                      )}
                    </div>

                    {analysis.mostRepeatedTitle && (
                      <div className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                        <p className="text-sm text-cyan-200">
                          leitura mais repetida
                        </p>
                        <p className="mt-2 text-2xl font-black text-white">
                          {analysis.mostRepeatedTitle}
                        </p>
                      </div>
                    )}
                  </>
                )}

{reviews.length > 0 && (
  <div className="mt-5 grid gap-3 sm:grid-cols-2">
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        você se vê como
      </p>
      <p className="mt-3 text-2xl font-black text-white">
        {auraSession.aura_name}
      </p>
    </div>

    <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        amigos percebem mais
      </p>
      <p className="mt-3 text-2xl font-black text-white">
        {analysis.mainTrait
          ? traitLabels[analysis.mainTrait] ?? analysis.mainTrait
          : "presença"}
      </p>
    </div>
  </div>
)}

<div className="mt-5 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
  <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-200">
    ponto de consciência
  </p>
  <p className="mt-3 text-lg font-black leading-7 text-white">
    {getAwarenessText()}
  </p>
</div> 
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                  respostas recebidas
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                        {review.friend_nickname}
                      </p>
                      <h3 className="mt-3 text-xl font-black text-white">
                        {review.perception_title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {review.perception_text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}