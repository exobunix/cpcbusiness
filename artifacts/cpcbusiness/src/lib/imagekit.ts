import ImageKit from "imagekit-javascript";

export const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "public_5z+lOJYXBs7KgjxXI/ikiRBuaiA=";
export const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/smcdngw8m";
export const IMAGEKIT_FOLDER = import.meta.env.VITE_IMAGEKIT_FOLDER || "cpcbusiness";

export const imagekitClient = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

/**
 * Returns an ImageKit optimized URL given a path or URL.
 */
export function getImageKitUrl(path: string, transformations?: Record<string, string>): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (!path.includes("ik.imagekit.io")) {
      return path;
    }
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return imagekitClient.url({
    path: cleanPath.startsWith(IMAGEKIT_FOLDER) ? cleanPath : `${IMAGEKIT_FOLDER}/${cleanPath}`,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    transformation: transformations ? [transformations] : undefined,
  });
}
