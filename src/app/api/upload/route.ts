import { NextResponse } from "next/server";
import { uploadToCloudinaryServer } from "@/lib/cloudinary-server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in request" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinaryServer(buffer, "magic-prompts");

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      ratio: result.ratio,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
