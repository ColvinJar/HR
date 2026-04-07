import { buildServer } from '../../../server/app.js';
import type { ChatMessage } from '../../types/index.js';

describe('Stavanger answer engine', () => {
  it('answers concretely about summer holiday rights from retrieved sources', async () => {
    const app = await buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/assistant/ask',
      payload: {
        question: 'Hvor mange uker kan en ansatt kreve om sommeren i Stavanger kommune?',
        sector: 'helse-velferd',
        role: 'leder'
      }
    });
    const message = response.json().message as ChatMessage;

    expect(message.sections?.find((section) => section.title === 'Kort svar')?.content).toMatch(/3 uker/i);
    expect(message.sections?.find((section) => section.title === 'Hva som gjelder')?.content).toMatch(
      /18 virkedager/i
    );
    expect(message.sourceHighlights?.length).toBeGreaterThan(0);

    await app.close();
  });

  it('answers sykefravaer follow-up with NAV deadlines', async () => {
    const app = await buildServer();
    const response = await app.inject({
      method: 'POST',
      url: '/api/assistant/ask',
      payload: {
        question: 'Nar ma oppfolgingsplan ved sykefravaer vaere klar?',
        sector: 'helse-velferd',
        role: 'leder'
      }
    });
    const message = response.json().message as ChatMessage;

    expect(message.sections?.find((section) => section.title === 'Kort svar')?.content).toMatch(/4 uker/i);
    expect(message.sourceHighlights?.some((source) => source.owner === 'NAV')).toBe(true);

    await app.close();
  });
});
