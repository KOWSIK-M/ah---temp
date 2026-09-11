import { describe, expect, it } from 'vitest';
import { optimizeCloudinaryImage } from '../utils/imageOptimization';

describe('optimizeCloudinaryImage', () => {
  it('adds automatic format, quality and a width limit to Cloudinary images', () => {
    const source = 'https://res.cloudinary.com/demo/image/upload/v1/products/item.jpg';
    expect(optimizeCloudinaryImage(source, 480)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:eco,c_limit,w_480/v1/products/item.jpg',
    );
  });

  it('leaves non-Cloudinary and inline images unchanged', () => {
    expect(optimizeCloudinaryImage('/product.jpg')).toBe('/product.jpg');
    expect(optimizeCloudinaryImage('data:image/svg+xml,abc')).toBe('data:image/svg+xml,abc');
  });
});
