/**
 * @fileoverview commonjs-interop.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 15:40
 */

import { createRequire } from 'module';

export const cjsRequire = createRequire(import.meta.url);
