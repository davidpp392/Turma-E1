import LoginForm from '@/components/auth/LoginForm';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSignIn = jest.fn();
const mockGetProfile = jest.fn();
const mockUpsertProfile = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('@/lib/firebase/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock('@/lib/supabase/db', () => ({
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
  upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue({ id: 'user-1', nome: 'Teste' });
  });

  it('renderiza campos de e-mail e senha', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe erros de validação para campos vazios', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('exibe erro para credenciais inválidas', async () => {
    mockSignIn.mockRejectedValue({ message: 'Invalid credential', code: 'auth/invalid-credential' });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'teste@email.com');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/e-mail ou senha incorretos/i);
    });
  });

  it('redireciona ao dashboard após login bem-sucedido', async () => {
    mockSignIn.mockResolvedValue({ uid: 'user-1', email: 'teste@email.com' });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'teste@email.com');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
