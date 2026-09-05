import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

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

// jsdom (bundled with jest-environment-jsdom) does not implement
// Blob.prototype.text() / File.prototype.text(), so polyfill it using
// FileReader, which jsdom does support.
// istanbul ignore next - Polyfill for jsdom environment
if (typeof File.prototype.text !== 'function') {
  // Using FileReader because jsdom doesn't support Blob.text() natively
  File.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

// istanbul ignore next - Polyfill for jsdom environment
if (typeof Blob.prototype.text !== 'function') {
  Blob.prototype.text = File.prototype.text;
}