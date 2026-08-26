import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

process.env.VITE_API_URL = 'http://localhost:5000/api';
process.env.MODE = 'test';
process.env.DEV = 'true';
process.env.PROD = 'false';

Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5000',
        MODE: 'test',
        DEV: true,
        PROD: false,
      },
    },
  },
});