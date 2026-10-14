import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Product } from '../../types/product';

export interface CartItem {
    id: number;
    title: string;
    image: string;
    priceCents: number;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
}
export const MAX_QUANTITY = 99;

const cartSlice = createSlice({
    name: 'cart',
    initialState: { items: [] } as CartState,
    reducers: {
        addProduct(state, { payload: product }: PayloadAction<Product>) {
            const existing = state.items.find((item) => item.id === product.id);
            if (existing) {
                existing.quantity = Math.min(
                    MAX_QUANTITY,
                    existing.quantity + 1,
                );
            } else {
                state.items.push({
                    id: product.id,
                    title: product.title,
                    image: product.image,
                    priceCents: Math.round(product.price * 100),
                    quantity: 1,
                });
            }
        },
        setQuantity(
            state,
            { payload }: PayloadAction<{ id: number; quantity: number }>,
        ) {
            if (
                !Number.isInteger(payload.quantity) ||
                payload.quantity < 1 ||
                payload.quantity > MAX_QUANTITY
            )
                return;
            const item = state.items.find((line) => line.id === payload.id);
            if (item) item.quantity = payload.quantity;
        },
        removeProduct(state, { payload: id }: PayloadAction<number>) {
            state.items = state.items.filter((item) => item.id !== id);
        },
        clearCart(state) {
            state.items = [];
        },
    },
});

export const { addProduct, setQuantity, removeProduct, clearCart } =
    cartSlice.actions;
export const selectCartCount = (state: { cart: CartState }) =>
    state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
    state.cart.items.reduce(
        (total, item) => total + item.priceCents * item.quantity,
        0,
    );
export default cartSlice.reducer;
