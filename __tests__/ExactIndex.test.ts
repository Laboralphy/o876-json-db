// ExactIndex.test.ts
import { ExactIndex } from '../src/index-implementations/ExactIndex';

describe('ExactIndex', () => {
    let index: ExactIndex<string, number>;

    beforeEach(() => {
        index = new ExactIndex<string, number>();
    });

    test('ajoute une entrée et la retrouve', () => {
        index.add('pomme', 1);
        expect(index.get('pomme')).toEqual([1]);
    });

    test('ajoute plusieurs clés pour une même valeur', () => {
        index.add('pomme', 1);
        index.add('pomme', 2);
        expect(index.get('pomme')).toEqual([1, 2]);
    });

    test('retourne un tableau vide si la valeur est absente', () => {
        expect(index.get('banane')).toEqual([]);
    });

    test('supprime une clé spécifique pour une valeur', () => {
        index.add('pomme', 1);
        index.add('pomme', 2);
        index.remove('pomme', 1);
        expect(index.get('pomme')).toEqual([2]);
    });

    test('supprime toutes les clés pour une valeur', () => {
        index.add('pomme', 1);
        index.add('pomme', 2);
        index.remove('pomme');
        expect(index.get('pomme')).toEqual([]);
    });

    test("vérifie la présence d'une valeur", () => {
        index.add('pomme', 1);
        expect(index.has('pomme')).toBe(true);
        expect(index.has('banane')).toBe(false);
    });

    test('ne plante pas si on supprime une clé inexistante', () => {
        index.add('pomme', 1);
        index.remove('pomme', 999); // Clé inexistante
        expect(index.get('pomme')).toEqual([1]);
    });

    test('supprime une valeur absente sans erreur', () => {
        index.remove('banane');
        expect(index.get('banane')).toEqual([]);
    });

    test('ne duplique pas les clés primaires', () => {
        index.add('pomme', 1);
        index.add('pomme', 1);
        expect(index.get('pomme')).toEqual([1]);
    });
});
