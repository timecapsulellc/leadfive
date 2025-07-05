/**
 * Optimized Image Component
 * Advanced image loading with compression, WebP support, and lazy loading
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Image format detection
const supportsWebP = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

const supportsAVIF = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
})();

// Image optimization utilities
const generateSrcSet = (src, sizes = [320, 640, 768, 1024, 1200, 1920]) => {
  if (!src) return '';

  const extension = src.split('.').pop().toLowerCase();
  const basePath = src.replace(`.${extension}`, '');

  return sizes
    .map(size => `${basePath}_${size}w.${extension} ${size}w`)
    .join(', ');
};

const generateSources = (src, formats = ['avif', 'webp']) => {
  if (!src) return [];

  const extension = src.split('.').pop().toLowerCase();
  const basePath = src.replace(`.${extension}`, '');

  const sources = [];

  formats.forEach(format => {
    if (
      (format === 'webp' && supportsWebP) ||
      (format === 'avif' && supportsAVIF)
    ) {
      sources.push({
        type: `image/${format}`,
        srcSet: generateSrcSet(`${basePath}.${format}`),
      });
    }
  });

  return sources;
};

// Loading placeholder component
const ImagePlaceholder = memo(
  ({ width, height, className = '', showSkeleton = true }) => (
    <div
      className={`image-placeholder ${className} ${showSkeleton ? 'skeleton' : ''}`}
      style={{
        width: width || '100%',
        height: height || '200px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showSkeleton && <div className="skeleton-wave" />}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        style={{ color: '#9ca3af' }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
  )
);

// Error fallback component
const ImageError = memo(({ width, height, className = '', onRetry, alt }) => (
  <div
    className={`image-error ${className}`}
    style={{
      width: width || '100%',
      height: height || '200px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#991b1b',
    }}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ marginBottom: '8px' }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
    <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
      Failed to load image
    </p>
    {alt && (
      <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.7 }}>
        {alt}
      </p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          background: 'none',
          border: '1px solid currentColor',
          color: 'inherit',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    )}
  </div>
));

// Main OptimizedImage component
const OptimizedImage = memo(
  ({
    src,
    alt = '',
    width,
    height,
    className = '',
    placeholder: CustomPlaceholder,
    errorFallback: CustomErrorFallback,
    loading = 'lazy',
    priority = false,
    sizes = '100vw',
    quality = 75,
    formats = ['avif', 'webp'],
    blur = true,
    fade = true,
    retryCount = 2,
    retryDelay = 1000,
    onLoad,
    onError,
    onClick,
    style = {},
    observerOptions = { threshold: 0.1, rootMargin: '50px' },
    ...props
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(
      !loading || loading === 'eager' || priority
    );
    const [hasError, setHasError] = useState(false);
    const [retries, setRetries] = useState(0);
    const [currentSrc, setCurrentSrc] = useState(null);

    const imgRef = useRef();
    const observerRef = useRef();
    const retryTimeoutRef = useRef();

    // Generate optimized sources
    const sources = useMemo(() => {
      if (!src || hasError) return [];
      return generateSources(src, formats);
    }, [src, formats, hasError]);

    // Generate srcSet for fallback
    const srcSet = useMemo(() => {
      if (!src || hasError) return '';
      return generateSrcSet(src);
    }, [src, hasError]);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (loading === 'eager' || priority || isInView) return;

      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      }, observerOptions);

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }

      return () => {
        observerRef.current?.disconnect();
      };
    }, [loading, priority, isInView, observerOptions]);

    // Handle image load
    const handleLoad = useCallback(
      e => {
        setIsLoaded(true);
        setHasError(false);
        onLoad?.(e);
      },
      [onLoad]
    );

    // Handle image error with retry logic
    const handleError = useCallback(
      e => {
        if (retries < retryCount) {
          setRetries(prev => prev + 1);

          retryTimeoutRef.current = setTimeout(
            () => {
              setCurrentSrc(`${src}?retry=${retries + 1}`);
            },
            retryDelay * Math.pow(2, retries)
          ); // Exponential backoff
        } else {
          setHasError(true);
          onError?.(e);
        }
      },
      [retries, retryCount, retryDelay, src, onError]
    );

    // Manual retry function
    const handleRetry = useCallback(() => {
      setHasError(false);
      setRetries(0);
      setIsLoaded(false);
      setCurrentSrc(`${src}?manual-retry=${Date.now()}`);
    }, [src]);

    // Update current src when src changes
    useEffect(() => {
      if (src) {
        setCurrentSrc(src);
        setHasError(false);
        setIsLoaded(false);
        setRetries(0);
      }
    }, [src]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }, []);

    // Preload high priority images
    useEffect(() => {
      if (priority && currentSrc) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = currentSrc;
        document.head.appendChild(link);

        return () => {
          document.head.removeChild(link);
        };
      }
    }, [priority, currentSrc]);

    // Render error state
    if (hasError) {
      if (CustomErrorFallback) {
        return <CustomErrorFallback onRetry={handleRetry} alt={alt} />;
      }
      return (
        <ImageError
          width={width}
          height={height}
          className={className}
          onRetry={handleRetry}
          alt={alt}
        />
      );
    }

    // Render placeholder while not in view or loading
    if (!isInView || (!isLoaded && !hasError)) {
      if (CustomPlaceholder) {
        return <CustomPlaceholder />;
      }
      return (
        <div ref={imgRef}>
          <ImagePlaceholder
            width={width}
            height={height}
            className={className}
          />
        </div>
      );
    }

    // Main image component
    const imageElement = (
      <picture>
        {/* Modern format sources */}
        {sources.map((source, index) => (
          <source
            key={index}
            type={source.type}
            srcSet={source.srcSet}
            sizes={sizes}
          />
        ))}

        {/* Fallback image */}
        <motion.img
          ref={imgRef}
          src={currentSrc || src}
          alt={alt}
          width={width}
          height={height}
          srcSet={srcSet}
          sizes={sizes}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          className={`optimized-image ${className} ${isLoaded ? 'loaded' : 'loading'}`}
          style={{
            ...style,
            opacity: fade ? (isLoaded ? 1 : 0) : 1,
            filter: blur && !isLoaded ? 'blur(5px)' : 'none',
            transition: fade || blur ? 'all 0.3s ease' : 'none',
          }}
          initial={fade ? { opacity: 0 } : {}}
          animate={fade ? { opacity: isLoaded ? 1 : 0 } : {}}
          transition={{ duration: 0.3 }}
          {...props}
        />
      </picture>
    );

    return imageElement;
  }
);

