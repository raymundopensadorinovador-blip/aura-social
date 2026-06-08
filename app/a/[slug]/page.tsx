"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  type FriendAnswer,
  calculateFriendPerception,
  friendQuestions,
} from "@/lib/friendReviewData";
import { supabase } from "@/lib/supabase";

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

export default function FriendReviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [step, setStep] = useState<"intro" | "profile" | "quiz" | "done">(
    "intro"
  );
  const [friendNickname, setFriendNickname] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<FriendAnswer[]>([]);
  const [auraSession, setAuraSession] = useState<AuraSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    async function loadAuraSession() {
      if (!slug) return;

      setIsLoadingSession(true);
      setSessionError("");

      const { data, error } = await supabase
        .from("aura_sessions")
        .select(
          "id, nickname, aura_type, aura_name, aura_phrase, score, share_slug, created_at"
        )
        .eq("share_slug", slug)
        .single();

      if (error || !data) {
        console.error(error);
        setSessionError(
          "Não encontramos essa aura. O link pode estar incompleto ou a aura ainda não foi salva."
        );
        setAuraSession(null);
        setIsLoadingSession(false);
        return;
      }

      setAuraSession(data);
      setIsLoadingSession(false);
    }

    loadAuraSession();
  }, [slug]);

  const perception = useMemo(() => {
    if (selectedAnswers.length < friendQuestions.length) return null;
    return calculateFriendPerception(selectedAnswers);
  }, [selectedAnswers]);

  const progress = Math.round(
    ((currentQuestion + 1) / friendQuestions.length) * 100
  );

  function startReview() {
    if (!friendNickname.trim()) return;
    setStep("quiz");
  }

  async function selectAnswer(answer: FriendAnswer) {
    const newAnswers = [...selectedAnswers, answer];
    setSelectedAnswers(newAnswers);

    if (currentQuestion + 1 >= friendQuestions.length) {
      if (!auraSession) {
        setReviewError("Não foi possível identificar a aura avaliada.");
        setStep("done");
        return;
      }

      const calculatedPerception = calculateFriendPerception(newAnswers);

      setIsSavingReview(true);
      setReviewError("");

      const { error } = await supabase.from("friend_reviews").insert({
        aura_session_id: auraSession.id,
        friend_nickname: friendNickname.trim(),
        answers: newAnswers.map((item) => item.label),
        perception_title: calculatedPerception.summary.title,
        perception_text: calculatedPerception.summary.text,
        perception_scores: calculatedPerception.scores,
      });

      setIsSavingReview(false);

      if (error) {
        console.error(error);
        setReviewError(
          "Sua resposta foi gerada, mas ainda não conseguimos salvar no banco."
        );
      }

      setStep("done");
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
  }

  function restart() {
    setStep("intro");
    setFriendNickname("");
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setReviewError("");
    setIsSavingReview(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090A14] text-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-90px] top-[-90px] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-120px] top-32 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Aura Social
            </p>
            <h1 className="mt-1 text-lg font-black tracking-tight text-white">
              Avaliação de amigo
            </h1>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
            link
          </div>
        </header>

        {isLoadingSession && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                buscando aura
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Carregando link...
              </h2>
              <p className="mt-4 text-slate-300">
                Procurando a carta de aura antes de liberar sua avaliação.
              </p>
            </div>
          </div>
        )}

        {!isLoadingSession && sessionError && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full rounded-[2rem] border border-red-300/20 bg-red-500/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-200">
                link não encontrado
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Essa aura não apareceu por aqui.
              </h2>
              <p className="mt-4 leading-7 text-red-100">{sessionError}</p>
            </div>
          </div>
        )}

        {!isLoadingSession && !sessionError && auraSession && (
          <>
            {step === "intro" && (
              <div className="flex flex-1 items-center justify-center py-12">
                <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                    você foi chamado
                  </p>

                  <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                    {auraSession.nickname} quer saber como você percebe a aura
                    dele.
                  </h2>

                  <div className="mt-6 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
                    <p className="text-sm text-fuchsia-200">
                      Aura revelada
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">
                      {auraSession.aura_name}
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      “{auraSession.aura_phrase}”
                    </p>
                    <p className="mt-3 text-sm text-slate-300">
                      Pontuação: {auraSession.score}
                    </p>
                  </div>

                  <p className="mt-5 text-base leading-7 text-slate-300">
                    Responda 5 perguntas rápidas sobre a presença dessa pessoa.
                    Sua resposta ajuda a mostrar o contraste entre como ela se vê
                    e como os amigos percebem. Sim, finalmente a internet sendo
                    usada para algo além de brigar com desconhecidos.
                  </p>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                      código da aura
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-200">
                      {auraSession.share_slug}
                    </p>
                  </div>

                  <button
                    onClick={() => setStep("profile")}
                    className="mt-7 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-4 text-base font-black text-white shadow-[0_0_40px_rgba(236,72,153,0.25)] transition hover:scale-[1.01]"
                  >
                    Responder agora
                  </button>
                </div>
              </div>
            )}

            {step === "profile" && (
              <div className="flex flex-1 items-center justify-center py-12">
                <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                    antes de responder
                  </p>

                  <h2 className="mt-4 text-4xl font-black tracking-tight">
                    Como você quer aparecer?
                  </h2>

                  <p className="mt-4 leading-7 text-slate-300">
                    Coloque seu apelido. Ele será salvo junto com sua resposta
                    para mostrar que mais um amigo avaliou essa aura.
                  </p>

                  <label className="mt-8 block text-sm font-bold text-slate-200">
                    Seu apelido
                  </label>

                  <input
                    value={friendNickname}
                    onChange={(event) => setFriendNickname(event.target.value)}
                    placeholder="Ex: Gabi, Lipe, Ana..."
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-lg font-bold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
                  />

                  <button
                    onClick={startReview}
                    disabled={!friendNickname.trim()}
                    className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-base font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Começar avaliação
                  </button>

                  <button
                    onClick={() => setStep("intro")}
                    className="mt-4 w-full rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}

            {step === "quiz" && (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="w-full">
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>
                        Pergunta {currentQuestion + 1} de{" "}
                        {friendQuestions.length}
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
                      {friendNickname} avaliando {auraSession.nickname}
                    </p>

                    <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                      {friendQuestions[currentQuestion].question}
                    </h2>

                    <div className="mt-8 grid gap-3">
                      {friendQuestions[currentQuestion].answers.map(
                        (answer) => (
                          <button
                            key={answer.label}
                            onClick={() => selectAnswer(answer)}
                            disabled={isSavingReview}
                            className="rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-left text-base font-bold text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {answer.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "done" && perception && (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                    resposta registrada
                  </p>

                  <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                    {perception.summary.title}
                  </h2>

                  <p className="mt-5 text-base leading-7 text-slate-300">
                    {perception.summary.text}
                  </p>

                  {isSavingReview && (
                    <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="font-bold text-cyan-100">
                        Salvando sua avaliação...
                      </p>
                    </div>
                  )}

                  {reviewError && (
                    <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
                      <p className="font-bold text-red-100">{reviewError}</p>
                    </div>
                  )}

                  {!isSavingReview && !reviewError && (
                    <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                      <p className="font-bold text-emerald-100">
                        Sua avaliação foi salva com sucesso.
                      </p>
                    </div>
                  )}

<div className="mt-6 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
  <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-200">
    como você percebe {auraSession.nickname}
  </p>
  <p className="mt-3 text-lg font-black text-white">
    Sua resposta entrou no comparativo da aura. Agora dá para ver como essa
    pessoa se enxerga e como os amigos estão percebendo a presença dela.
  </p>
</div> 

                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                      código avaliado
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-200">
                      {auraSession.share_slug}
                    </p>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
  <a
    href={`/resultado/${auraSession.share_slug}`}
    className="rounded-2xl bg-white px-6 py-4 text-center text-base font-black text-slate-950 transition hover:scale-[1.01]"
  >
    Ver comparativo
  </a>

  <a
    href="/"
    className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center text-base font-black text-white transition hover:bg-white/15"
  >
    Fazer minha aura
  </a>
</div>

<button
  onClick={restart}
  className="mt-3 w-full rounded-2xl border border-white/10 px-6 py-4 text-base font-bold text-slate-300 transition hover:bg-white/5"
>
  Responder de novo
</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}