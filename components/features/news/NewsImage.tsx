import Image, { ImageProps } from 'next/image';

type NewsImageProps = Omit<ImageProps, 'unoptimized'>;

/**
 * Wraps next/image and skips Vercel's image optimization for external URLs.
 * External sites (e.g. money.com) block Vercel's optimization proxy, causing 502s.
 */
export const NewsImage = ({ src, alt, ...props }: NewsImageProps) => {
  const isExternal =
    typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));

  return <Image src={src} alt={alt ?? ''} unoptimized={isExternal} {...props} />;
};
