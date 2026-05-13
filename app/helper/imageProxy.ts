export const getImageProxyUrl = (imageUrl: string): string => {
  const encodedUrl = encodeURIComponent(imageUrl);
  return `/api/image-proxy?url=${encodedUrl}`;
};
