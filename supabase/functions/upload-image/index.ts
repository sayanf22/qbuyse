import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the imgbb API key from environment variables
    const imgbbApiKey = Deno.env.get('IMGBB_API_KEY')
    if (!imgbbApiKey) {
      throw new Error('IMGBB_API_KEY not configured')
    }

    // Parse the form data
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.')
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Please upload an image smaller than 5MB.')
    }

    console.log('🔄 Uploading image to imgbb...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    })

    // Create form data for imgbb
    const imgbbFormData = new FormData()
    imgbbFormData.append('image', imageFile)
    imgbbFormData.append('key', imgbbApiKey)

    // Upload to imgbb
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    })

    if (!imgbbResponse.ok) {
      console.error('❌ imgbb API request failed:', imgbbResponse.status, imgbbResponse.statusText)
      throw new Error(`Failed to upload image: ${imgbbResponse.status} ${imgbbResponse.statusText}`)
    }

    const imgbbData = await imgbbResponse.json()
    console.log('📋 imgbb API response:', imgbbData)

    if (!imgbbData.success) {
      console.error('❌ imgbb upload failed:', imgbbData.error)
      throw new Error(imgbbData.error?.message || 'Upload failed')
    }

    console.log('✅ Image uploaded successfully to imgbb:', imgbbData.data.url)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: imgbbData.data.url,
        message: 'Image uploaded successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Upload error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})