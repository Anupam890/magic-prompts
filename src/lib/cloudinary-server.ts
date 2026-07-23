import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dc0ivmwku",
  api_key: process.env.CLOUDINARY_API_KEY || "361958213169974",
  api_secret: process.env.CLOUDINARY_API_SECRET || "Il9vM6T3nqJdmCmHwNvfr5Pj-64",
  secure: true,
});

export { cloudinary };

/**
 * Server-side helper to upload a Buffer to Cloudinary
 */
export async function uploadToCloudinaryServer(fileBuffer: Buffer, folder = "magic-prompts") {
  return new Promise<{ secure_url: string; width: number; height: number; ratio: number }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Upload failed to return result"));
        }
        const width = result.width || 800;
        const height = result.height || 1000;
        const ratio = parseFloat((height / width).toFixed(2));

        resolve({
          secure_url: result.secure_url,
          width,
          height,
          ratio,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}
