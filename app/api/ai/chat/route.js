// app/api/ai/chat/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body?.messages) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const resp = await fetch("https://api.thirdweb.com/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY, // ✅ go back to secret key
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
