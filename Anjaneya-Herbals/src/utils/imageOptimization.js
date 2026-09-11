const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

export function optimizeCloudinaryImage(url, width = 600) {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return url;
  }

  const safeWidth = Math.max(160, Math.min(1600, Math.round(Number(width) || 600)));
  const transformation = `f_auto,q_auto:eco,c_limit,w_${safeWidth}`;
  return url.replace(CLOUDINARY_UPLOAD_SEGMENT, `${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/`);
}
