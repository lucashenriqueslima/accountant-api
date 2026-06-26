import type { TaxRegime } from '@/types';
import { taxRegimeLabels } from '@/features/boards/constants';

export const taxRegimeOptions: { value: TaxRegime; label: string }[] = [
  { value: 'SIMPLES_NACIONAL', label: taxRegimeLabels.SIMPLES_NACIONAL },
  { value: 'LUCRO_PRESUMIDO', label: taxRegimeLabels.LUCRO_PRESUMIDO },
  { value: 'LUCRO_REAL', label: taxRegimeLabels.LUCRO_REAL },
  { value: 'MEI', label: taxRegimeLabels.MEI },
];
