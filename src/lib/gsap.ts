import gsap from 'gsap';

/** Animação de entrada para cards em lista */
export function animateCardsIn(selector: string) {
  gsap.fromTo(
    selector,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
  );
}

/** Animação de abertura de modal */
export function animateModalIn(overlay: HTMLElement, content: HTMLElement) {
  const tl = gsap.timeline();
  tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    .fromTo(
      content,
      { opacity: 0, scale: 0.95, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' },
      '-=0.1',
    );
  return tl;
}

/** Animação de fechamento de modal */
export function animateModalOut(overlay: HTMLElement, content: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(content, { opacity: 0, scale: 0.95, y: 10, duration: 0.2 })
    .to(overlay, { opacity: 0, duration: 0.15 }, '-=0.05');
  return tl;
}

/** Animação de notificação no painel */
export function animateNotificationIn(element: HTMLElement) {
  gsap.fromTo(
    element,
    { opacity: 0, x: 20 },
    { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' },
  );
}

/** Animação de badge de notificação */
export function pulseBadge(element: HTMLElement) {
  gsap.fromTo(
    element,
    { scale: 1 },
    { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' },
  );
}

/** Animação de entrada da sidebar em mobile */
export function animateSidebarIn(element: HTMLElement) {
  gsap.fromTo(element, { x: '-100%' }, { x: '0%', duration: 0.3, ease: 'power2.out' });
}
