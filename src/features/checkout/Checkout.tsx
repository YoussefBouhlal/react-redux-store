import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    clearCart,
    selectCartCount,
    selectCartSubtotal,
} from '../cart/cartSlice';
import { orderSimulated } from './checkoutSlice';
import { formatMoney } from '../../types/product';

const fields = [
    {
        name: 'name',
        label: 'Full name',
        autocomplete: 'name',
        type: 'text',
        max: 120,
    },
    {
        name: 'email',
        label: 'Email address',
        autocomplete: 'email',
        type: 'email',
        max: 254,
    },
    {
        name: 'address',
        label: 'Street address',
        autocomplete: 'street-address',
        type: 'text',
        max: 200,
    },
    {
        name: 'city',
        label: 'City',
        autocomplete: 'address-level2',
        type: 'text',
        max: 100,
    },
    {
        name: 'postalCode',
        label: 'Postal code',
        autocomplete: 'postal-code',
        type: 'text',
        max: 20,
    },
] as const;
type FieldName = (typeof fields)[number]['name'];

export default function Checkout() {
    const items = useAppSelector((state) => state.cart.items);
    const subtotalCents = useAppSelector(selectCartSubtotal);
    const itemCount = useAppSelector(selectCartCount);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>(
        {},
    );
    const submitting = useRef(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const nextErrors: Partial<Record<FieldName, string>> = {};
        for (const field of fields) {
            const value = String(data.get(field.name) ?? '').trim();
            if (!value || value.length > field.max)
                nextErrors[field.name] =
                    `Enter a valid ${field.label.toLowerCase()}.`;
        }
        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                String(data.get('email') ?? '').trim(),
            )
        )
            nextErrors.email = 'Enter a valid email address.';
        setErrors(nextErrors);
        const firstInvalid = fields.find((field) => nextErrors[field.name]);
        if (firstInvalid) {
            (
                form.elements.namedItem(firstInvalid.name) as HTMLInputElement
            ).focus();
            return;
        }
        submitting.current = true;
        dispatch(orderSimulated({ itemCount, subtotalCents }));
        dispatch(clearCart());
        navigate('/order-confirmation', { replace: true });
    }

    if (submitting.current)
        return <p role="status">Completing demo order...</p>;
    if (!items.length) return <Navigate to="/cart" replace />;
    return (
        <>
            <title>Checkout | My Shop</title>
            <Link className="back-link" to="/cart">
                <ArrowLeft size={18} aria-hidden="true" />
                Back to cart
            </Link>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Almost there</p>
                    <h1>
                        Checkout<span className="accent">.</span>
                    </h1>
                </div>
            </div>
            <p className="demo-notice">
                Simulated checkout. No payment is collected and no order is
                placed.
            </p>
            <div className="checkout-layout">
                <form noValidate onSubmit={submit}>
                    <fieldset>
                        <legend>Contact and delivery</legend>
                        <div className="form-grid">
                            {fields.map((field) => (
                                <div
                                    className={
                                        field.name === 'city' ||
                                        field.name === 'postalCode'
                                            ? ''
                                            : 'full-width'
                                    }
                                    key={field.name}
                                >
                                    <label htmlFor={field.name}>
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        autoComplete={field.autocomplete}
                                        maxLength={field.max}
                                        required
                                        aria-invalid={Boolean(
                                            errors[field.name],
                                        )}
                                        aria-describedby={
                                            errors[field.name]
                                                ? `${field.name}-error`
                                                : undefined
                                        }
                                    />
                                    {errors[field.name] && (
                                        <p
                                            className="field-error"
                                            id={`${field.name}-error`}
                                        >
                                            {errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    <button
                        className="button primary checkout-submit"
                        type="submit"
                    >
                        Place demo order
                        <ArrowRight size={18} aria-hidden="true" />
                    </button>
                </form>
                <aside
                    className="order-summary"
                    aria-labelledby="checkout-summary"
                >
                    <h2 id="checkout-summary">Your order</h2>
                    <ul className="summary-items">
                        {items.map((item) => (
                            <li key={item.id}>
                                <span>
                                    {item.title}{' '}
                                    <span className="muted">
                                        x {item.quantity}
                                    </span>
                                </span>
                                <strong>
                                    {formatMoney(
                                        item.priceCents * item.quantity,
                                    )}
                                </strong>
                            </li>
                        ))}
                    </ul>
                    <dl>
                        <div>
                            <dt>Item subtotal</dt>
                            <dd>{formatMoney(subtotalCents)}</dd>
                        </div>
                    </dl>
                    <p className="muted">
                        Shipping and taxes are not calculated.
                    </p>
                </aside>
            </div>
        </>
    );
}
