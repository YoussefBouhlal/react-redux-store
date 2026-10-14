import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ProductImage({
    image,
    title,
    eager = false,
}: {
    image: string;
    title: string;
    eager?: boolean;
}) {
    const [failedSource, setFailedSource] = useState<string | null>(null);
    return failedSource === image ? (
        <div className="image-fallback" role="img" aria-label={title}>
            <ImageOff aria-hidden="true" />
            <span>Image unavailable</span>
        </div>
    ) : (
        <img
            src={image}
            alt={title}
            width="400"
            height="400"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailedSource(image)}
        />
    );
}
