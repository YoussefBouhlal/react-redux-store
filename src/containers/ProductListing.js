import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';

import {setProducts} from '../redux/actions/productActions';
import ProductComponent from './ProductComponent';
import { isProduct } from '../productValidation';

const ProductListing = () => {

    const products = useSelector((state) => state.allProducts.products);
    const dispatch = useDispatch();
    const [status, setStatus] = useState('loading');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setStatus('loading');
        dispatch(setProducts([]));

        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://fakestoreapi.com/products', {
                    signal: controller.signal,
                    timeout: 15000,
                });
                if (!active) return;
                if (!Array.isArray(response.data) || !response.data.every(isProduct)) {
                    throw new Error('Invalid product catalog');
                }
                dispatch(setProducts(response.data));
                setStatus('success');
            } catch {
                if (active) setStatus('error');
            }
        };

        fetchProducts();
        return () => {
            active = false;
            controller.abort();
        };
    }, [dispatch, attempt]);

    return (
        <div className="ui container">
            <h1>Products</h1>
            {status === 'loading' && <p role="status">Loading products...</p>}
            {status === 'error' && (
                <div role="alert">
                    <p>Unable to load products. Please try again.</p>
                    <button type="button" className="ui button" onClick={() => setAttempt(attempt + 1)}>
                        Try again
                    </button>
                </div>
            )}
            {status === 'success' && (
                products.length === 0 ? <p>No products available.</p> : (
                    <div className="ui grid"><ProductComponent /></div>
                )
            )}
        </div>
    )
};

export default ProductListing;