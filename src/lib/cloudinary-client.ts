/**
 * Client-side helper function to upload File objects to Cloudinary via API route or direct REST API
 */
export async function uploadImageFile(file: File): Promise<{ url: string; ratio: number }> {
  // Try uploading via Next.js server API endpoint first
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return { url: data.url, ratio: data.ratio || 1.25 };
      }
    }
  } catch (err) {
    console.warn("Server API upload fallback to direct Cloudinary client upload...", err);
  }

  // Fallback: Direct unsigned upload preset to Cloudinary REST API
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dc0ivmwku";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Images";

  const directFormData = new FormData();
  directFormData.append("file", file);
  directFormData.append("upload_preset", uploadPreset);

  const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: directFormData,
  });

  if (!directRes.ok) {
    const errJson = await directRes.json();
    throw new Error(errJson.error?.message || "Failed to upload image to Cloudinary");
  }

  const directData = await directRes.json();
  const width = directData.width || 800;
  const height = directData.height || 1000;
  const ratio = parseFloat((height / width).toFixed(2));

  return {
    url: directData.secure_url,
    ratio,
  };
}
