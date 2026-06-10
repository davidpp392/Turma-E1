export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Materia {
  id: string;
  nome: string;
  created_at: string;
}

export interface ArquivoAnexo {
  nome: string;
  url?: string;
  path?: string;
  tipo: string;
  tamanho: number;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  materia_id: string;
  data_entrega: string;
  autor_id: string;
  arquivos: ArquivoAnexo[];
  visibilidade: 'turma' | 'individual';
  destinatario_id: string | null;
  created_at: string;
  updated_at: string;
  materias?: Materia;
  profiles?: Profile;
}

export interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  materia_id: string | null;
  autor_id: string;
  arquivos: ArquivoAnexo[];
  visibilidade: 'turma' | 'individual';
  destinatario_id: string | null;
  created_at: string;
  materias?: Materia;
  profiles?: Profile;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  tipo: 'nova_atividade' | 'nova_anotacao_individual';
  titulo: string;
  mensagem: string;
  referencia_id: string | null;
  lida: boolean;
  created_at: string;
}

export interface ArquivoPessoal {
  id: string;
  usuario_id: string;
  titulo: string;
  conteudo: string;
  arquivos: ArquivoAnexo[];
  created_at: string;
  updated_at: string;
}

export interface MateriaFavorita {
  usuario_id: string;
  materia_id: string;
  created_at: string;
  materias?: Materia;
}

export interface ProfileStats {
  atividadesCount: number;
  anotacoesCount: number;
  favoritosCount: number;
}
