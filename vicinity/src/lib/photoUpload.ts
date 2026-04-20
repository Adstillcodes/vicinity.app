import { supabase } from './supabase';

const PHOTOS_BUCKET = 'photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadPhotoResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadPhoto(
  userId: string,
  uri: string,
  slotIndex: number
): Promise<UploadPhotoResult> {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large (max 5MB)' };
    }

    const fileName = `${userId}/photo_${slotIndex}.jpg`;
    
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(PHOTOS_BUCKET)
      .getPublicUrl(fileName);

    // Save to photos table
    const { error: dbError } = await supabase
      .from('photos')
      .upsert({
        user_id: userId,
        photo_url: urlData.publicUrl,
        slot_index: slotIndex,
      }, {
        onConflict: 'user_id,slot_index',
      });

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadMultiplePhotos(
  userId: string,
  photos: { uri: string; file?: File }[]
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < photos.length; i++) {
    if (photos[i]?.uri) {
      const result = await uploadPhoto(userId, photos[i].uri, i);
      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(result.error || 'Upload failed');
      }
    }
  }

  return { 
    success: errors.length === 0, 
    urls, 
    errors 
  };
}

export async function deleteUserPhotos(userId: string): Promise<void> {
  const { data: photos } = await supabase
    .from('photos')
    .select('photo_url')
    .eq('user_id', userId);

  if (photos) {
    for (const photo of photos) {
      const path = photo.photo_url.split('/').slice(-2).join('/');
      await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
    }
  }

  await supabase.from('photos').delete().eq('user_id', userId);
}