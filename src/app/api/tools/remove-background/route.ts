import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL or Base64 data is required" }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (openRouterApiKey) {
      const visionModels = [
        "openrouter/free",
        "nvidia/nemotron-nano-12b-v2-vl:free",
        "qwen/qwen2.5-vl-72b-instruct",
        "google/gemma-4-26b-a4b-it:free",
      ];

      for (const modelName of visionModels) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openRouterApiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://magicprompts.ai",
              "X-Title": "Magic Prompts Background Remover",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: `You are an expert AI Image Segmentation and Computer Vision Engine.
Analyze the provided image and identify the main foreground subject, the background color RGB, and edge transparency parameters.
OUTPUT ONLY VALID JSON:
{
  "subject": "Main subject name",
  "backgroundColor": "Primary background color description (e.g. white, dark grey, studio blue)",
  "tolerance": 45
}`,
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Identify the main foreground subject and background color for cutout segmentation:" },
                    { type: "image_url", image_url: { url: imageUrl } },
                  ],
                },
              ],
            }),
          });

          if (!response.ok) continue;

          const data = await response.json();
          const rawContent = data?.choices?.[0]?.message?.content;
          if (rawContent) {
            const firstBrace = rawContent.indexOf("{");
            const lastBrace = rawContent.lastIndexOf("}");
            let parsed = { subject: "Subject", tolerance: 45 };
            if (firstBrace !== -1 && lastBrace !== -1) {
              try {
                parsed = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
              } catch (e) {}
            }

            return NextResponse.json({
              success: true,
              resultUrl: imageUrl,
              isOpenRouterVision: true,
              modelUsed: modelName,
              meta: parsed,
            });
          }
        } catch (err) {
          console.warn(`OpenRouter model ${modelName} call exception:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      resultUrl: imageUrl,
      isOpenRouterVision: false,
    });
  } catch (error: any) {
    console.error("Remove background route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process background removal" },
      { status: 500 }
    );
  }
}
