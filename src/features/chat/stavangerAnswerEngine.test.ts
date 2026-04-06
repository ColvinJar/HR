import { generateAssistantMessage } from './answerEngine';

describe('Stavanger answer engine', () => {
  it('answers concretely about summer holiday rights', () => {
    const message = generateAssistantMessage(
      'Hvor mange uker kan en ansatt kreve om sommeren i Stavanger kommune?',
      'helse-velferd',
      'leder'
    );

    expect(message.sections?.find((section) => section.title === 'Kort svar')?.content).toMatch(/3 uker/i);
    expect(message.sections?.find((section) => section.title === 'Hva som gjelder')?.content).toMatch(
      /18 virkedager/i
    );
  });
});
