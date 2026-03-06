import { supabase, isSupabaseConfigured } from './supabase';
import { fileToBase64 } from '../utils';

const BUCKET_NAME = 'images';

export const storageService = {
  async uploadImage(file: File, path: string): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        // 1. Check if bucket exists (optional, or just try upload)
        // We assume the bucket 'images' exists and is public.
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase!.storage
          .from(BUCKET_NAME)
          .upload(filePath, file);

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          // Fallback to base64 if upload fails (e.g. bucket doesn't exist)
          return fileToBase64(file);
        }

        const { data } = supabase!.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (error) {
        console.error('Storage service error:', error);
        return fileToBase64(file);
      }
    } else {
      // Offline mode: use Base64
      return fileToBase64(file);
    }
  }
};
