import { computeBadges } from '@/lib/badges';

describe('computeBadges', () => {
  it('desbloqueia estreante sempre', () => {
    const badges = computeBadges({
      atividadesCount: 0,
      anotacoesCount: 0,
      hasAvatar: false,
      hasBio: false,
      favoritosCount: 0,
    });
    expect(badges.find((b) => b.id === 'estreante')?.unlocked).toBe(true);
  });

  it('desbloqueia mestre com 10 atividades', () => {
    const badges = computeBadges({
      atividadesCount: 10,
      anotacoesCount: 0,
      hasAvatar: false,
      hasBio: false,
      favoritosCount: 0,
    });
    expect(badges.find((b) => b.id === 'mestre')?.unlocked).toBe(true);
  });
});
