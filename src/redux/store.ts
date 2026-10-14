import { configureStore } from '@reduxjs/toolkit';
import { productsApi } from '../services/productsApi';
import cartReducer, { type CartState } from '../features/cart/cartSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import { loadCart, saveCart } from '../features/cart/cartStorage';

export function createAppStore(cart: CartState = loadCart()) {
    const store = configureStore({
        devTools: import.meta.env.DEV,
        reducer: {
            [productsApi.reducerPath]: productsApi.reducer,
            cart: cartReducer,
            checkout: checkoutReducer,
        },
        preloadedState: { cart },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(productsApi.middleware),
    });
    let previous = store.getState().cart;
    store.subscribe(() => {
        const next = store.getState().cart;
        if (next !== previous) {
            saveCart(next);
            previous = next;
        }
    });
    return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export default createAppStore();
