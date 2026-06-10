'use client';

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
}

export default function FileUpload({ files, onChange, label = 'Anexar arquivos' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError('');
    const valid: File[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" excede 5 MB`);
        continue;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`Tipo não permitido: ${file.name}`);
        continue;
      }
      valid.push(file);
    }
    onChange([...files, ...valid]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full rounded-lg border-2 border-dashed border-border px-4 py-6',
          'text-sm text-text-muted hover:border-accent hover:text-accent transition-colors',
        )}
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-surface-overlay px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <span className="text-lg">📄</span>
                )}
                <span className="truncate text-text-primary">{file.name}</span>
                <span className="text-text-muted">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-danger hover:underline ml-2 shrink-0"
                aria-label={`Remover ${file.name}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
