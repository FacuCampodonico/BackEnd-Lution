import { SetMetadata } from '@nestjs/common';

export type NivelAcceso = 'admin' | 'mozo';

export const NIVELES_KEY = 'niveles';

export const Niveles = (...niveles: NivelAcceso[]) =>
  SetMetadata(NIVELES_KEY, niveles);
