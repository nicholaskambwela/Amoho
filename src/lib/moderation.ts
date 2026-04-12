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

const SELF_HARM_KEYWORDS = [
  "kill myself",
  "end my life",
  "suicide",
  "suicidal",
  "want to die",
  "don't want to live",
  "don't wanna live",
  "no reason to live",
  "better off dead",
  "take my own life",
  "end it all",
  "hurt myself",
  "self-harm",
  "self harm",
  "selfharm",
  "overdose",
  "kill meself",
  "wanna die",
  "ready to die",
  "going to kill myself",
  "planning to kill",
  "slit my wrist",
  "slit my wrists",
  "hang myself",
  "jump off",
  "jump from",
  "don't deserve to live",
  "world without me",
  "goodbye forever",
  "final goodbye",
  "can't go on",
  "give up on life",
  "no point living",
  "not worth living",
  "want to disappear",
];

const HARM_OTHERS_KEYWORDS = [
  "kill them",
  "kill him",
  "kill her",
  "murder",
  "murder them",
  "murder him",
  "murder her",
  "going to kill",
  "want to kill",
  "hurt someone",
  "hurt them",
  "hurt him",
  "hurt her",
  "revenge on",
  "make them pay",
  "make him pay",
  "make her pay",
  "destroy them",
  "destroy him",
  "destroy her",
  "get back at",
  "they will pay",
  "they deserve to die",
  "he deserve to die",
  "she deserve to die",
  "they deserve pain",
  "violence",
  "violent",
  "stab",
  "shoot them",
  "shoot him",
  "shoot her",
  "beat them up",
  "beat him up",
  "beat her up",
];

const ABUSE_KEYWORDS = [
  "abusing me",
  "abuse me",
  "sexually abused",
  "rape",
  "raped",
  "sexual assault",
  "molesting",
  "molested",
  "beating me",
  "beats me",
  "beaten by",
  "physically abused",
  "physical abuse",
  "emotional abuse",
  "verbally abused",
  "domestic violence",
  "domestic abuse",
  "forced me to",
  "forcing me to",
  "doesn't stop hitting",
  "keeps hitting",
  "choked me",
  "strangled me",
  "locked me up",
  "won't let me leave",
  "trapped me",
  "controlling me",
  "threatens me",
  "threatening me",
];

const HATE_SPEECH_KEYWORDS = [
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "kafir",
  "racist",
  "white supremacy",
  "black supremacy",
  "tribalism",
  "tribalist",
  "ethnic cleansing",
  "genocide",
  "superior race",
  "inferior race",
];

const EXPLICIT_KEYWORDS = [
  "porn",
  "pornography",
  "nudes",
  "nude pics",
  "send nudes",
  "sex video",
  "onlyfans",
  "sugar daddy",
  "sugar mummy",
  "hook up",
  "hookup for sex",
  "looking for sex",
  "sex for money",
];

const SPAM_PATTERNS = [
  "click here to earn",
  "make money fast",
  "free bitcoin",
  "crypto giveaway",
  "lottery winner",
  "you have won",
  "claim your prize",
  "subscribe to my",
  "follow me on",
  "buy now",
  "discount code",
  "promo code",
  "limited time offer",
  "act now",
  "sign up now",
  "join my channel",
  "telegram channel",
  "whatsapp group",
  "scam",
];

