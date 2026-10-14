import { afterEach, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createAppStore, type AppStore } from '../redux/store';
import { productsApi } from './productsApi';
import { server } from '../test/server';
import { products } from '../test/fixtures';

const stores: AppStore[] = [];
function makeStore() {
    const store = createAppStore({ items: [] });
    stores.push(store);
    return store;
}
afterEach(() => {
    stores.forEach((store) => store.dispatch(productsApi.util.resetApiState()));
    stores.length = 0;
});

test('loads typed products', async () => {
    const result = await makeStore().dispatch(
        productsApi.endpoints.getProducts.initiate(),
    );
    expect(result.data).toEqual(products);
});

test.each([
    null,
    {},
    [null],
    [{ ...products[0], price: '29.95' }],
    [products[0], products[0]],
])('rejects malformed catalog data: %j', async (data) => {
    server.use(
        http.get('https://fakestoreapi.com/products', () =>
            HttpResponse.json(data),
        ),
    );
    const result = await makeStore().dispatch(
        productsApi.endpoints.getProducts.initiate(),
    );
    expect(result.error).toMatchObject({ status: 'CUSTOM_ERROR' });
});

test.each([null, ''])('recognizes absent products: %j', async (data) => {
    server.use(
        http.get('https://fakestoreapi.com/products/99', () =>
            HttpResponse.json(data),
        ),
    );
    const result = await makeStore().dispatch(
        productsApi.endpoints.getProduct.initiate(99),
    );
    expect(result.data).toBeNull();
});

test('keeps HTTP failures distinct from missing products', async () => {
    server.use(
        http.get(
            'https://fakestoreapi.com/products/1',
            () => new HttpResponse(null, { status: 503 }),
        ),
    );
    const result = await makeStore().dispatch(
        productsApi.endpoints.getProduct.initiate(1),
    );
    expect(result.error).toMatchObject({ status: 503 });
});

test('rejects a detail response for a different product', async () => {
    server.use(
        http.get('https://fakestoreapi.com/products/1', () =>
            HttpResponse.json(products[1]),
        ),
    );
    const result = await makeStore().dispatch(
        productsApi.endpoints.getProduct.initiate(1),
    );
    expect(result.error).toMatchObject({ status: 'CUSTOM_ERROR' });
});
