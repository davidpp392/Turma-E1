'use client';

import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import { getProfile, searchProfiles } from '@/lib/supabase/db';
import type { Profile } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UserSearchProps {
  value: string | null;
  onChange: (userId: string | null, profile?: Profile) => void;
  excludeId?: string;
  error?: string;
}

export default function UserSearch({ value, onChange, excludeId, error }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      const data = await searchProfiles(q, excludeId);
      setResults(data);
    },
    [excludeId],
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (value && !selected) {
      getProfile(value).then((data) => {
        if (data) setSelected(data);
      });
    }
  }, [value, selected]);

  const handleSelect = (profile: Profile) => {
    setSelected(profile);
    onChange(profile.id, profile);
    setQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null);
    setQuery('');
  };

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-overlay p-3">
        <Avatar nome={selected.nome} avatarUrl={selected.avatar_url} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{selected.nome}</p>
          <p className="text-xs text-text-muted truncate">{selected.email}</p>
        </div>
        <button type="button" onClick={handleClear} className="text-sm text-danger hover:underline">
          Remover
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        label="Buscar aluno (nome ou e-mail)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        error={error}
        placeholder="Digite para buscar..."
        autoComplete="off"
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface-raised shadow-lg">
          {results.map((profile) => (
            <li key={profile.id}>
              <button
                type="button"
                onClick={() => handleSelect(profile)}
                className="flex w-full items-center gap-3 px-3 py-2 hover:bg-surface-overlay text-left"
              >
                <Avatar nome={profile.nome} avatarUrl={profile.avatar_url} size="sm" />
                <div>
                  <p className="text-sm text-text-primary">{profile.nome}</p>
                  <p className="text-xs text-text-muted">{profile.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
