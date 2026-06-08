export type FriendTrait =
  | "paz"
  | "misterio"
  | "intensidade"
  | "confianca"
  | "criatividade"
  | "presenca"
  | "sensibilidade"
  | "lealdade"
  | "distancia"
  | "forca";

export type FriendAnswer = {
  label: string;
  traits: Partial<Record<FriendTrait, number>>;
};

export type FriendQuestion = {
  question: string;
  answers: FriendAnswer[];
};

export const friendQuestions: FriendQuestion[] = [
  {
    question: "Essa pessoa transmite mais:",
    answers: [
      {
        label: "Paz",
        traits: { paz: 3, confianca: 1 },
      },
      {
        label: "Mistério",
        traits: { misterio: 3, distancia: 1 },
      },
      {
        label: "Intensidade",
        traits: { intensidade: 3, presenca: 1 },
      },
      {
        label: "Confiança",
        traits: { confianca: 3, forca: 1 },
      },
      {
        label: "Criatividade",
        traits: { criatividade: 3, presenca: 1 },
      },
    ],
  },
  {
    question: "Quando ela fica mal, parece que ela:",
    answers: [
      {
        label: "Fala o que sente",
        traits: { confianca: 2, presenca: 1 },
      },
      {
        label: "Some um pouco",
        traits: { distancia: 3, misterio: 1 },
      },
      {
        label: "Faz piada",
        traits: { criatividade: 2, presenca: 1 },
      },
      {
        label: "Fica fria",
        traits: { distancia: 2, forca: 1 },
      },
      {
        label: "Finge que está tudo bem",
        traits: { misterio: 1, distancia: 2 },
      },
    ],
  },
  {
    question: "No grupo, essa pessoa costuma ser:",
    answers: [
      {
        label: "Quem anima",
        traits: { presenca: 3, criatividade: 1 },
      },
      {
        label: "Quem observa",
        traits: { misterio: 2, sensibilidade: 2 },
      },
      {
        label: "Quem aconselha",
        traits: { sensibilidade: 2, confianca: 2 },
      },
      {
        label: "Quem muda o clima",
        traits: { presenca: 2, intensidade: 2 },
      },
      {
        label: "Quem segura tudo",
        traits: { lealdade: 3, forca: 1 },
      },
    ],
  },
  {
    question: "O maior ponto forte dela é:",
    answers: [
      {
        label: "Lealdade",
        traits: { lealdade: 3, confianca: 1 },
      },
      {
        label: "Presença",
        traits: { presenca: 3, intensidade: 1 },
      },
      {
        label: "Sensibilidade",
        traits: { sensibilidade: 3, paz: 1 },
      },
      {
        label: "Coragem",
        traits: { forca: 3, intensidade: 1 },
      },
      {
        label: "Criatividade",
        traits: { criatividade: 3, misterio: 1 },
      },
    ],
  },
  {
    question: "Às vezes essa pessoa parece:",
    answers: [
      {
        label: "Difícil de acessar",
        traits: { distancia: 3, misterio: 2 },
      },
      {
        label: "Intensa demais",
        traits: { intensidade: 3, presenca: 1 },
      },
      {
        label: "Boa demais com os outros",
        traits: { lealdade: 2, sensibilidade: 2 },
      },
      {
        label: "Mais forte do que realmente está",
        traits: { forca: 2, distancia: 1, sensibilidade: 1 },
      },
      {
        label: "Diferente de todo mundo",
        traits: { criatividade: 3, misterio: 1 },
      },
    ],
  },
];

export const initialFriendScores: Record<FriendTrait, number> = {
  paz: 0,
  misterio: 0,
  intensidade: 0,
  confianca: 0,
  criatividade: 0,
  presenca: 0,
  sensibilidade: 0,
  lealdade: 0,
  distancia: 0,
  forca: 0,
};

export function calculateFriendPerception(selectedAnswers: FriendAnswer[]) {
  const scores = { ...initialFriendScores };

  selectedAnswers.forEach((answer) => {
    Object.entries(answer.traits).forEach(([trait, value]) => {
      scores[trait as FriendTrait] += value ?? 0;
    });
  });

  const sortedTraits = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const mainTrait = sortedTraits[0]?.[0] as FriendTrait;
  const secondTrait = sortedTraits[1]?.[0] as FriendTrait;

  return {
    scores,
    mainTrait,
    secondTrait,
    summary: getPerceptionSummary(mainTrait, secondTrait),
  };
}

function getPerceptionSummary(mainTrait: FriendTrait, secondTrait: FriendTrait) {
  if (mainTrait === "distancia" || secondTrait === "distancia") {
    return {
      title: "Presença difícil de alcançar",
      text: "Essa pessoa parece guardar bastante coisa por dentro. Para quem olha de fora, às vezes o silêncio dela pode parecer distância.",
    };
  }

  if (mainTrait === "presenca" || mainTrait === "intensidade") {
    return {
      title: "Presença que muda o ambiente",
      text: "Essa pessoa não passa despercebida. Mesmo quando não tenta aparecer, a energia dela costuma alterar o clima ao redor.",
    };
  }

  if (mainTrait === "sensibilidade" || mainTrait === "paz") {
    return {
      title: "Presença sensível e acolhedora",
      text: "Essa pessoa transmite uma energia que percebe detalhes, escuta e sente o ambiente de um jeito mais profundo.",
    };
  }

  if (mainTrait === "criatividade" || mainTrait === "misterio") {
    return {
      title: "Presença diferente e curiosa",
      text: "Essa pessoa transmite uma energia difícil de copiar. Tem algo nela que chama atenção sem precisar explicar demais.",
    };
  }

  if (mainTrait === "lealdade" || mainTrait === "confianca") {
    return {
      title: "Presença firme e confiável",
      text: "Essa pessoa transmite segurança. Parece alguém que segura as pontas e permanece quando muita gente iria embora.",
    };
  }

  return {
    title: "Presença marcante",
    text: "Essa pessoa transmite uma energia própria. Tem algo no jeito dela que fica na memória de quem convive.",
  };
}