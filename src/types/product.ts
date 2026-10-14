export interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    category: string;
    description: string;
}

export function isImageUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    try {
        return ['https:', 'http:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

export function isProduct(value: unknown): value is Product {
    if (!value || typeof value !== 'object') return false;
    const product = value as Record<string, unknown>;
    return (
        typeof product.id === 'number' &&
        Number.isSafeInteger(product.id) &&
        product.id > 0 &&
        typeof product.title === 'string' &&
        Boolean(product.title.trim()) &&
        typeof product.price === 'number' &&
        product.price >= 0 &&
        Number.isSafeInteger(Math.round(product.price * 100)) &&
        isImageUrl(product.image) &&
        typeof product.category === 'string' &&
        Boolean(product.category.trim()) &&
        typeof product.description === 'string'
    );
}

export const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
