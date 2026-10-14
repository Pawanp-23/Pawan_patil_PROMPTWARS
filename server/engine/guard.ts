import type { Finding } from '../../shared/schema.js';

/**
 * Phrases that would turn BlindSpot from a thinking companion into a decision-maker.
 * The problem statement forbids deciding for the user, so this is enforced in code,
 * not just requested in the prompt.
 */
const RECOMMENDATION_PATTERNS: readonly RegExp[] = [
  /\byou should\b/i,
  /\byou must\b/i,
  /\byou need to\b/i,
  /\bi (?:would |strongly )?(?:recommend|suggest|advise)\b/i,
  /\bmy (?:recommendation|advice|suggestion)\b/i,
  /\b(?:the )?best (?:option|choice|decision|path)\b/i,
  /\bthe right (?:choice|decision|option|call)\b/i,
  /\bgo (?:with|for) (?:it|the|option)\b/i,
  /\b(?:definitely|clearly|obviously) (?:accept|take|choose|pick|decline|reject|skip)\b/i,
  /\byou(?:'d| would) be better off\b/i,
  /\bdon'?t (?:accept|take|choose|do) it\b/i,

  // Hindi (Devanagari; \b does not work on it): "you should…", "my advice", "best/right choice".
  /(?:आपको|आप को|तुम्हें|तुमको|तुम को)[^?।.!]{0,40}चाहिए/,
  /(?:मैं|हम)[^?।.!]{0,15}(?:सलाह|सुझाव|सिफ़ारिश|सिफारिश) (?:दूँगा|दूंगा|दूँगी|दूंगी|देता|देती|देते)/,
  /मेरी (?:सलाह|राय|सिफ़ारिश|सिफारिश)/,
  /सबसे (?:अच्छा|बढ़िया|बेहतर) (?:विकल्प|फ़ैसला|फैसला|रास्ता|ऑप्शन)/,
  /सही (?:फ़ैसला|फैसला|निर्णय|विकल्प|चुनाव) (?:यही|यह|ये|होगा|है)/,
  /(?:ज़रूर|जरूर|बिल्कुल) (?:ले लो|ले लें|मान लो|स्वीकार करो|स्वीकार करें|छोड़ दो|मना कर दो)/,

  // Marathi (Devanagari): "you should…", "my advice", "best/right choice".
  /(?:तुम्ही|तू|तुला|तुम्हाला)[^?।.!]{0,40}(?:पाहिजे|करावे|करावं|घ्यावे|घ्यावं|स्वीकारावे|स्वीकारावं)/,
  /माझा (?:सल्ला|सूचना)/,
  /मी[^?।.!]{0,15}(?:सुचवतो|सुचवते|सुचवेन|सल्ला देतो|सल्ला देते)/,
  /(?:सर्वोत्तम|सगळ्यात चांगला|सर्वात चांगला) (?:पर्याय|निर्णय|मार्ग)/,
  /योग्य (?:निर्णय|पर्याय) (?:हाच|हा|आहे|ठरेल)/,

  // Hinglish (romanised): "aapko … chahiye", "meri salah", "best option yahi hai".
  /\b(?:aapko|apko|tumhe|tumko)\b[^?.!]{0,40}\bchahiye\b/i,
  /\bmeri (?:salah|raay|rai)\b/i,
  /\b(?:sabse accha|best) option (?:yahi|yehi|ye|yeh) hai\b/i,
];

/** True when the text recommends, ranks, or prescribes a choice. */
export function containsRecommendation(text: string): boolean {
  return RECOMMENDATION_PATTERNS.some((pattern) => pattern.test(text));
}

/** Removes only the offending sentences, keeping the neutral rest of the insight. */
export function stripRecommendations(text: string): string {
  // Hindi and Marathi can end a sentence with a danda (।) as well as . ! ?
  const sentences = text.match(/[^.!?।]+[.!?।]*/g) ?? [];
  return sentences
    .filter((sentence) => !containsRecommendation(sentence))
    .join('')
    .trim();
}

export interface GuardResult {
  findings: Finding[];
  blockedCount: number;
}

/**
 * Enforces the "never decide" rule on model output.
 * - A question that prescribes a choice, or is not actually a question, drops the finding.
 * - Prescriptive sentences inside an insight are removed.
 */
export function guardFindings(findings: Finding[]): GuardResult {
  let blockedCount = 0;
  const safe: Finding[] = [];

  for (const finding of findings) {
    const question = finding.question.trim();
    if (!question.endsWith('?') || containsRecommendation(question)) {
      blockedCount += 1;
      continue;
    }
    const insight = stripRecommendations(finding.insight);
    if (insight !== finding.insight.trim()) blockedCount += 1;
    safe.push({ ...finding, question, insight });
  }

  return { findings: safe, blockedCount };
}
