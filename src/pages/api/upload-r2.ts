import { generateMediaKey, uploadToR2 } from '../../utils/r2-storage';

export default {
  async POST({ request }) {
    try {
      // Get the uploaded file from the request
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Get metadata from form data
      const folderPath = formData.get('folderPath') as string | null || '';
      const fileName = file.name;
      
      // Generate unique key for R2 storage
      const key = generateMediaKey(fileName, folderPath);
      
      // Upload to R2 bucket
      const uploadResult = await uploadToR2(
        MEDIA, // R2 bucket binding from wrangler.jsonc
        key,
        file.stream()
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          key: key,
          name: fileName,
          size: uploadResult.size,
          uploadedAt: new Date().toISOString(),
          url: `https://aiya-media-assets.r2.dev/${key}`
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error('R2 upload error:', error);
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
  
  async OPTIONS() {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
};