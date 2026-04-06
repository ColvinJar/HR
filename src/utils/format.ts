import type { SourceTier } from '../types';

export function formatSourceTier(tier: SourceTier) {
  switch (tier) {
    case 'lokal-rutine':
      return 'Lokal rutine';
    case 'tariff':
      return 'Tariff / avtale';
    case 'lovdata':
      return 'Lov og forskrift';
    case 'arbeidstilsynet':
      return 'Praktisk veiledning';
    case 'annen-offentlig':
      return 'Offentlig kilde';
    default:
      return tier;
  }
}
