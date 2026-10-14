import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { products } from './fixtures';

export const server = setupServer(
    http.get('https://fakestoreapi.com/products', () =>
        HttpResponse.json(products),
    ),
    http.get('https://fakestoreapi.com/products/:id', ({ params }) =>
        HttpResponse.json(
            products.find((product) => product.id === Number(params.id)) ??
                null,
        ),
    ),
);
