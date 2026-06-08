export type Trait =
  | "presenca"
  | "misterio"
  | "intensidade"
  | "comunicacao"
  | "lealdade"
  | "coragem"
  | "sensibilidade"
  | "autoprotecao"
  | "influencia"
  | "criatividade";

export type Answer = {
  label: string;
  traits: Partial<Record<Trait, number>>;
};

export type Question = {
  question: string;
  answers: Answer[];
};

export type AuraType = {
    id: string;
    name: string;
    short: string;
    description: string;
    strength: string;
    shadow: string;
    gain: string;
    lose: string;
    mission: string;
    phrase: string;
    mainTraits: Trait[];
    gradient: string;
    symbol: string;
    visualTitle: string;
    collectionNumber: string;
    rarity: "comum" | "rara" | "épica";
  };

export const questions: Question[] = [
  {
    question: "Quando você fica mal, você costuma:",
    answers: [
      {
        label: "Falar logo o que está sentindo",
        traits: { comunicacao: 3, coragem: 2, presenca: 1 },
      },
      {
        label: "Sumir um pouco até organizar a cabeça",
        traits: { misterio: 2, autoprotecao: 3, sensibilidade: 1 },
      },
      {
        label: "Fazer piada para disfarçar",
        traits: { criatividade: 2, influencia: 1, autoprotecao: 2 },
      },
      {
        label: "Fingir que está tudo normal",
        traits: { autoprotecao: 3, sensibilidade: 1, misterio: 1 },
      },
      {
        label: "Ficar mais frio e esperar passar",
        traits: { autoprotecao: 3, misterio: 2, presenca: 1 },
      },
    ],
  },
  {
    question: "No grupo de amigos, você geralmente é:",
    answers: [
      {
        label: "Quem anima o ambiente",
        traits: { influencia: 3, presenca: 2, criatividade: 1 },
      },
      {
        label: "Quem observa tudo em silêncio",
        traits: { misterio: 3, sensibilidade: 2, autoprotecao: 1 },
      },
      {
        label: "Quem aconselha todo mundo",
        traits: { comunicacao: 2, lealdade: 3, sensibilidade: 1 },
      },
      {
        label: "Quem aparece do nada e muda o clima",
        traits: { presenca: 3, intensidade: 2, influencia: 1 },
      },
      {
        label: "Quem segura as pontas quando tudo vira bagunça",
        traits: { lealdade: 3, coragem: 2, presenca: 1 },
      },
    ],
  },
  {
    question: "Quando alguém te decepciona, você tende a:",
    answers: [
      {
        label: "Conversar e tentar resolver",
        traits: { comunicacao: 3, coragem: 2, lealdade: 1 },
      },
      {
        label: "Se afastar sem explicar muito",
        traits: { autoprotecao: 3, misterio: 2 },
      },
      {
        label: "Perdoar rápido, mesmo sentindo ainda",
        traits: { lealdade: 2, sensibilidade: 3 },
      },
      {
        label: "Guardar e lembrar depois",
        traits: { intensidade: 2, sensibilidade: 2, autoprotecao: 2 },
      },
      {
        label: "Agir normal, mas mudar por dentro",
        traits: { misterio: 2, autoprotecao: 3, sensibilidade: 1 },
      },
    ],
  },
  {
    question: "O que mais te dá presença?",
    answers: [
      {
        label: "Confiança",
        traits: { presenca: 3, coragem: 2 },
      },
      {
        label: "Mistério",
        traits: { misterio: 3, autoprotecao: 1 },
      },
      {
        label: "Humor",
        traits: { criatividade: 3, influencia: 2 },
      },
      {
        label: "Sensibilidade",
        traits: { sensibilidade: 3, lealdade: 1 },
      },
      {
        label: "Intensidade",
        traits: { intensidade: 3, presenca: 2 },
      },
    ],
  },
  {
    question: "Qual frase combina mais com você?",
    answers: [
      {
        label: "Eu falo mesmo.",
        traits: { comunicacao: 3, coragem: 2 },
      },
      {
        label: "Eu sinto mais do que mostro.",
        traits: { sensibilidade: 3, misterio: 2 },
      },
      {
        label: "Eu observo antes de agir.",
        traits: { misterio: 2, autoprotecao: 2, sensibilidade: 1 },
      },
      {
        label: "Eu mudo o clima sem perceber.",
        traits: { influencia: 3, presenca: 2 },
      },
      {
        label: "Eu me protejo antes de confiar.",
        traits: { autoprotecao: 3, misterio: 2 },
      },
    ],
  },
  {
    question: "Quando seus amigos precisam de você, você costuma:",
    answers: [
      {
        label: "Estar presente e ajudar",
        traits: { lealdade: 3, presenca: 2 },
      },
      {
        label: "Escutar com atenção",
        traits: { sensibilidade: 3, lealdade: 2 },
      },
      {
        label: "Dar conselho direto",
        traits: { comunicacao: 3, coragem: 1 },
      },
      {
        label: "Fazer a pessoa rir",
        traits: { criatividade: 3, influencia: 2 },
      },
      {
        label: "Tentar resolver o problema",
        traits: { coragem: 2, lealdade: 2, presenca: 1 },
      },
    ],
  },
  {
    question: "Seu maior risco social é:",
    answers: [
      {
        label: "Falar sem pensar",
        traits: { intensidade: 2, comunicacao: 2, coragem: 1 },
      },
      {
        label: "Guardar demais",
        traits: { autoprotecao: 3, misterio: 2, sensibilidade: 1 },
      },
      {
        label: "Sumir quando precisa conversar",
        traits: { autoprotecao: 3, misterio: 2 },
      },
      {
        label: "Querer agradar todo mundo",
        traits: { lealdade: 2, sensibilidade: 2, influencia: 1 },
      },
      {
        label: "Parecer frio sem querer",
        traits: { autoprotecao: 2, misterio: 2, presenca: 1 },
      },
    ],
  },
  {
    question: "Se sua presença fosse uma energia, ela seria:",
    answers: [
      {
        label: "Luz forte",
        traits: { presenca: 3, influencia: 2 },
      },
      {
        label: "Lua silenciosa",
        traits: { misterio: 3, sensibilidade: 2 },
      },
      {
        label: "Tempestade",
        traits: { intensidade: 3, coragem: 2 },
      },
      {
        label: "Ímã",
        traits: { influencia: 3, presenca: 2 },
      },
      {
        label: "Neon diferente",
        traits: { criatividade: 3, presenca: 1, misterio: 1 },
      },
    ],
  },
];

