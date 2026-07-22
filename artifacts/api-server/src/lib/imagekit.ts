import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "public_5z+lOJYXBs7KgjxXI/ikiRBuaiA=";
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/smcdngw8m";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_dummy_key";
const folder = process.env.IMAGEKIT_FOLDER || "cpcbusiness";

export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

export const imagekitConfig = {
  publicKey,
  urlEndpoint,
  folder,
};
