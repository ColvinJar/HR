import { generateAssistantMessage } from './answerEngine';

const contactPoints = {
  hr: 'hr@test.no',
  verneombud: 'verneombud@test.no',
  tillitsvalgt: 'tillitsvalgt@test.no',
  juridisk: 'juridisk@test.no'
};

describe('generateAssistantMessage', () => {
  it('marks high-risk cases for escalation', () => {
    const message = generateAssistantMessage(
      'Hvordan håndterer vi en konflikt og mulig trakassering i teamet?',
      'oppvekst-utdanning',
      'leder',
      contactPoints
    );

    expect(message.escalation?.level).toBe('critical');
    expect(message.escalation?.contacts).toContain('HR: hr@test.no');
    expect(message.sections?.find((section) => section.title === 'Kildegrunnlag')).toBeTruthy();
  });

  it('warns when the user shares likely sensitive information', () => {
    const message = generateAssistantMessage(
      'Jeg vil dele diagnose og fødselsnummer i denne saken',
      'helse-velferd',
      'ansatt',
      contactPoints
    );

    expect(message.detectedSensitive).toBe(true);
  });
});
