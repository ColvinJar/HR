import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPage } from './AdminPage';

describe('AdminPage', () => {
  it('updates contact information', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        municipalityName: 'Eksempel kommune',
        sectors: [
          'helse-velferd',
          'oppvekst-utdanning',
          'bygg-byutvikling',
          'teknisk-drift',
          'sentraladministrasjon'
        ],
        localRoutineLinks: [],
        contactPoints: {
          hr: 'ny-hr@kommune.no',
          verneombud: 'verneombud@kommune.no',
          tillitsvalgt: 'tillitsvalgt@kommune.no',
          juridisk: 'juridisk@kommune.no'
        },
        sourcePriority: ['lokal-rutine', 'tariff', 'lovdata', 'arbeidstilsynet', 'annen-offentlig']
      })
    } as Response);

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    const input = screen.getByLabelText('HR-kontakt');
    fireEvent.change(input, { target: { value: 'ny-hr@kommune.no' } });

    expect(screen.getByDisplayValue('ny-hr@kommune.no')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    fetchMock.mockRestore();
  });
});
