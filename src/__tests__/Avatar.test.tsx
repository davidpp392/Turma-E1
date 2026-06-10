import Avatar from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import { render, screen } from '@testing-library/react';

describe('Avatar', () => {
  it('exibe iniciais quando não há foto', () => {
    render(<Avatar nome="João Silva" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('exibe iniciais de nome único', () => {
    render(<Avatar nome="Maria" />);
    expect(screen.getByText('MA')).toBeInTheDocument();
  });

  it('tem aria-label acessível com iniciais', () => {
    render(<Avatar nome="Ana Costa" />);
    expect(screen.getByRole('img', { name: /Iniciais de Ana Costa: AC/i })).toBeInTheDocument();
  });

  it('exibe imagem quando avatarUrl é fornecido', () => {
    render(<Avatar nome="Pedro" avatarUrl="https://example.com/avatar.jpg" />);
    expect(screen.getByAltText('Avatar de Pedro')).toBeInTheDocument();
  });
});

describe('getInitials', () => {
  it('retorna ? para nome vazio', () => {
    expect(getInitials('')).toBe('?');
  });

  it('retorna duas letras do primeiro e último nome', () => {
    expect(getInitials('Carlos Eduardo Lima')).toBe('CL');
  });
});
