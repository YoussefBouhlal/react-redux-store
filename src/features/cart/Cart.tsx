import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    MAX_QUANTITY,
    removeProduct,
    selectCartSubtotal,
    setQuantity,
} from './cartSlice';
import { formatMoney } from '../../types/product';
import ProductImage from '../../components/ProductImage';

export default function Cart() {
    const items = useAppSelector((state) => state.cart.items);
    const subtotal = useAppSelector(selectCartSubtotal);
    const dispatch = useAppDispatch();
    return (
        <>
            <title>Cart | My Shop</title>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Your selection</p>
                    <h1>
                        Shopping cart<span className="accent">.</span>
                    </h1>
                </div>
            </div>
            {items.length === 0 ? (
                <div className="empty-state">
                    <ShoppingBag size={36} aria-hidden="true" />
                    <h2>Your cart is empty</h2>
                    <Link className="button primary" to="/">
                        Browse products
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <div className="checkout-layout">
                    <ul className="cart-items">
                        {items.map((item) => (
                            <li className="cart-item" key={item.id}>
                                <Link
                                    className="cart-image"
                                    to={`/product/${item.id}`}
                                    aria-label={`View ${item.title}`}
                                >
                                    <ProductImage {...item} />
                                </Link>
                                <div className="cart-item-copy">
                                    <Link to={`/product/${item.id}`}>
                                        <h2>{item.title}</h2>
                                    </Link>
                                    <p>{formatMoney(item.priceCents)} each</p>
                                    <div
                                        className="quantity-control"
                                        role="group"
                                        aria-label={`Quantity for ${item.title}`}
                                    >
                                        <button
                                            type="button"
                                            title="Decrease quantity"
                                            aria-label={`Decrease quantity for ${item.title}`}
                                            disabled={item.quantity <= 1}
                                            onClick={() =>
                                                dispatch(
                                                    setQuantity({
                                                        id: item.id,
                                                        quantity:
                                                            item.quantity - 1,
                                                    }),
                                                )
                                            }
                                        >
                                            <Minus
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={MAX_QUANTITY}
                                            step="1"
                                            value={item.quantity}
                                            aria-label={`Quantity for ${item.title}`}
                                            onChange={(event) =>
                                                dispatch(
                                                    setQuantity({
                                                        id: item.id,
                                                        quantity: Number(
                                                            event.target.value,
                                                        ),
                                                    }),
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            title="Increase quantity"
                                            aria-label={`Increase quantity for ${item.title}`}
                                            disabled={
                                                item.quantity >= MAX_QUANTITY
                                            }
                                            onClick={() =>
                                                dispatch(
                                                    setQuantity({
                                                        id: item.id,
                                                        quantity:
                                                            item.quantity + 1,
                                                    }),
                                                )
                                            }
                                        >
                                            <Plus
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-total">
                                    <strong>
                                        {formatMoney(
                                            item.priceCents * item.quantity,
                                        )}
                                    </strong>
                                    <button
                                        className="icon-button"
                                        type="button"
                                        title={`Remove ${item.title}`}
                                        aria-label={`Remove ${item.title}`}
                                        onClick={() =>
                                            dispatch(removeProduct(item.id))
                                        }
                                    >
                                        <Trash2 size={18} aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <aside
                        className="order-summary"
                        aria-labelledby="summary-heading"
                    >
                        <h2 id="summary-heading">Order summary</h2>
                        <dl>
                            <div>
                                <dt>Item subtotal</dt>
                                <dd>{formatMoney(subtotal)}</dd>
                            </div>
                        </dl>
                        <p className="muted">
                            Shipping and taxes are not calculated.
                        </p>
                        <Link className="button primary" to="/checkout">
                            Checkout
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link className="back-link" to="/">
                            Continue shopping
                        </Link>
                    </aside>
                </div>
            )}
        </>
    );
}
