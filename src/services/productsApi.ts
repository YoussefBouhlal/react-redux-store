import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { isProduct, type Product } from '../types/product';

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://fakestoreapi.com/',
        timeout: 15000,
    }),
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getProducts: builder.query<Product[], void>({
            async queryFn(_argument, _api, _options, baseQuery) {
                const result = await baseQuery('products');
                if (result.error) return { error: result.error };
                if (
                    !Array.isArray(result.data) ||
                    !result.data.every(isProduct) ||
                    new Set(result.data.map((product) => product.id)).size !==
                        result.data.length
                ) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: 'Invalid product catalog',
                        },
                    };
                }
                return { data: result.data };
            },
        }),
        getProduct: builder.query<Product | null, number>({
            async queryFn(productId, _api, _options, baseQuery) {
                if (!Number.isSafeInteger(productId) || productId < 1)
                    return { data: null };
                const result = await baseQuery(`products/${productId}`);
                if (result.error) {
                    if (result.error.status === 404) return { data: null };
                    return { error: result.error };
                }
                if (result.data == null || result.data === '')
                    return { data: null };
                if (!isProduct(result.data) || result.data.id !== productId) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: 'Invalid product details',
                        },
                    };
                }
                return { data: result.data };
            },
        }),
    }),
});

export const { useGetProductsQuery, useGetProductQuery } = productsApi;
