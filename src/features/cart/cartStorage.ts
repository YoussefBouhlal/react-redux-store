import { isImageUrl } from '../../types/product';
import { type CartItem, type CartState, MAX_QUANTITY } from './cartSlice';

export const CART_STORAGE_KEY = 'my-shop-cart';

export function parseCart(value: unknown): CartState {
    const empty: CartState = { items: [] };
    if (!value || typeof value !== 'object') return empty;
    const stored = value as Record<string, unknown>;
    if (stored.version !== 1 || !Array.isArray(stored.items)) return empty;
    const items = new Map<number, CartItem>();
    for (const entry of stored.items) {
        if (!entry || typeof entry !== 'object') continue;
        const item = entry as Record<string, unknown>;
        if (
            typeof item.id !== 'number' ||
            !Number.isSafeInteger(item.id) ||
            item.id < 1 ||
            typeof item.title !== 'string' ||
            !item.title.trim() ||
            !isImageUrl(item.image) ||
            typeof item.priceCents !== 'number' ||
            !Number.isSafeInteger(item.priceCents) ||
            item.priceCents < 0 ||
            typeof item.quantity !== 'number' ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > MAX_QUANTITY
        )
            continue;
        const existing = items.get(item.id);
        if (existing)
            existing.quantity = Math.min(
                MAX_QUANTITY,
                existing.quantity + item.quantity,
            );
        else
            items.set(item.id, {
                id: item.id,
                title: item.title,
                image: item.image,
                priceCents: item.priceCents,
                quantity: item.quantity,
            });
    }
    return { items: [...items.values()] };
}

export function loadCart(): CartState {
    try {
        return parseCart(
            JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null'),
        );
    } catch {
        return { items: [] };
    }
}

export function saveCart(cart: CartState) {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({ version: 1, items: cart.items }),
        );
    } catch {
        return;
    }
}
