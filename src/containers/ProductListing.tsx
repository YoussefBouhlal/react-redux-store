import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery } from '../services/productsApi';
import ProductComponent from './ProductComponent';
import RequestError from '../components/RequestError';

const sorts = ['featured', 'price-asc', 'price-desc', 'title'];

export default function ProductListing() {
    const {
        data: products = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetProductsQuery();
    const [params, setParams] = useSearchParams();
    const search = params.get('q') ?? '';
    const categories = [
        ...new Set(products.map((product) => product.category)),
    ].sort();
    const rawCategory = params.get('category') ?? '';
    const category = categories.includes(rawCategory) ? rawCategory : '';
    const rawSort = params.get('sort') ?? 'featured';
    const sort = sorts.includes(rawSort) ? rawSort : 'featured';
    const filtered = products.filter(
        (product) =>
            (!category || product.category === category) &&
            product.title.toLowerCase().includes(search.trim().toLowerCase()),
    );
    if (sort === 'price-asc')
        filtered.sort((first, second) => first.price - second.price);
    if (sort === 'price-desc')
        filtered.sort((first, second) => second.price - first.price);
    if (sort === 'title')
        filtered.sort((first, second) =>
            first.title.localeCompare(second.title),
        );

    function updateFilter(key: string, value: string) {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        setParams(next, { replace: key === 'q' });
    }

    return (
        <>
            <title>Products | My Shop</title>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">The collection</p>
                    <h1>
                        Products<span className="accent">.</span>
                    </h1>
                </div>
                <SlidersHorizontal size={28} aria-hidden="true" />
            </div>
            <div
                className="catalog-toolbar"
                role="search"
                aria-label="Product filters"
            >
                <div className="search-field">
                    <label htmlFor="search">Search products</label>
                    <div className="search-input">
                        <Search size={18} aria-hidden="true" />
                        <input
                            id="search"
                            type="search"
                            value={search}
                            placeholder="Find something good"
                            onChange={(event) =>
                                updateFilter('q', event.target.value)
                            }
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(event) =>
                            updateFilter('category', event.target.value)
                        }
                    >
                        <option value="">All categories</option>
                        {categories.map((name) => (
                            <option key={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sort">Sort by</label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(event) =>
                            updateFilter('sort', event.target.value)
                        }
                    >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                        <option value="title">Name: A to Z</option>
                    </select>
                </div>
            </div>
            {isLoading ? (
                <p className="loading-state" role="status">
                    Loading products...
                </p>
            ) : isError ? (
                <RequestError
                    message="Unable to load products"
                    retry={refetch}
                />
            ) : (
                <>
                    <div className="results-bar">
                        <p role="status">
                            {filtered.length}{' '}
                            {filtered.length === 1 ? 'product' : 'products'}
                            {isFetching ? ' - updating...' : ''}
                        </p>
                        {(search || category || sort !== 'featured') && (
                            <button
                                className="text-button"
                                type="button"
                                onClick={() => setParams({})}
                            >
                                <X size={16} aria-hidden="true" />
                                Clear filters
                            </button>
                        )}
                    </div>
                    {products.length === 0 ? (
                        <div className="empty-state">
                            <h2>No products available.</h2>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <Search aria-hidden="true" />
                            <h2>No matching products</h2>
                            <button
                                className="button"
                                type="button"
                                onClick={() => setParams({})}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <ProductComponent products={filtered} />
                    )}
                </>
            )}
        </>
    );
}