export const auraTypes: AuraType[] = [
  {
    id: "solar",
    name: "Aura Solar",
    short: "Você aquece o ambiente.",
    description:
      "Você tem uma energia que levanta o clima, aproxima pessoas e traz movimento para onde parecia parado.",
    strength: "Você transmite vida, ânimo e abertura.",
    shadow: "Pode tentar parecer bem mesmo quando está cansado por dentro.",
    gain: "Usa sua energia para aproximar pessoas sem carregar tudo sozinho.",
    lose: "Finge alegria só para ninguém perceber que também precisa de cuidado.",
    mission: "Animar alguém sem esconder o que você também está sentindo.",
    phrase: "Minha aura ilumina, mas também precisa descansar.",
    mainTraits: ["influencia", "presenca", "criatividade"],
    gradient: "from-yellow-300 via-pink-500 to-purple-600",
symbol: "☀️",
visualTitle: "Sol vivo",
collectionNumber: "001/012",
rarity: "comum",
  },
  {
    id: "lunar",
    name: "Aura Lunar",
    short: "Você observa o que ninguém fala.",
    description:
      "Você percebe climas, detalhes e sentimentos escondidos. Sua energia é silenciosa, sensível e profunda.",
    strength: "Você entende detalhes que muita gente ignora.",
    shadow: "Pode guardar demais e esperar que os outros adivinhem.",
    gain: "Transforma percepção em conversa sincera.",
    lose: "Some emocionalmente e chama isso de paz.",
    mission: "Dizer uma coisa verdadeira sem esperar que descubram sozinhos.",
    phrase: "Minha aura não grita. Ela observa.",
    mainTraits: ["misterio", "sensibilidade", "autoprotecao"],
    gradient: "from-sky-300 via-indigo-500 to-purple-700",
symbol: "🌙",
visualTitle: "Lua silenciosa",
collectionNumber: "002/012",
rarity: "comum",
  },
  {
    id: "tempestade",
    name: "Aura Tempestade",
    short: "Você chega com intensidade.",
    description:
      "Você sente com força e marca presença sem esforço. Sua energia é direta, intensa e difícil de ignorar.",
    strength: "Você movimenta, confronta e não deixa tudo parado.",
    shadow: "Pode assustar quando sua emoção fala antes da sua consciência.",
    gain: "Usa sua intensidade com direção.",
    lose: "Explode primeiro e entende depois.",
    mission: "Respirar antes de responder algo importante.",
    phrase: "Minha aura não passa despercebida.",
    mainTraits: ["intensidade", "coragem", "presenca"],
    gradient: "from-fuchsia-500 via-red-500 to-orange-400",
symbol: "⚡",
visualTitle: "Raio interno",
collectionNumber: "003/012",
rarity: "rara",
  },
  {
    id: "espelho",
    name: "Aura Espelho",
    short: "Você faz os outros se enxergarem.",
    description:
      "Sua presença desperta reflexão, conselho e verdade. Você costuma perceber o que está por trás das falas.",
    strength: "Você ajuda os outros a entenderem o que sentem.",
    shadow: "Pode cuidar muito dos outros e esquecer de olhar para si.",
    gain: "Aconselha sem carregar a vida de todo mundo.",
    lose: "Vira apoio de todos e abandona o próprio centro.",
    mission: "Perguntar a si mesmo o que você perguntaria a um amigo.",
    phrase: "Minha aura mostra o que muita gente tenta esconder.",
    mainTraits: ["comunicacao", "sensibilidade", "lealdade"],
    gradient: "from-cyan-300 via-blue-500 to-violet-700",
symbol: "🪞",
visualTitle: "Reflexo social",
collectionNumber: "004/012",
rarity: "rara",
  },
  {
    id: "invisivel",
    name: "Aura Invisível",
    short: "Você sente muito, mas aparece pouco.",
    description:
      "Sua energia é discreta, profunda e difícil de acessar. Você observa mais do que mostra.",
    strength: "Você percebe e guarda histórias que ninguém imagina.",
    shadow: "Pode se apagar para não incomodar.",
    gain: "Ocupa espaço sem pedir desculpa por existir.",
    lose: "Finge que não quer ser visto, mas sente falta de ser notado.",
    mission: "Fazer uma escolha sem se diminuir.",
    phrase: "Minha aura é silenciosa, mas não é vazia.",
    mainTraits: ["autoprotecao", "misterio", "sensibilidade"],
    gradient: "from-slate-400 via-purple-600 to-slate-950",
symbol: "👁️",
visualTitle: "Presença oculta",
collectionNumber: "005/012",
rarity: "comum",
  },
  {
    id: "ima",
    name: "Aura Ímã",
    short: "Você atrai conexão.",
    description:
      "Você chama pessoas naturalmente. Sua presença aproxima conversas e cria vínculo com facilidade.",
    strength: "Você tem carisma e facilidade para gerar conexão.",
    shadow: "Pode atrair muita gente e depois se sentir drenado.",
    gain: "Escolhe bem onde coloca sua energia.",
    lose: "Dá acesso demais para quem não cuida de você.",
    mission:
      "Separar quem gosta da sua presença de quem só consome sua energia.",
    phrase: "Minha aura atrai, mas nem todo mundo merece acesso.",
    mainTraits: ["influencia", "presenca", "lealdade"],
    gradient: "from-emerald-300 via-teal-500 to-blue-700",
symbol: "🧲",
visualTitle: "Campo magnético",
collectionNumber: "006/012",
rarity: "rara",
  },
  {
    id: "fenix",
    name: "Aura Fênix",
    short: "Você tem energia de recomeço.",
    description:
      "Você pode cair, mudar, se reconstruir e voltar diferente. Sua presença carrega história e virada.",
    strength: "Você transforma dor em aprendizado.",
    shadow: "Pode se acostumar tanto a recomeçar que esquece de descansar.",
    gain: "Reconhece sua evolução sem precisar provar para todos.",
    lose: "Aceita qualquer caos só porque sabe sobreviver a ele.",
    mission: "Valorizar uma mudança que você já conseguiu fazer.",
    phrase: "Minha aura já caiu, mas voltou mais forte.",
    mainTraits: ["coragem", "intensidade", "sensibilidade"],
    gradient: "from-orange-300 via-pink-500 to-purple-700",
symbol: "🔥",
visualTitle: "Fogo de retorno",
collectionNumber: "007/012",
rarity: "épica",
  },
  {
    id: "hacker-social",
    name: "Aura Hacker Social",
    short: "Você lê o ambiente rápido.",
    description:
      "Você percebe intenções, padrões, mudanças de clima e sinais pequenos antes da maioria das pessoas.",
    strength: "Você entende pessoas com rapidez.",
    shadow: "Pode desconfiar demais e transformar percepção em defesa.",
    gain: "Usa sua leitura para se posicionar melhor, não para se fechar.",
    lose: "Analisa tudo e não vive nada.",
    mission: "Confiar em uma atitude concreta, não só na sua suspeita.",
    phrase: "Minha aura lê o ambiente antes de entrar nele.",
    mainTraits: ["misterio", "comunicacao", "criatividade"],
    gradient: "from-lime-300 via-emerald-500 to-cyan-700",
symbol: "⌁",
visualTitle: "Código social",
collectionNumber: "008/012",
rarity: "épica",
  },
  {
    id: "diamante",
    name: "Aura Diamante",
    short: "Você parece difícil, mas tem profundidade.",
    description:
      "Você pode parecer difícil de acessar, mas tem firmeza, valor e presença. Sua energia é seletiva.",
    strength: "Você transmite força, estabilidade e presença.",
    shadow: "Pode parecer frio quando, na verdade, está se protegendo.",
    gain: "Mostra vulnerabilidade sem achar que perdeu valor.",
    lose: "Confunde controle com distância emocional.",
    mission: "Demonstrar cuidado de um jeito simples.",
    phrase: "Minha aura parece fria, mas tem profundidade.",
    mainTraits: ["autoprotecao", "presenca", "coragem"],
    gradient: "from-cyan-200 via-slate-300 to-blue-700",
symbol: "💎",
visualTitle: "Cristal raro",
collectionNumber: "009/012",
rarity: "rara",
  },
  {
    id: "cometa",
    name: "Aura Cometa",
    short: "Você passa e deixa rastro.",
    description:
      "Você chega, muda o clima e deixa marca. Sua energia é rápida, forte e memorável.",
    strength: "Você movimenta pessoas e situações.",
    shadow: "Pode aparecer com força e depois sumir sem explicação.",
    gain: "Mantém presença depois do impacto inicial.",
    lose: "Cria expectativa e desaparece.",
    mission: "Continuar algo que você começou.",
    phrase: "Minha aura passa rápido, mas deixa rastro.",
    mainTraits: ["presenca", "intensidade", "influencia"],
    gradient: "from-violet-400 via-fuchsia-500 to-rose-500",
symbol: "☄️",
visualTitle: "Rastro de luz",
collectionNumber: "010/012",
rarity: "rara",
  },
  {
    id: "jardim-secreto",
    name: "Aura Jardim Secreto",
    short: "Você tem muitas camadas.",
    description:
      "Você tem um mundo interno rico, mas deixa poucas pessoas entrarem. Sua energia é reservada e cheia de detalhes.",
    strength: "Você tem profundidade, imaginação e cuidado.",
    shadow:
      "Pode dificultar o acesso até para quem quer se aproximar com respeito.",
    gain: "Permite que alguém confiável conheça uma parte sua.",
    lose: "Tranca tudo e reclama que ninguém entende.",
    mission: "Compartilhar algo pequeno, mas verdadeiro.",
    phrase: "Minha aura tem portas. Poucos sabem entrar.",
    mainTraits: ["sensibilidade", "misterio", "criatividade"],
    gradient: "from-green-300 via-emerald-600 to-purple-800",
symbol: "🌿",
visualTitle: "Portal escondido",
collectionNumber: "011/012",
rarity: "comum",
  },
  {
    id: "neon",
    name: "Aura Neon",
    short: "Você não combina com modo básico.",
    description:
      "Você tem uma energia criativa, diferente e impossível de copiar. Sua presença chama atenção porque não tenta ser igual.",
    strength: "Você traz originalidade, humor e expressão.",
    shadow:
      "Pode se esconder atrás da performance e evitar mostrar o que sente de verdade.",
    gain: "Usa sua diferença com verdade, não só como personagem.",
    lose: "Tenta entreter todo mundo enquanto se abandona.",
    mission: "Ser verdadeiro sem transformar tudo em piada.",
    phrase: "Minha aura não combina com modo básico.",
    mainTraits: ["criatividade", "presenca", "influencia"],
    gradient: "from-pink-400 via-purple-500 to-cyan-400",
symbol: "✦",
visualTitle: "Brilho diferente",
collectionNumber: "012/012",
rarity: "épica",
  },
];

