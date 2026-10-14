import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import { selectCartCount } from '../features/cart/cartSlice';

export default function Header() {
    const count = useAppSelector(selectCartCount);
    return (
        <header className="site-header">
            <nav
                className="site-width header-inner"
                aria-label="Main navigation"
            >
                <Link className="brand" to="/">
                    <ShoppingBag aria-hidden="true" />
                    My Shop
                    <span className="brand-dot" />
                </Link>
                <div className="nav-links">
                    <NavLink to="/" end>
                        Products
                    </NavLink>
                    <NavLink
                        to="/cart"
                        className="cart-link"
                        aria-label={`Cart ${count} items`}
                    >
                        <ShoppingCart size={20} aria-hidden="true" />
                        <span>Cart</span>{' '}
                        <span className="cart-count">{count}</span>
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}
