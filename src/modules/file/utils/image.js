import LRU from 'lru-cache';

import Bucket from './bucket';

const imageCache = new LRU({
  max: 50,
  maxAge: 24 * 60 * 60 * 1000,
});

export const uploadImage = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => e.target.files[0];
  input.click();
}

export const readImage = (file) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsArrayBuffer(file);
  });
}

export const getImageDetails = (url) => {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = url;
  });
}

export const downloadProfilePictureFromBucket = async (bucketKey, address, mimeType) => {
  if (imageCache.has(address)) {
    console.debug('Found image in cache. Not downloading from bucket');
    return imageCache.get(address);
  }

  const buf = await Bucket.download(bucketKey, `${address}/pic`);
  const url = URL.createObjectURL(new Blob([buf], { type: mimeType }));

  imageCache.set(address, url);
  return imageCache.get(address);
}

export const downloadImageFromBucket = async (bucketKey, location, mimeType) => {
  if (imageCache.has(location)) {
    console.debug('Found image in cache. Not downloading from bucket');
    return imageCache.get(location);
  }

  const buf = await Bucket.download(bucketKey, location);
  const url = URL.createObjectURL(new Blob([buf], { type: mimeType }));

  imageCache.set(location, url);
  return imageCache.get(location);
}
