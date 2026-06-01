import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse incoming body robustly: prefer JSON, fallback to text
    let body: any = null;
    let rawText = "";
    try {
      rawText = await request.text();
      body = rawText ? JSON.parse(rawText) : null;
    } catch {
      // not JSON, keep rawText
      body = null;
    }

    const message = body?.message ?? (typeof body === "string" ? body : rawText);
    const model = body?.model;

    if (!message || (typeof message === "string" && message.trim() === "")) {
      return NextResponse.json(
        { error: "Missing message in request body.", received: body ?? rawText },
        { status: 400 }
      );
    }

    const groqApiUrl = process.env.GROQ_API_URL;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiUrl) {
      return NextResponse.json(
        {
          error:
            "GROQ API URL is not configured. Set GROQ_API_URL in your environment.",
        },
        { status: 500 }
      );
    }

    if (!groqApiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ API key is not configured. Set GROQ_API_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    // Validate URL early to provide a clearer error when it's a placeholder
    try {
      // This will throw for invalid URLs like placeholders
      // eslint-disable-next-line no-new
      new URL(groqApiUrl);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_URL appears invalid. Replace the placeholder with your provider's endpoint (e.g. Sanity).",
          value: groqApiUrl,
        },
        { status: 500 }
      );
    }

    const authorization = groqApiKey.trim().toLowerCase().startsWith("bearer ")
      ? groqApiKey.trim()
      : `Bearer ${groqApiKey.trim()}`;

    const headers: Record<string, string> = {
      Authorization: authorization,
      "Content-Type": "application/json",
    };

    const modelName = model || "openai/gpt-oss-20b";
    const requestBody = {
      model: modelName,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    };

    const groqResponse = await fetch(groqApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const text = await groqResponse.text();
    const data = text ? parseJson(text) : null;

    if (!groqResponse.ok) {
      return NextResponse.json(
        { error: "GROQ request failed.", details: data || text },
        { status: groqResponse.status }
      );
    }

    const responseText = extractResponseText(data);
    // Include the provider usage object when available so the client can
    // accumulate token counts for the session.
    const usage = data && typeof data === "object" ? data.usage ?? null : null;
    return NextResponse.json({ data: responseText ?? data, usage });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error calling GROQ API.", details: String(error) },
      { status: 500 }
    );
  }
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractResponseText(data: any) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.choices?.[0]?.text) return data.choices[0].text;
  return null;
}
