/**
 * Convert a string to a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Standard image sizes for Hygraph asset transformations
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 400 },
  small: { width: 640, height: 640 },
  medium: { width: 1024, height: 1024 },
  large: { width: 1600, height: 1600 },
  fullSize: { width: 2400, height: 2400 },
  // Social/OG image - optimized for sharing (1200x630 recommended)
  social: { width: 1200, height: 630 },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

interface ImageTransformOptions {
  /** Predefined size or custom width */
  size?: ImageSize;
  /** Custom width (overrides size) */
  width?: number;
  /** Custom height (overrides size) */
  height?: number;
  /** Resize fit mode */
  fit?: 'clip' | 'crop' | 'scale' | 'max';
  /** Image quality 1-100 (default 80) */
  quality?: number;
  /** Output format */
  format?: 'webp' | 'jpg' | 'png' | 'avif';
}

/**
 * Transform a Hygraph asset URL with resize and format options.
 * Converts HEIC and other formats to WebP by default for browser compatibility.
 *
 * Hygraph URL transformation format (new asset system):
 * https://REGION.graphassets.com/ENV_ID/<transformations>/HANDLE
 *
 * @example
 * // Using predefined size
 * getOptimizedImageUrl(url, { size: 'medium' })
 *
 * // Using custom dimensions
 * getOptimizedImageUrl(url, { width: 800, height: 600, fit: 'crop' })
 *
 * // Full customization
 * getOptimizedImageUrl(url, { width: 1200, quality: 85, format: 'webp' })
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Parse the Hygraph URL
  // New format: https://REGION.graphassets.com/ENV_ID/HANDLE
  // With transforms: https://REGION.graphassets.com/ENV_ID/<transforms>/HANDLE
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  
  // pathParts[0] = ENV_ID, pathParts[last] = HANDLE
  // There may be existing transforms in between
  const envId = pathParts[0];
  const handle = pathParts[pathParts.length - 1];
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Determine dimensions
  let width: number | undefined;
  let height: number | undefined;

  if (options.size && IMAGE_SIZES[options.size]) {
    width = IMAGE_SIZES[options.size].width;
    height = IMAGE_SIZES[options.size].height;
  }

  // Custom dimensions override size preset
  if (options.width) width = options.width;
  if (options.height) height = options.height;

  const fit = options.fit ?? 'max';
  const quality = options.quality ?? 80;
  const format = options.format ?? 'webp';

  // Build transformation string
  const transforms: string[] = [];

  // Resize transformation
  if (width || height) {
    const resizeParts = [`fit:${fit}`];
    if (width) resizeParts.push(`width:${width}`);
    if (height) resizeParts.push(`height:${height}`);
    transforms.push(`resize=${resizeParts.join(',')}`);
  }

  // Quality transformation
  transforms.push(`quality=value:${quality}`);

  // Output format transformation
  transforms.push(`output=format:${format}`);

  // Construct final URL: baseUrl/envId/transforms/handle
  const transformString = transforms.join('/');
  return `${baseUrl}/${envId}/${transformString}/${handle}`;
}

/**
 * Generate srcset for responsive images
 *
 * @example
 * getResponsiveSrcSet(url, [400, 800, 1200, 1600])
 * // Returns: "url-400w 400w, url-800w 800w, ..."
 */
export function getResponsiveSrcSet(
  url: string,
  widths: number[] = [400, 800, 1200, 1600],
  options: Omit<ImageTransformOptions, 'size' | 'width'> = {}
): string {
  return widths
    .map((w) => {
      const optimizedUrl = getOptimizedImageUrl(url, { ...options, width: w });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
}
