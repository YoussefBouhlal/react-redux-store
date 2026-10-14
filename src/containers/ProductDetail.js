import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { selectedProducts, removeSelectedProducts } from "../redux/actions/productActions";
import { isProduct } from '../productValidation';

const ProductDetails = () => {

    const product = useSelector((state)=> state.product);
    const { image, title, price, category, description } = product;
    const {productId} = useParams();
    const dispatch = useDispatch();
    const [request, setRequest] = useState({ productId, status: 'loading' });
    const [attempt, setAttempt] = useState(0);
    const validProductId = /^[1-9]\d*$/.test(productId) && Number.isSafeInteger(Number(productId));
    const status = request.productId === productId ? request.status : 'loading';

    useEffect(() => {
        dispatch(removeSelectedProducts());
        if (!validProductId) return;

        const controller = new AbortController();
        let active = true;
        setRequest({ productId, status: 'loading' });

        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`https://fakestoreapi.com/products/${productId}`, {
                    signal: controller.signal,
                    timeout: 15000,
                });
                if (!active) return;
                if (response.data == null || response.data === '') {
                    setRequest({ productId, status: 'not-found' });
                    return;
                }
                if (!isProduct(response.data) || response.data.id !== Number(productId)) {
                    throw new Error('Invalid product details');
                }
                dispatch(selectedProducts(response.data));
                setRequest({ productId, status: 'success' });
            } catch (error) {
                if (active) {
                    setRequest({ productId, status: error.response?.status === 404 ? 'not-found' : 'error' });
                }
            }
        };

        fetchProductDetails();
        return () => {
            active = false;
            controller.abort();
            dispatch(removeSelectedProducts());
        };
    }, [dispatch, productId, validProductId, attempt]);

    if (!validProductId || status === 'not-found') {
        return (
            <div className="ui container">
                <h1>Product not found</h1>
                <p>This product is unavailable.</p>
                <Link to="/">Back to products</Link>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="ui container">
                <h1>Product details</h1>
                <div role="alert">
                    <p>Unable to load this product. Please try again.</p>
                    <button type="button" className="ui button" onClick={() => setAttempt(attempt + 1)}>
                        Try again
                    </button>
                </div>
                <Link to="/">Back to products</Link>
            </div>
        );
    }

    if (status === 'loading' || product.id !== Number(productId)) {
        return <div className="ui container"><p role="status">Loading product...</p></div>;
    }

    return (
        <div className="ui grid container">
            <Link to="/">Back to products</Link>
                    <div className="ui placeholder segment">
                        <div className="ui two column stackable center aligned grid">
                            <div className="middle aligned row">
                                <div className="column lp">
                                    <img className="ui fluid image" src={image} alt={title} />
                                </div>
                                <div className="column rp">
                                    <h1>{title}</h1>
                                    <p className="ui teal tag label">${price.toFixed(2)}</p>
                                    <p className="ui brown block header">{category}</p>
                                    <p>{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
        </div>
    )
};

export default ProductDetails;