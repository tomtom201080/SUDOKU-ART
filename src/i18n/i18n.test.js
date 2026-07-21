// src/i18n/i18n.test.js
import { describe, it, expect } from 'vitest';
import fr from './fr.js';
import en from './en.js';

describe('fr.js / en.js', () => {
  it('exposent exactement les mêmes clés', () => {
    const frKeys = Object.keys(fr).sort();
    const enKeys = Object.keys(en).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('n\'ont aucune valeur vide', () => {
    for (const [key, value] of Object.entries(fr)) {
      expect(value, `fr.${key} est vide`).not.toBe('');
    }
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en.${key} est vide`).not.toBe('');
    }
  });
});
