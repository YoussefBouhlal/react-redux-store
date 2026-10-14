import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test } from 'vitest';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { routes } from './App';
import { createAppStore } from './redux/store';
import { productsApi } from './services/productsApi';
import { server } from './test/server';
import { firstProduct, secondProduct } from './test/fixtures';
import { addProduct } from './features/cart/cartSlice';
import { CART_STORAGE_KEY } from './features/cart/cartStorage';

type Session = {
    store: ReturnType<typeof createAppStore>;
    router: ReturnType<typeof createMemoryRouter>;
    unmount: () => void;
};
const sessions: Session[] = [];
function openPage(path = '/', withCart = false) {
    const store = createAppStore({ items: [] });
    if (withCart) store.dispatch(addProduct(firstProduct));
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const view = render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>,
    );
    const session = { store, router, ...view };
    sessions.push(session);
    return session;
}
afterEach(() => {
    sessions.forEach(({ store, router, unmount }) => {
        unmount();
        router.dispose();
        store.dispatch(productsApi.util.resetApiState());
    });
    sessions.length = 0;
});

test('unknown URLs show a 404 and a working route back', async () => {
    const { router } = openPage('/not-a-page');
    expect(
        screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    await userEvent.click(
        screen.getByRole('link', { name: 'Back to products' }),
    );
    expect(
        await screen.findByRole('link', {
            name: new RegExp(firstProduct.title),
        }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
});
test('the catalog announces loading, renders images and sets its title', async () => {
    openPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
    expect(
        await screen.findByRole('link', {
            name: new RegExp(firstProduct.title),
        }),
    ).toHaveAttribute('href', '/product/1');
    expect(document.title).toBe('Products | My Shop');
});
test('catalog failure supports retry', async () => {
    server.use(
        http.get(
            'https://fakestoreapi.com/products',
            () => new HttpResponse(null, { status: 503 }),
        ),
    );
    openPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Unable to load products',
    );
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
        await screen.findByRole('link', {
            name: new RegExp(firstProduct.title),
        }),
    ).toBeInTheDocument();
});
test('empty catalogs have an explicit state', async () => {
    server.use(
        http.get('https://fakestoreapi.com/products', () =>
            HttpResponse.json([]),
        ),
    );
    openPage();
    expect(
        await screen.findByText('No products available.'),
    ).toBeInTheDocument();
});
test('search, category and sort round-trip through URLs', async () => {
    const { router } = openPage('/?q=shirt&category=Clothing&sort=price-asc');
    expect(
        await screen.findByRole('link', {
            name: new RegExp(secondProduct.title),
        }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: new RegExp(firstProduct.title) }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search products')).toHaveValue('shirt');
    await userEvent.click(
        screen.getByRole('button', { name: 'Clear filters' }),
    );
    expect(router.state.location.search).toBe('');
    fireEvent.change(screen.getByLabelText('Sort by'), {
        target: { value: 'price-asc' },
    });
    expect(
        screen.getAllByRole('link', {
            name: /Canvas backpack|Cotton shirt/,
        })[0],
    ).toHaveAttribute('href', '/product/2');
    expect(router.state.location.search).toContain('sort=price-asc');
});
test('unknown filter options and no-match searches are recoverable', async () => {
    openPage('/?category=unknown&sort=unknown&q=does-not-exist');
    expect(
        await screen.findByRole('heading', { name: 'No matching products' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(screen.getByLabelText('Sort by')).toHaveValue('featured');
    await userEvent.click(
        screen.getAllByRole('button', { name: 'Clear filters' })[0],
    );
    expect(
        await screen.findByRole('link', {
            name: new RegExp(firstProduct.title),
        }),
    ).toBeInTheDocument();
});
test.each(['0', '-1', 'abc', '1.5', '9007199254740992'])(
    'invalid product ID %s is not queried',
    (id) => {
        const { store } = openPage(`/product/${id}`);
        expect(
            screen.getByRole('heading', { name: 'Product not found' }),
        ).toBeInTheDocument();
        expect(Object.keys(store.getState().productsApi.queries)).toHaveLength(
            0,
        );
    },
);
test('HTTP 404 details show recovery navigation', async () => {
    server.use(
        http.get(
            'https://fakestoreapi.com/products/99',
            () => new HttpResponse(null, { status: 404 }),
        ),
    );
    openPage('/product/99');
    expect(
        await screen.findByRole('heading', { name: 'Product not found' }),
    ).toBeInTheDocument();
});
test('detail failures are retryable', async () => {
    server.use(
        http.get('https://fakestoreapi.com/products/1', () =>
            HttpResponse.error(),
        ),
    );
    openPage('/product/1');
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Unable to load this product',
    );
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
        await screen.findByRole('heading', { name: firstProduct.title }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('img', { name: firstProduct.title }),
    ).toHaveAttribute('alt', firstProduct.title);
});
test('same-component navigation hides previous product details', async () => {
    const { router } = openPage('/product/1');
    await screen.findByRole('heading', { name: firstProduct.title });
    await act(async () => {
        await router.navigate('/product/2');
    });
    expect(
        screen.queryByRole('heading', { name: firstProduct.title }),
    ).not.toBeInTheDocument();
    expect(
        await screen.findByRole('heading', { name: secondProduct.title }),
    ).toBeInTheDocument();
});
test('late responses cannot overwrite the current product', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    let started: () => void = () => {};
    const requested = new Promise<void>((resolve) => {
        started = resolve;
    });
    server.use(
        http.get('https://fakestoreapi.com/products/1', async () => {
            started();
            await gate;
            return HttpResponse.json(firstProduct);
        }),
    );
    const { router, store } = openPage('/product/1');
    await requested;
    await act(async () => {
        await router.navigate('/product/2');
    });
    await screen.findByRole('heading', { name: secondProduct.title });
    await act(async () => {
        release();
    });
    await waitFor(() =>
        expect(
            productsApi.endpoints.getProduct.select(1)(store.getState())
                .isSuccess,
        ).toBe(true),
    );
    expect(
        screen.getByRole('heading', { name: secondProduct.title }),
    ).toBeInTheDocument();
});
test('cart addition, quantity, persistence and removal work together', async () => {
    const { store } = openPage('/product/1');
    await screen.findByRole('heading', { name: firstProduct.title });
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(screen.getByRole('status')).toHaveTextContent('Added to cart');
    await userEvent.click(screen.getByRole('link', { name: 'View cart' }));
    await userEvent.click(
        screen.getByRole('button', {
            name: `Increase quantity for ${firstProduct.title}`,
        }),
    );
    expect(store.getState().cart.items[0].quantity).toBe(2);
    expect(screen.getAllByText('$59.90').length).toBeGreaterThan(0);
    expect(
        JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).items[0].quantity,
    ).toBe(2);
    await userEvent.click(
        screen.getByRole('button', { name: `Remove ${firstProduct.title}` }),
    );
    expect(
        screen.getByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument();
});
test('checkout validates fields and never stores personal information', async () => {
    const { store } = openPage('/checkout', true);
    await userEvent.click(
        screen.getByRole('button', { name: 'Place demo order' }),
    );
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(screen.getByLabelText('Email address')).toHaveAttribute(
        'aria-invalid',
        'true',
    );
    await userEvent.type(
        screen.getByLabelText('Full name'),
        'Portfolio Reviewer',
    );
    await userEvent.type(
        screen.getByLabelText('Email address'),
        'reviewer@example.com',
    );
    await userEvent.type(
        screen.getByLabelText('Street address'),
        '123 Example Street',
    );
    await userEvent.type(screen.getByLabelText('City'), 'Example City');
    await userEvent.type(screen.getByLabelText('Postal code'), '10001');
    await userEvent.click(
        screen.getByRole('button', { name: 'Place demo order' }),
    );
    expect(
        await screen.findByRole('heading', { name: 'Demo order complete' }),
    ).toBeInTheDocument();
    expect(store.getState().cart.items).toHaveLength(0);
    expect(JSON.stringify(store.getState())).not.toContain(
        'reviewer@example.com',
    );
    expect(localStorage.getItem(CART_STORAGE_KEY)).not.toContain(
        'Example Street',
    );
});
test('empty checkout and direct confirmation URLs recover safely', async () => {
    const { router } = openPage('/checkout');
    expect(
        await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument();
    await act(async () => {
        await router.navigate('/order-confirmation');
    });
    expect(
        screen.getByRole('heading', { name: 'No demo order to display' }),
    ).toBeInTheDocument();
});
