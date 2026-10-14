import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { formatMoney, type Product } from '../types/product';

export default function ProductComponent({
    products,
}: {
    products: Product[];
}) {
    return (
        <div className="product-grid">
            {products.map((product, index) => (
                <article className="product-card" key={product.id}>
                    <Link to={`/product/${product.id}`}>
                        <div className="product-image">
                            <ProductImage {...product} eager={index < 4} />
                        </div>
                        <div className="product-copy">
                            <p className="eyebrow">{product.category}</p>
                            <h2>{product.title}</h2>
                            <div className="product-price">
                                <span>
                                    {formatMoney(
                                        Math.round(product.price * 100),
                                    )}
                                </span>
                                <ArrowUpRight size={20} aria-hidden="true" />
                            </div>
                        </div>
                    </Link>
                </article>
            ))}
        </div>
    );
}
