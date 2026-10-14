import { describe, expect, test, vi } from 'vitest';
import reducer, {
    addProduct,
    clearCart,
    removeProduct,
    selectCartSubtotal,
    setQuantity,
} from './cartSlice';
import { CART_STORAGE_KEY, loadCart, parseCart, saveCart } from './cartStorage';
import { firstProduct } from '../../test/fixtures';

describe('cart', () => {
    test('merges duplicate additions and calculates money in integer cents', () => {
        let state = reducer(undefined, addProduct(firstProduct));
        state = reducer(state, addProduct(firstProduct));
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
        expect(selectCartSubtotal({ cart: state })).toBe(5990);
    });
    test('bounds quantities without inventing stock', () => {
        const state = reducer(undefined, addProduct(firstProduct));
        for (const quantity of [0, -1, 100, 1.5, NaN]) {
            expect(reducer(state, setQuantity({ id: 1, quantity }))).toEqual(
                state,
            );
        }
        const full = reducer(state, setQuantity({ id: 1, quantity: 99 }));
        expect(reducer(full, addProduct(firstProduct)).items[0].quantity).toBe(
            99,
        );
    });
    test('removes lines and clears the cart', () => {
        const state = reducer(undefined, addProduct(firstProduct));
        expect(reducer(state, removeProduct(1)).items).toEqual([]);
        expect(reducer(state, clearCart()).items).toEqual([]);
    });
    test('persists only versioned cart data and restores it', () => {
        const state = reducer(undefined, addProduct(firstProduct));
        saveCart(state);
        expect(loadCart()).toEqual(state);
        expect(
            Object.keys(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)),
        ).toEqual(['version', 'items']);
    });
    test('recovers from corrupt or unsupported storage', () => {
        localStorage.setItem(CART_STORAGE_KEY, '{broken');
        expect(loadCart()).toEqual({ items: [] });
        expect(parseCart({ version: 2, items: [] })).toEqual({ items: [] });
    });
    test('filters invalid persisted lines and caps merged duplicates', () => {
        const line = {
            id: 1,
            title: 'Bag',
            image: firstProduct.image,
            priceCents: 2995,
            quantity: 60,
        };
        const result = parseCart({
            version: 1,
            items: [null, {}, line, line, { ...line, id: 2, quantity: -1 }],
        });
        expect(result.items).toEqual([{ ...line, quantity: 99 }]);
    });
    test('unavailable storage does not crash the app', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Blocked');
        });
        expect(loadCart()).toEqual({ items: [] });
        expect(() => saveCart({ items: [] })).not.toThrow();
    });
});