export const initialScores: Record<Trait, number> = {
  presenca: 0,
  misterio: 0,
  intensidade: 0,
  comunicacao: 0,
  lealdade: 0,
  coragem: 0,
  sensibilidade: 0,
  autoprotecao: 0,
  influencia: 0,
  criatividade: 0,
};

export function calculateAura(selectedAnswers: Answer[]): {
  aura: AuraType;
  score: number;
  scores: Record<Trait, number>;
} {
  const scores = { ...initialScores };

  selectedAnswers.forEach((answer) => {
    Object.entries(answer.traits).forEach(([trait, value]) => {
      scores[trait as Trait] += value ?? 0;
    });
  });

  let bestAura = auraTypes[0];
  let bestMatch = -1;

  auraTypes.forEach((aura) => {
    const match = aura.mainTraits.reduce((total, trait) => {
      return total + scores[trait];
    }, 0);

    if (match > bestMatch) {
      bestMatch = match;
      bestAura = aura;
    }
  });

  const rawTotal = Object.values(scores).reduce(
    (total, value) => total + value,
    0
  );

  const score = Math.min(990, 520 + rawTotal * 11 + bestMatch * 7);

  return { aura: bestAura, score, scores };
}

export function generateAuraSlug() {
    const randomPart = Math.random().toString(36).slice(2, 10);
    const timePart = Date.now().toString(36).slice(-4);
  
    return `aura-${randomPart}${timePart}`;
  }