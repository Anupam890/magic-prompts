import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL or Base64 data is required" }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    // Direct, strict system prompt instructing OpenRouter vision models to analyze the image
    const systemPrompt = `You are an expert AI Prompt Engineer and Visual Architect.
Analyze the provided image in detail. Identify the main subject, setting, art style, color palette, lighting, camera angle, and artistic medium.
Write a detailed, highly descriptive image generation prompt (80-150 words) that accurately recreates this specific image in Midjourney v6 or Flux.

OUTPUT ONLY VALID JSON WITH EXACTLY THIS SCHEMA:
{
  "prompt": "Detailed photorealistic description of the image content, style, colors, lighting, camera shot, rendered parameters --ar 16:9 --v 6.0",
  "negative": "blurry, distorted, low resolution, bad anatomy, watermark, text"
}`;

    if (openRouterApiKey) {
      // Tested & verified active OpenRouter vision models
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
              "X-Title": "Magic Prompts",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Describe this image in vivid detail and convert it into a photorealistic generation prompt JSON:",
                    },
                    {
                      type: "image_url",
                      image_url: { url: imageUrl },
                    },
                  ],
                },
              ],
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`OpenRouter model ${modelName} returned status ${response.status}: ${errText}`);
            continue;
          }

          const data = await response.json();
          const rawContent = data?.choices?.[0]?.message?.content;
          if (rawContent) {
            // Extract JSON substring cleanly
            const cleanedContent = rawContent.replace(/```json|```/g, "").trim();
            const firstBrace = cleanedContent.indexOf("{");
            const lastBrace = cleanedContent.lastIndexOf("}");

            if (firstBrace !== -1 && lastBrace !== -1) {
              const jsonSub = cleanedContent.substring(firstBrace, lastBrace + 1);
              const parsed = JSON.parse(jsonSub);
              if (parsed?.prompt) {
                return NextResponse.json({
                  result: {
                    prompt: parsed.prompt,
                    negative: parsed.negative || "blurry, low quality, distortion, text, watermark",
                  },
                  isLiveApi: true,
                  modelUsed: modelName,
                });
              }
            }

            // Direct string fallback if model responded with raw text prompt
            return NextResponse.json({
              result: {
                prompt: cleanedContent,
                negative: "blurry, low quality, distortion, text, watermark",
              },
              isLiveApi: true,
              modelUsed: modelName,
            });
          }
        } catch (err) {
          console.warn(`Model ${modelName} call exception:`, err);
        }
      }
    }

    // Fallback if API key missing or network offline
    return NextResponse.json({
      result: {
        prompt: "A stunning visual artwork with vivid colors, dramatic lighting, detailed composition, high resolution rendering --ar 16:9 --v 6.0",
        negative: "blurry, low quality, distortion, text, watermark",
      },
      isLiveApi: false,
    });
  } catch (error: any) {
    console.error("Image to prompt route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
