/**
 * R2 Storage Utilities for AIYA Website
 * Provides helper functions to interact with Cloudflare R2 storage
 */

/**
 * Upload a file to R2 bucket
 * @param bucket - R2 bucket binding
 * @param key - Object key in R2
 * @param body - File content as ArrayBuffer or ReadableStream
 * @param options - Metadata and options for the upload
 * @returns Promise resolving to the uploaded object metadata
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer | ReadableStream | null,
  options?: {
    contentType?: string;
    metadata?: Record<string, string>;
    cacheControl?: string;
  }
): Promise<R2Object> {
  const uploadOptions: R2PutOptions = {
    contentType: options?.contentType,
    metadata: options?.metadata,
    cacheControl: options?.cacheControl
  };

  return await bucket.put(key, body, uploadOptions);
}

/**
 * Get a file from R2 bucket
 * @param bucket - R2 bucket binding
 * @param key - Object key in R2
 * @returns Promise resolving to the object or null if not found
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return await bucket.get(key);
}

/**
 * Delete a file from R2 bucket
 * @param bucket - R2 bucket binding
 * @param key - Object key in R2
 * @returns Promise resolving to void
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * List objects in R2 bucket with optional prefix filtering
 * @param bucket - R2 bucket binding
 * @param prefix - Optional prefix to filter results
 * @returns Promise resolving to list of objects
 */
export async function listFromR2(
  bucket: R2Bucket,
  prefix?: string
): Promise<R2ObjectList> {
  const listOptions: R2ListOptions = {};
  if (prefix) {
    listOptions.prefix = prefix;
  }
  
  return await bucket.list(listOptions);
}

/**
 * Generate a unique key for media files
 * @param fileName - Original file name
 * @param prefix - Optional prefix for the key
 * @returns Generated unique key
 */
export function generateMediaKey(
  fileName: string,
  prefix: string = 'media/'
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  
  return `${prefix}${nameWithoutExtension}-${timestamp}-${random}.${extension}`;
}