import { CRISIS_LINE, HELPLINES } from "./helplines";

export interface ModerationResult {
  approved: boolean;
  crisis: boolean;
  crisisType?: "self_harm" | "harm_others" | "abuse";
  reason?: string;
  helplines?: HelplineInfo[];
}

export interface HelplineInfo {
  name: string;
  phone: string;
  type: string;
  city: string;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (!content || content.trim().length === 0) {
    return { approved: false, crisis: false, reason: "Empty content" };
  }

  try {
    const crisisCheck = await detectCrisis(content);
    if (crisisCheck.crisis) {
      return crisisCheck;
    }

    const appropriatenessCheck = await checkAppropriateness(content);
    return appropriatenessCheck;

  } catch (error) {
    console.error("Moderation AI error, defaulting to pending:", error);
    return {
      approved: false,
      crisis: false,
      reason: "Moderation service unavailable. Pending admin review.",
    };
  }
}

async function detectCrisis(content: string): Promise<ModerationResult> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a crisis detection AI for a mental health support community in Zambia. 
Your ONLY job is to detect if the person writing is in immediate danger.

You must respond with EXACTLY one of these JSON objects, nothing else:

{"crisis": false}

{"crisis": true, "type": "self_harm", "reason": "brief explanation"}

{"crisis": true, "type": "harm_others", "reason": "brief explanation"}

{"crisis": true, "type": "abuse", "reason": "brief explanation"}

Rules:
- "self_harm": The person is talking about hurting themselves, suicide, self-injury, or feeling like they want to die
- "harm_others": The person is threatening to hurt someone else or expressing violent intentions
- "abuse": The person is describing ongoing physical, sexual, or severe emotional abuse
- IMPORTANT: Someone expressing sadness, depression, loneliness, or grief is NOT a crisis — those are normal mental health struggles that should NOT be flagged
- Someone saying "I feel lost" or "life is hard" is NOT self-harm
- Only flag if there are clear indicators of immediate danger or ongoing abuse

Respond with ONLY the JSON object. No other text.`,
      },
      {
        role: "user",
        content: content.substring(0, 1000),
      },
    ],
  });

  const responseText = response.choices[0]?.message?.content?.trim() || "";

  try {
    const result = JSON.parse(responseText);

    if (result.crisis === true) {
      const helplines: HelplineInfo[] = [];

      helplines.push({
        name: CRISIS_LINE.name,
        phone: CRISIS_LINE.phone,
        type: "Crisis Line",
        city: "Nationwide",
      });

      for (const h of HELPLINES) {
        if (h.phones.length > 0) {
          helplines.push({
            name: h.name,
            phone: h.phones[0],
            type: h.type,
            city: h.city,
          });
        }
      }

      return {
        approved: false,
        crisis: true,
        crisisType: result.type,
        reason: result.reason,
        helplines,
      };
    }

    return { approved: false, crisis: false };
  } catch {
    return { approved: false, crisis: false };
  }
}

async function checkAppropriateness(content: string): Promise<ModerationResult> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a content moderator for a mental health support community in Zambia called Amoho.

Your job is to check if a message is appropriate for the community.

Rules for APPROVAL (approved: true):
- Genuine sharing of struggles, feelings, or experiences
- Supportive, encouraging, or empathetic replies
- Questions about mental health or seeking advice
- Posts about anxiety, depression, grief, loneliness, stress, etc.
- Personal stories and experiences
- Encouraging someone to seek professional help
- Normal mental health discussions

Rules for FLAGGING (approved: false):
- Hate speech, discrimination, or prejudice
- Graphic descriptions of violence, self-harm methods, or abuse
- Promotional content, spam, or advertisements
- Dismissive replies like "just get over it" or "you're being dramatic"
- Blaming victims or gaslighting
- Sharing illegal content
- Sexually explicit content unrelated to mental health

You must respond with EXACTLY this JSON format, nothing else:

{"approved": true}

{"approved": false, "reason": "brief reason for flagging"}

Be generous with approval. This is a support community where people share difficult feelings. 
Only flag content that is genuinely harmful, hateful, or inappropriate.

Respond with ONLY the JSON object. No other text.`,
      },
      {
        role: "user",
        content: content.substring(0, 1000),
      },
    ],
  });

  const responseText = response.choices[0]?.message?.content?.trim() || "";

  try {
    const result = JSON.parse(responseText);

    if (result.approved === true) {
      return { approved: true, crisis: false };
    }

    return {
      approved: false,
      crisis: false,
      reason: result.reason || "Flagged by moderation",
    };
  } catch {
    return {
      approved: false,
      crisis: false,
      reason: "Could not analyze content. Pending admin review.",
    };
  }
}
