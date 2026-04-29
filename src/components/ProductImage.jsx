import React, { useEffect, useMemo, useState } from 'react';
import { getProductFallbackImage, getProductImageCandidates, resolveProductImageUrl } from '../utils/productImages';

const ProductImage = ({
  product,
  src,
  alt,
  className = '',
  wrapperClassName = '',
  imgClassName = '',
}) => {
  const candidates = useMemo(() => {
    if (src) {
      return [resolveProductImageUrl(src)];
    }

    return getProductImageCandidates(product);
  }, [product, src]);

  const fallback = useMemo(() => getProductFallbackImage(product), [product]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(0);
  }, [candidates, src]);

  const currentSrc = candidates[currentIndex] || fallback;

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (currentSrc !== fallback) {
      setCurrentIndex(candidates.length);
    }
  };

  return (
    <div className={wrapperClassName}>
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        className={`${className} ${imgClassName}`.trim()}
      />
    </div>
  );
};

export default ProductImage;
