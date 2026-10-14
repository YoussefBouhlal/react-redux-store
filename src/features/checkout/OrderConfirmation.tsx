import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { formatMoney } from '../../types/product';

export default function OrderConfirmation() {
    const receipt = useAppSelector((state) => state.checkout.receipt);
    return (
        <>
            <title>Demo confirmation | My Shop</title>
            <div className="empty-state confirmation">
                {receipt ? (
                    <>
                        <CircleCheck size={48} aria-hidden="true" />
                        <p className="eyebrow">All set</p>
                        <h1>Demo order complete</h1>
                        <p>
                            {receipt.itemCount}{' '}
                            {receipt.itemCount === 1 ? 'item' : 'items'}{' '}
                            &middot; {formatMoney(receipt.subtotalCents)}
                        </p>
                        <p>
                            No payment was collected. No real order was created.
                        </p>
                    </>
                ) : (
                    <>
                        <h1>No demo order to display</h1>
                        <p>
                            Confirmations are available only during the current
                            visit.
                        </p>
                    </>
                )}
                <Link className="button primary" to="/">
                    Continue shopping
                    <ArrowRight size={18} aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}
