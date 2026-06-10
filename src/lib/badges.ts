export interface Badge {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  unlocked: boolean;
}

export function computeBadges(stats: {
  atividadesCount: number;
  anotacoesCount: number;
  hasAvatar: boolean;
  hasBio: boolean;
  favoritosCount: number;
}): Badge[] {
  return [
    {
      id: 'estreante',
      titulo: 'Estreante',
      descricao: 'Criou conta na turma',
      emoji: '🎓',
      unlocked: true,
    },
    {
      id: 'colaborador',
      titulo: 'Colaborador',
      descricao: 'Criou a primeira atividade',
      emoji: '📝',
      unlocked: stats.atividadesCount >= 1,
    },
    {
      id: 'mestre',
      titulo: 'Mestre das entregas',
      descricao: 'Criou 10 atividades',
      emoji: '🏆',
      unlocked: stats.atividadesCount >= 10,
    },
    {
      id: 'compartilhador',
      titulo: 'Compartilhador',
      descricao: 'Enviou anotações para a turma',
      emoji: '📤',
      unlocked: stats.anotacoesCount >= 1,
    },
    {
      id: 'perfil-completo',
      titulo: 'Perfil completo',
      descricao: 'Foto e descrição preenchidas',
      emoji: '✨',
      unlocked: stats.hasAvatar && stats.hasBio,
    },
    {
      id: 'curioso',
      titulo: 'Curioso',
      descricao: 'Escolheu 3 matérias favoritas',
      emoji: '⭐',
      unlocked: stats.favoritosCount >= 3,
    },
  ];
}
