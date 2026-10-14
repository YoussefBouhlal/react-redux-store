import { CircleAlert, RefreshCw } from 'lucide-react';

export default function RequestError({
    message,
    retry,
}: {
    message: string;
    retry: () => void;
}) {
    return (
        <div role="alert" className="empty-state">
            <CircleAlert size={32} aria-hidden="true" />
            <h2>{message}</h2>
            <p>Please check your connection and try again.</p>
            <button className="button" type="button" onClick={retry}>
                <RefreshCw size={18} aria-hidden="true" />
                Try again
            </button>
        </div>
    );
}
