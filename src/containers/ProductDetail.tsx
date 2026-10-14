import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { useGetProductQuery } from '../services/productsApi';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addProduct, MAX_QUANTITY } from '../features/cart/cartSlice';
import { formatMoney } from '../types/product';
import ProductImage from '../components/ProductImage';
import RequestError from '../components/RequestError';

export default function ProductDetails() {
    const { productId = '' } = useParams();
    const id = Number(productId);
    const valid = /^[1-9]\d*$/.test(productId) && Number.isSafeInteger(id);
    const {
        currentData: product,
        isFetching,
        isError,
        refetch,
    } = useGetProductQuery(id, { skip: !valid });
    const dispatch = useAppDispatch();
    const quantity = useAppSelector(
        (state) =>
            state.cart.items.find((item) => item.id === id)?.quantity ?? 0,
    );
    const [addedId, setAddedId] = useState<number | null>(null);
    if (!valid || product === null)
        return (
            <>
                <title>Product not found | My Shop</title>
                <div className="empty-state">
                    <h1>Product not found</h1>
                    <p>This product is unavailable.</p>
                    <Link className="button" to="/">
                        Back to products
                    </Link>
                </div>
            </>
        );
    if (isError)
        return (
            <>
                <title>Product details | My Shop</title>
                <h1>Product details</h1>
                <RequestError
                    message="Unable to load this product"
                    retry={refetch}
                />
                <Link className="back-link" to="/">
                    Back to products
                </Link>
            </>
        );
    if (!product || isFetching)
        return (
            <>
                <title>Product details | My Shop</title>
                <p className="loading-state" role="status">
                    Loading product...
                </p>
            </>
        );
    return (
        <>
            <title>{product.title} | My Shop</title>
            <Link className="back-link" to="/">
                <ArrowLeft size={18} aria-hidden="true" />
                Back to products
            </Link>
            <div className="product-detail">
                <div className="detail-image">
                    <ProductImage {...product} eager />
                </div>
                <div className="detail-copy">
                    <p className="eyebrow">{product.category}</p>
                    <h1>{product.title}</h1>
                    <p className="detail-price">
                        {formatMoney(Math.round(product.price * 100))}
                    </p>
                    <p className="description">{product.description}</p>
                    <button
                        className="button primary purchase-button"
                        type="button"
                        disabled={quantity >= MAX_QUANTITY}
                        onClick={() => {
                            dispatch(addProduct(product));
                            setAddedId(id);
                        }}
                    >
                        <ShoppingBag size={20} aria-hidden="true" />
                        Add to cart
                        <ArrowRight size={18} aria-hidden="true" />
                    </button>
                    <div className="purchase-status" role="status">
                        {quantity >= MAX_QUANTITY ? (
                            'Quantity limit reached.'
                        ) : addedId === id ? (
                            <>
                                <Check size={18} aria-hidden="true" />
                                Added to cart.
                            </>
                        ) : null}
                    </div>
                    {addedId === id && (
                        <Link className="back-link" to="/cart">
                            View cart
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
