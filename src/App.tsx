import { useEffect, useRef, useState } from 'react';
import {
    createHashRouter,
    Link,
    Outlet,
    RouterProvider,
    useLocation,
    type RouteObject,
} from 'react-router-dom';
import Header from './containers/Header';
import ProductListing from './containers/ProductListing';
import ProductDetails from './containers/ProductDetail';
import Cart from './features/cart/Cart';
import Checkout from './features/checkout/Checkout';
import OrderConfirmation from './features/checkout/OrderConfirmation';
import './App.css';

function Layout() {
    const { pathname } = useLocation();
    const main = useRef<HTMLElement>(null);
    const previousPath = useRef(pathname);
    useEffect(() => {
        if (previousPath.current !== pathname) {
            main.current?.focus();
            window.scrollTo(0, 0);
            previousPath.current = pathname;
        }
    }, [pathname]);
    return (
        <>
            <a
                className="skip-link"
                href="#main-content"
                onClick={(event) => {
                    event.preventDefault();
                    main.current?.focus();
                }}
            >
                Skip to content
            </a>
            <Header />
            <main
                ref={main}
                tabIndex={-1}
                id="main-content"
                className="site-width"
            >
                <Outlet />
            </main>
            <footer className="site-footer">
                <div className="site-width">
                    <span>My Shop</span>
                    <span>Demo store &middot; No real purchases</span>
                </div>
            </footer>
        </>
    );
}

function NotFound() {
    return (
        <>
            <title>Page not found | My Shop</title>
            <div className="empty-state">
                <p className="eyebrow">404</p>
                <h1>Page not found</h1>
                <p>The page you requested does not exist.</p>
                <Link className="button" to="/">
                    Back to products
                </Link>
            </div>
        </>
    );
}

function UnexpectedError() {
    return (
        <main className="site-width empty-state">
            <title>Something went wrong | My Shop</title>
            <h1>Something went wrong</h1>
            <p>Please reload the page and try again.</p>
            <a className="button" href={`${import.meta.env.BASE_URL}#/`}>
                Back to products
            </a>
        </main>
    );
}

export const routes: RouteObject[] = [
    {
        element: <Layout />,
        errorElement: <UnexpectedError />,
        children: [
            { path: '/', element: <ProductListing /> },
            { path: '/product/:productId', element: <ProductDetails /> },
            { path: '/cart', element: <Cart /> },
            { path: '/checkout', element: <Checkout /> },
            { path: '/order-confirmation', element: <OrderConfirmation /> },
            { path: '*', element: <NotFound /> },
        ],
    },
];

export default function App() {
    const [router] = useState(() => createHashRouter(routes));
    return <RouterProvider router={router} />;
}
