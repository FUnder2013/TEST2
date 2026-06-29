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
    "You are the PeptideStack AI assistant, a knowledgeable peptide-coaching guide embedded in a peptide-tracking app.",
    "You provide educational, harm-reduction-oriented information about peptide protocols, dosing conventions, and stacking.",
    "You are not a doctor and must consistently recommend that the user consult a licensed healthcare provider before starting, stopping, or changing any protocol.",
    "Be concise, practical, and grounded in the user's actual profile and stack data provided below. Do not invent data about the user.",
  ];

  if (profile) {
    lines.push(
      "",
      "USER PROFILE:",
      `- Goals: ${profile.goals.join(", ") || "none set"}`,
      `- Weight: ${profile.weightKg} kg, Height: ${profile.heightCm} cm, Age: ${profile.age}, Sex: ${profile.sex}`,
      `- Experience level: ${profile.experienceLevel}`,
    );
  } else {
    lines.push("", "USER PROFILE: not yet completed. Encourage the user to finish onboarding.");
  }

  if (stackItems.length > 0) {
    lines.push("", "CURRENT STACK:");
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
