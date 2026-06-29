import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

const MODEL = "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI assistant not configured. Set ANTHROPIC_API_KEY to enable the assistant.",
      },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const [profile, stackItems] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.stackItem.findMany({
      where: { userId: session.user.id },
      include: { peptide: true },
    }),
  ]);

  const systemPrompt = buildSystemPrompt(profile, stackItems);

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json(
      { error: "The AI assistant is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}

type ProfileLike = {
  goals: string[];
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  experienceLevel: string;
} | null;

type StackItemLike = {
  status: string;
  peptide: { name: string; frequency: string; cycleWeeksMin: number; cycleWeeksMax: number };
};

function buildSystemPrompt(profile: ProfileLike, stackItems: StackItemLike[]): string {
  const lines: string[] = [
    "You are an educational research assistant embedded in a peptide/GLP-1 tracking app. Answer general, factual questions about peptides, GLP-1/GIP agonists, growth secretagogues, and recovery compounds: mechanisms of action, half-lives, research status, and general literature context.",
    "Hard rules:",
    "- Never give a specific dosing recommendation (amounts, schedules, titration) for the person asking.",
    "- Never tell the person what to take, skip, increase, decrease, or combine for their own protocol.",
    "- Never interpret or diagnose a symptom the person describes.",
    "- If asked for any of the above, briefly decline and suggest they discuss it with a licensed provider, then still offer relevant general/educational context if there is any.",
    "- Keep answers concise (under 150 words), neutral, and clearly framed as general research information, not medical advice.",
    "- Do not invent facts about the user; only reference the profile/stack data given below if relevant to the question.",
  ];

  if (profile) {
    lines.push(
      "",
      "USER PROFILE (context only, not for dosing advice):",
      `- Goals: ${profile.goals.join(", ") || "none set"}`,
      `- Weight: ${profile.weightKg} kg, Height: ${profile.heightCm} cm, Age: ${profile.age}, Sex: ${profile.sex}`,
      `- Experience level: ${profile.experienceLevel}`,
    );
  } else {
    lines.push("", "USER PROFILE: not yet completed. Encourage the user to finish onboarding.");
  }

  if (stackItems.length > 0) {
    lines.push("", "CURRENT STACK (context only, not for dosing advice):");
    for (const item of stackItems) {
      lines.push(
        `- ${item.peptide.name} (${item.status}), typical frequency ${item.peptide.frequency}, typical cycle ${item.peptide.cycleWeeksMin}-${item.peptide.cycleWeeksMax} weeks`,
      );
    }
  } else {
    lines.push("", "CURRENT STACK: empty.");
  }

  return lines.join("\n");
}
