import { FormEvent, useState } from 'react';

interface ChatComposerProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function ChatComposer({ onSubmit, disabled = false }: ChatComposerProps) {
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label htmlFor="chat-input" className="sr-only">
        Skriv HR-spørsmål
      </label>
      <textarea
        id="chat-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={4}
        disabled={disabled}
        placeholder="Skriv spørsmålet ditt på vanlig norsk. Unngå personopplysninger og sensitive detaljer."
      />
      <button type="submit" className="primary-button" disabled={disabled}>
        {disabled ? 'Vurderer...' : 'Send spørsmål'}
      </button>
    </form>
  );
}
