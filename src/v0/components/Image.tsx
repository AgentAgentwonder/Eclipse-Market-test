import React, { useState, useEffect } from 'react';

export interface V0ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: string;
  className?: string;
}

// Replacing Next.js Image component with a React/Vite equivalent
export const V0Image: React.FC<V0ImageProps> = ({
  src,
  alt,
  fallback,
  placeholder,
  className,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      if (fallback) {
        setImageSrc(fallback);
      }
      setIsLoading(false);
    };
    img.src = src;
  }, [src, fallback]);

  if (isLoading && placeholder) {
    return (
      <div className={`animate-pulse bg-muted ${className}`}>
        <img src={placeholder} alt="" className="opacity-50" {...props} />
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} {...props} />;
};
