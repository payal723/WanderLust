const sharp = require('sharp');
const path = require('path');

class ImageOptimizer {
  static async optimizeImage(buffer, options = {}) {
    const {
      width = 1200,
      height = 800,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      const optimized = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();

      return optimized;
    } catch (error) {
      console.error('Image optimization error:', error);
      return buffer; // Return original if optimization fails
    }
  }

  static async createThumbnail(buffer, size = 300) {
    try {
      return await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      return buffer;
    }
  }

  static async createMultipleSizes(buffer) {
    const sizes = {
      thumbnail: { width: 300, height: 200, quality: 70 },
      medium: { width: 600, height: 400, quality: 80 },
      large: { width: 1200, height: 800, quality: 85 }
    };

    const results = {};

    for (const [sizeName, options] of Object.entries(sizes)) {
      try {
        results[sizeName] = await this.optimizeImage(buffer, options);
      } catch (error) {
        console.error(`Error creating ${sizeName} size:`, error);
        results[sizeName] = buffer;
      }
    }

    return results;
  }

  static getImageMetadata(buffer) {
    return sharp(buffer).metadata();
  }

  static async watermarkImage(buffer, watermarkText) {
    try {
      const { width, height } = await sharp(buffer).metadata();
      
      const watermarkSvg = `
        <svg width="${width}" height="${height}">
          <text x="50%" y="95%" 
                text-anchor="middle" 
                font-family="Arial" 
                font-size="24" 
                fill="rgba(255,255,255,0.7)" 
                stroke="rgba(0,0,0,0.3)" 
                stroke-width="1">
            ${watermarkText}
          </text>
        </svg>
      `;

      return await sharp(buffer)
        .composite([{
          input: Buffer.from(watermarkSvg),
          gravity: 'southeast'
        }])
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      console.error('Watermark error:', error);
      return buffer;
    }
  }
}

module.exports = ImageOptimizer;