const HARMFUL_REPLY_PATTERNS = [
  "just get over it",
  "get over it",
  "just move on",
  "you're being dramatic",
  "you are being dramatic",
  "stop being weak",
  "man up",
  "be a man",
  "real men don't",
  "you're too sensitive",
  "you are too sensitive",
  "nobody cares",
  "no one cares",
  "stop whining",
  "stop complaining",
  "it's your fault",
  "it is your fault",
  "you brought this on yourself",
  "you deserve it",
  "you asked for it",
  "you're pathetic",
  "you are pathetic",
  "you're useless",
  "you are useless",
  "worthless",
  "kill yourself",
  "go kill yourself",
  "nobody will miss you",
  "no one will miss you",
  "just die",
  "you should die",
  "attention seeker",
  "you're faking it",
  "you are faking it",
  "not a real problem",
  "first world problems",
  "people have it worse",
  "others have it worse",
  "stop seeking attention",
];

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (!content || content.trim().length === 0) {
    return { approved: false, crisis: false, reason: "Empty content" };
  }

  const lowerContent = content.toLowerCase().trim();

  try {
    const crisisCheck = detectCrisis(lowerContent);
    if (crisisCheck.crisis) {
      return crisisCheck;
    }

    const appropriatenessCheck = checkAppropriateness(lowerContent);
    return appropriatenessCheck;

  } catch (error) {
    console.error("Moderation error, defaulting to pending:", error);
    return {
      approved: false,
      crisis: false,
      reason: "Moderation check failed. Pending admin review.",
    };
  }
}

function detectCrisis(content: string): ModerationResult {
  for (const keyword of SELF_HARM_KEYWORDS) {
    if (content.includes(keyword)) {
      return buildCrisisResponse("self_harm", keyword);
    }
  }

  for (const keyword of HARM_OTHERS_KEYWORDS) {
    if (content.includes(keyword)) {
      return buildCrisisResponse("harm_others", keyword);
    }
  }

  for (const keyword of ABUSE_KEYWORDS) {
    if (content.includes(keyword)) {
      return buildCrisisResponse("abuse", keyword);
    }
  }

  return { approved: false, crisis: false };
}

function buildCrisisResponse(
  type: "self_harm" | "harm_others" | "abuse",
  matchedKeyword: string
): ModerationResult {
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

  const typeDescriptions: Record<string, string> = {
    self_harm: "Message may indicate self-harm or suicidal thoughts",
    harm_others: "Message may indicate intent to harm others",
    abuse: "Message may indicate ongoing abuse",
  };

  return {
    approved: false,
    crisis: true,
    crisisType: type,
    reason: `${typeDescriptions[type]} (matched: "${matchedKeyword}")`,
    helplines,
  };
}

function checkAppropriateness(content: string): ModerationResult {
  for (const keyword of HATE_SPEECH_KEYWORDS) {
    if (content.includes(keyword)) {
      return {
        approved: false,
        crisis: false,
        reason: `Flagged for potential hate speech (matched: "${keyword}")`,
      };
    }
  }

  for (const keyword of EXPLICIT_KEYWORDS) {
    if (content.includes(keyword)) {
      return {
        approved: false,
        crisis: false,
        reason: `Flagged for inappropriate content (matched: "${keyword}")`,
      };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (content.includes(pattern)) {
      return {
        approved: false,
        crisis: false,
        reason: `Flagged as potential spam (matched: "${pattern}")`,
      };
    }
  }

  for (const pattern of HARMFUL_REPLY_PATTERNS) {
    if (content.includes(pattern)) {
      return {
        approved: false,
        crisis: false,
        reason: `Flagged for potentially harmful response (matched: "${pattern}")`,
      };
    }
  }

  // Check for excessive links (spam)
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount >= 3) {
    return {
      approved: false,
      crisis: false,
      reason: `Flagged: contains ${linkCount} links (potential spam)`,
    };
  }

  // Check for excessive CAPS (shouting/spam)
  const words = content.split(/\s+/);
  const capsWords = words.filter((word) => word.length > 3 && word === word.toUpperCase());
  const capsRatio = words.length > 0 ? capsWords.length / words.length : 0;
  if (capsRatio > 0.5 && words.length > 5) {
    return {
      approved: false,
      crisis: false,
      reason: "Flagged: excessive capitalization (potential spam)",
    };
  }

  // CLEAN content — auto-approve!
  return { approved: true, crisis: false };
}
