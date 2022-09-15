import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

export const getImage = async (url) => {
  try {
    const image = await getDownloadURL(ref(storage, 'images/' + url));
    return image.toString();
  } catch {
    return false;
  }
};