// Progressive Image component for very large images
const ProgressiveImage = memo(
  ({ lowQualitySrc, highQualitySrc, alt, ...props }) => {
    const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
    const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

    useEffect(() => {
      if (!highQualitySrc) return;

      const img = new Image();
      img.onload = () => {
        setCurrentSrc(highQualitySrc);
        setIsHighQualityLoaded(true);
      };
      img.src = highQualitySrc;
    }, [highQualitySrc]);

    return (
      <OptimizedImage
        src={currentSrc}
        alt={alt}
        style={{
          filter: isHighQualityLoaded ? 'none' : 'blur(2px)',
          transition: 'filter 0.3s ease',
        }}
        {...props}
      />
    );
  }
);

// Lightbox Image component
const LightboxImage = memo(
  ({ src, thumbnailSrc, alt, onLightboxOpen, ...props }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const handleClick = useCallback(() => {
      setIsLightboxOpen(true);
      onLightboxOpen?.(src);
    }, [src, onLightboxOpen]);

    return (
      <>
        <OptimizedImage
          src={thumbnailSrc || src}
          alt={alt}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
          {...props}
        />

        {isLightboxOpen && (
          <div
            className="lightbox-overlay"
            onClick={() => setIsLightboxOpen(false)}
          >
            <OptimizedImage
              src={src}
              alt={alt}
              priority
              loading="eager"
              className="lightbox-image"
            />
          </div>
        )}
      </>
    );
  }
);

// PropTypes
OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  placeholder: PropTypes.elementType,
  errorFallback: PropTypes.elementType,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  priority: PropTypes.bool,
  sizes: PropTypes.string,
  quality: PropTypes.number,
  formats: PropTypes.arrayOf(PropTypes.string),
  blur: PropTypes.bool,
  fade: PropTypes.bool,
  retryCount: PropTypes.number,
  retryDelay: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onClick: PropTypes.func,
  style: PropTypes.object,
  observerOptions: PropTypes.object,
};

ProgressiveImage.propTypes = {
  lowQualitySrc: PropTypes.string.isRequired,
  highQualitySrc: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

LightboxImage.propTypes = {
  src: PropTypes.string.isRequired,
  thumbnailSrc: PropTypes.string,
  alt: PropTypes.string,
  onLightboxOpen: PropTypes.func,
};

// Export components
export { ProgressiveImage, LightboxImage, ImagePlaceholder, ImageError };
export default OptimizedImage;
