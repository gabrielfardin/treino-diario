export const initialUserProfile = {
    goal: "Hipertrofia Limpa",
    startWeight: 65,
    targetWeight: 70,
    focus: "Zero Açúcar Adicionado"
  };
  
  export const workoutPlans = [
    {
      id: "A",
      name: "Treino A",
      subtitle: "Peito, Ombro, Tríceps e Abdômen Supra",
      exercises: [
        { id: "a0", name: "Aquecimento Geral", sets: 1, reps: "5-10 min", obs: "Esteira, Elíptico ou Corda (Leve)" },
        { id: "a1", name: "Supino Reto (Máq/Barra)", sets: 4, reps: "8-12", obs: "Controle a descida, exploda na subida" },
        { id: "a2", name: "Supino Inclinado (Halteres)", sets: 3, reps: "10-12", obs: "Banco 30º a 45º" },
        { id: "a3", name: "Voador (Peck Deck)", sets: 3, reps: "12-15", obs: "Cotovelo levemente dobrado" },
        { id: "a4", name: "Desenv. Ombros (Halteres)", sets: 3, reps: "10-12", obs: "Trave o abdômen" },
        { id: "a5", name: "Elevação Lateral", sets: 4, reps: "12-15", obs: "Sem gangorra, foque no ombro" },
        { id: "a6", name: "Tríceps Pulley (Corda)", sets: 4, reps: "12", obs: "Amplitude total" },
        { id: "a7", name: "Tríceps Testa ou Francês", sets: 3, reps: "12", obs: "Cuidado com o cotovelo" },
        { id: "a8", name: "Abdominal Supra", sets: 3, reps: "15-20", obs: "Chão ou Máquina (Enrole a coluna)" },
        { id: "a9", name: "Cardio (Esteira/Bike)", sets: 1, reps: "20 min", obs: "Intensidade Moderada" }
      ]
    },
    {
      id: "B",
      name: "Treino B",
      subtitle: "Costas, Bíceps, Trapézio e Ombro Posterior",
      exercises: [
        { id: "b0", name: "Aquecimento Geral", sets: 1, reps: "5-10 min", obs: "Esteira, Elíptico ou Corda (Leve)" },
        { id: "b1", name: "Puxada Frontal (Aberta)", sets: 4, reps: "8-12", obs: "Cotovelos em direção à costela" },
        { id: "b2", name: "Remada Baixa (Triângulo)", sets: 3, reps: "10-12", obs: "Traga no umbigo, estufe o peito" },
        { id: "b3", name: "Remada Curvada (ou Máq.)", sets: 3, reps: "12", obs: "Coluna reta sempre" },
        { id: "b4", name: "Voador Inverso", sets: 3, reps: "15", obs: "Foco no posterior de ombro" },
        { id: "b5", name: "Remada Alta (Aberta)", sets: 3, reps: "12-15", obs: "Mãos na largura dos ombros" },
        { id: "b6", name: "Rosca Direta (Barra/Halter)", sets: 4, reps: "10-12", obs: "Cotovelo colado no corpo" },
        { id: "b7", name: "Rosca Martelo", sets: 3, reps: "12", obs: "Pegada neutra" },
        { id: "b8", name: "Cardio (Esteira/Bike)", sets: 1, reps: "20 min", obs: "Intensidade Moderada" }
      ]
    },
    {
      id: "C",
      name: "Treino C",
      subtitle: "Pernas Completo e Abdômen Infra",
      exercises: [
        { id: "c0", name: "Aquecimento Geral", sets: 1, reps: "5-10 min", obs: "Esteira, Elíptico ou Corda (Leve)" },
        { id: "c1", name: "Agachamento Livre (ou Smith)", sets: 4, reps: "8-12", obs: "O Rei. Desça até a paralela" },
        { id: "c2", name: "Leg Press 45º", sets: 3, reps: "10-12", obs: "Não trave o joelho na volta" },
        { id: "c3", name: "Cadeira Extensora", sets: 3, reps: "15", obs: "Segure 1 seg no topo" },
        { id: "c4", name: "Mesa Flexora", sets: 4, reps: "12", obs: "Contraia bem o posterior" },
        { id: "c5", name: "Cadeira Flexora", sets: 3, reps: "12", obs: "Quadril preso no banco" },
        { id: "c6", name: "Panturrilha (Sentado/Pé)", sets: 5, reps: "15", obs: "Amplitude máxima" },
        { id: "c7", name: "Abdominal Infra (Elevação)", sets: 3, reps: "15", obs: "Elevação de Pernas (Chão/Banco)" },
        { id: "c8", name: "Prancha Abdominal", sets: 3, reps: "30-45s", obs: "Isometria (Trave o abdômen)" },
        { id: "c9", name: "Cardio (Esteira/Bike)", sets: 1, reps: "20 min", obs: "Intensidade Moderada" }
      ]
    }
  ];
  
  export const dietPlan = [
    {
      id: "breakfast",
      time: "06:00",
      name: "06:00 - Café da Manhã",
      options: [
        { id: "bk1", name: "Opção 1 (Salgada)", items: ["2 Pães Franceses (ou 4 fatias)", "3 Ovos Mexidos"], note: "Pão integral contém açúcar na massa" },
        { id: "bk2", name: "Opção 2 (Doce Quente)", items: ["Mingau Turbinado (4 col. Aveia, 200ml Leite, 1 Banana, Canela)"] },
        { id: "bk3", name: "Opção 3 (Rápida Fria)", items: ["1 Pote Iogurte Natural", "1 Banana", "4 col. Granola/Aveia"], note: "Cuidado com granolas com açúcar/mel" }
      ]
    },
    {
      id: "lunch",
      time: "12:00",
      name: "12:00 - Almoço",
      note: "Salada no prato dispensa sobremesa. Sem salada, fruta obrigatória.",
      options: [
        { id: "lu1", name: "Opção 1", items: ["Arroz", "Feijão", "150g Frango Grelhado"] },
        { id: "lu2", name: "Opção 2", items: ["Arroz", "Feijão", "150g Carne Boi/Moída"] },
        { id: "lu3", name: "Opção 3", items: ["Macarrão (Alho e Óleo/Sugo)", "150g Proteína Sólida"] }
      ]
    },
    {
      id: "snack",
      time: "16:00",
      isPreWorkout: true,
      name: "16:00 - Lanche da Tarde",
      hasScenarios: true,
      scenarios: [
         {
             id: "A",
             name: "Cenário A: Estou na UFES",
             options: [
                 { id: "snA1", name: "Opção 1 (Açaí)", items: ["300-500ml Açaí", "Leite em Pó", "Granola"], note: "Cuidado com Xarope de Guaraná" },
                 { id: "snA2", name: "Opção 2 (Marmita Doce)", items: ["Banana amassada", "4 col. Aveia", "1 col. Pasta Amendoim"] },
                 { id: "snA3", name: "Opção 3 (Prática)", items: ["1 Iogurte Natural", "2 Bananas"] }
             ]
         },
         {
             id: "B",
             name: "Cenário B: Estou em Casa",
             options: [
                 { id: "snB1", name: "Opção 1 (Misteira)", items: ["2 Fatias Pão", "Queijo Minas", "1 Copo Leite"] },
                 { id: "snB2", name: "Opção 2 (Vitamina)", items: ["200ml Leite", "1 Banana", "3 col. Aveia", "1 col. Pasta Amendoim"] },
                 { id: "snB3", name: "Opção 3 (Crepioca)", items: ["1 Ovo", "2 col. Tapioca", "Recheio Queijo Minas"] }
             ]
         }
      ]
    },
    {
      id: "dinner",
      time: "20:30",
      isPostWorkout: true,
      name: "20:30 - Jantar (Pós-Treino)",
      options: [
          { id: "dn1", name: "Opção 1", items: ["Igual ao Almoço"] },
          { id: "dn2", name: "Opção 2", items: ["300g Batata/Aipim", "150g Frango/Carne Moída"] },
          { id: "dn3", name: "Opção 3", items: ["Macarrão", "150g Proteína Sólida"] }
      ]
    },
    {
      id: "supper",
      time: "22:30",
      name: "22:30 - Ceia",
      options: [
          { id: "sp1", name: "Opção 1", items: ["1 Copo de Leite Integral"] },
          { id: "sp2", name: "Opção 2", items: ["1 Pote Iogurte Natural", "1/2 Fruta"] },
          { id: "sp3", name: "Opção 3", items: ["2 Ovos Cozidos"] }
      ]
    }
  ];

  // Reward System - Loot Box Prizes (organized by rarity)
  export const rewardDefinitions = {
    // Stackable Vouchers (accumulate in inventory)
    vouchers: [
      { id: 'vale-refri', name: 'Vale-Refri', icon: '🥤', description: 'Beber um refrigerante sem culpa', rarity: 'common' },
      { id: 'vale-fast-food', name: 'Vale-Fast Food', icon: '🍔', description: 'Comer um lanche fora da dieta', rarity: 'common' },
      { id: 'vale-falta-ufes', name: 'Vale-Falta UFES', icon: '🎓', description: 'Faltar uma aula sem peso na consciência', rarity: 'epic' }
    ],
    // One-time Rewards (events)
    rewards: [
      // COMMON (60% chance) - Liberdades simples
      { id: 'dormir-tarde', name: 'Dormir depois das 00h', icon: '🌙', description: 'Liberdade total de horário', rarity: 'rare' },
      { id: 'nova-serie', name: 'Começar uma série nova', icon: '📺', description: 'Iniciar um novo vício sem culpa', rarity: 'common' },
      { id: 'all-nighter', name: 'Ficar acordado a noite toda', icon: '🦉', description: 'O All-nighter épico liberado', rarity: 'epic' },
      
      // RARE (30% chance) - Grana moderada
      { id: 'lazer-grana', name: 'Investimento Lazer R$50-100', icon: '🎮', description: 'Grana para diversão pura', rarity: 'rare' },
      { id: 'assinatura', name: 'Assinatura Premium', icon: '✨', description: 'Um mês de serviço pago (Spotify, YT, etc)', rarity: 'rare' },
      
      // EPIC (10% chance) - Prêmios valiosos
      { id: 'saque-foco', name: 'Sacar R$100 Foco Radical', icon: '💰', description: 'Bônus financeiro pelo trabalho', rarity: 'epic' },
      { id: 'wishlist', name: 'Item da Wishlist', icon: '🛒', description: 'Comprar algo que estava em espera', rarity: 'epic' }
    ],
    // Rarity definitions (for styling and probabilities)
    rarities: {
      common: { name: 'Comum', color: '#9CA3AF', chance: 60 },
      rare: { name: 'Raro', color: '#3B82F6', chance: 30 },
      epic: { name: 'Épico', color: '#A855F7', chance: 10 }
    }
  };

  // Initial voucher inventory (all starting at 0)
  export const initialVoucherInventory = {
    'vale-refri': 0,
    'vale-falta-ufes': 0,
    'vale-fast-food': 0
  };

