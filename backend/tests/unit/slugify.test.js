import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/utils/slugify.js';

describe('Slugify Utility', () => {
  it('deve converter uma string básica para slug', () => {
    expect(slugify('Hollow Knight')).toBe('hollow-knight');
  });

  it('deve remover acentos e caracteres especiais', () => {
    expect(slugify('Ação & Aventura')).toBe('ao-aventura');
  });

  it('deve remover espaços extras nas bordas', () => {
    expect(slugify('  Meu Jogo  Legal  ')).toBe('meu-jogo-legal');
  });

  it('deve lidar com números', () => {
    expect(slugify('Game 2026')).toBe('game-2026');
  });

  it('deve substituir múltiplos hífens por um único', () => {
    expect(slugify('a--b---c')).toBe('a-b-c');
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(slugify('')).toBe('');
  });

  it('deve lidar com texto já em minúsculas', () => {
    expect(slugify('jogo indie')).toBe('jogo-indie');
  });

  it('deve remover pontuação', () => {
    expect(slugify('My Game: Subtitle!')).toBe('my-game-subtitle');
  });
});
