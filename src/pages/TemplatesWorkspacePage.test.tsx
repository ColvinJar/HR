import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TemplatesWorkspacePage } from './TemplatesWorkspacePage';

describe('TemplatesWorkspacePage', () => {
  it('shows the selected template when a card is pressed', () => {
    render(
      <MemoryRouter>
        <TemplatesWorkspacePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /intervjuguide/i }));

    expect(screen.getAllByText(/intervjuguide/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/kompetansesp/i)).toBeInTheDocument();
    expect(screen.getByText(/lik behandling av kandidater/i)).toBeInTheDocument();
  });
});
