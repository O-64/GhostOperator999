const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /v1/upload
// Accepts { fileName, fileType, base64Data } or forward to Python agent service
router.post('/', async (req, res) => {
  try {
    const { fileName, fileType, base64Data, textContent } = req.body;

    if (!fileName && !base64Data && !textContent) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const safeName = (fileName || `upload_${Date.now()}.bin`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const localFilePath = path.join(UPLOADS_DIR, safeName);

    let fileBuffer = null;
    if (base64Data) {
      // Strip base64 prefix if present (e.g. data:application/pdf;base64,...)
      const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(localFilePath, fileBuffer);
    } else if (textContent) {
      fileBuffer = Buffer.from(textContent, 'utf-8');
      fs.writeFileSync(localFilePath, fileBuffer);
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    let cloudinaryUrl = null;

    // If Cloudinary credentials are fully present, attempt Cloudinary upload
    if (cloudName && apiKey && apiSecret && fileBuffer) {
      try {
        const crypto = require('crypto');
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signatureStr = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        const formData = new FormData();
        const blob = new Blob([fileBuffer]);
        formData.append('file', blob, safeName);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const cData = await uploadRes.json();
          cloudinaryUrl = cData.secure_url || cData.url;
        }
      } catch (cErr) {
        console.warn('[CLOUDINARY UPLOAD WARNING]', cErr.message);
      }
    }

    const publicUrl = cloudinaryUrl || `/uploads/${safeName}`;

    return res.json({
      success: true,
      fileName: safeName,
      fileType: fileType || 'application/octet-stream',
      url: publicUrl,
      isCloudinary: !!cloudinaryUrl,
      sizeBytes: fileBuffer ? fileBuffer.length : 0,
      storedLocally: true,
      localPath: localFilePath,
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    return res.status(500).json({ error: 'File upload failed', message: err.message });
  }
});

module.exports = router;
