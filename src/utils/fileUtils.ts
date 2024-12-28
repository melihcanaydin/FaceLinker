export const validMimeTypes = ['image/jpeg', 'image/png'];

export const isValidMimeType = (mimeType: string): boolean => {
  return validMimeTypes.includes(mimeType);
};