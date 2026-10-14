/** Languages BlindSpot can listen, think and speak in. */
export const LANGUAGES = ['en', 'hi', 'mr'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface LanguageProfile {
  /** Shown on the language switch, in its own script. */
  label: string;
  /** BCP 47 tag for speech recognition and the browser voice. */
  speechTag: string;
  /** Extra system-prompt rule so the model answers in this language. Empty for English. */
  instruction: string;
  opening: string;
  closing: string;
  /** Instant acknowledgements while the next question is generated. Neutral by design. */
  fillers: string[];
  /** Asked when the model's reply is missing or tries to steer the decision. */
  fallbackQuestion: string;
  /** Said when the interview hits its turn limit before everything is known. */
  ranOut: string;
  /** Shown under the orb before the conversation starts. */
  hint: string;
  /** Placeholder for the first typed answer. */
  placeholder: string;
}

const indianLanguageRule = (name: string, address: string, banned: string) =>
  `Language: write every "insight", "question" and "reply" in natural, spoken ${name} (Devanagari script), the way a friendly college senior talks.
Address the user as ${address}: warm and respectful, never rude or stiff.
Everyday English words students use (internship, placement, semester, stipend, branch) can stay in English.
Quotes must still be copied exactly as the user wrote them, in whatever language or script they used.
JSON keys, ids, "area" and "bias" values stay in English.
Never use prescriptive ${name} phrasing such as ${banned}.`;

export const LANGUAGE_PROFILES: Record<Language, LanguageProfile> = {
  en: {
    label: 'English',
    speechTag: 'en-IN',
    instruction: '',
    opening: 'Hey! I’m BlindSpot. So, what decision is living rent-free in your head right now?',
    closing: 'Love it, that’s plenty to work with. Let’s go find what you’re not seeing.',
    fillers: ['Ooh, okay.', 'Mm, got it.', 'Okay, okay.', 'Right, hold that thought.'],
    fallbackQuestion: 'Okay, real talk: what’s actually pulling you toward that side?',
    ranOut: 'Let’s fill in the rest together on the page.',
    hint: 'Calm and curious. Talk it through in about a minute.',
    placeholder: 'Or type: “I got an internship offer…”',
  },
  hi: {
    label: 'हिन्दी',
    speechTag: 'hi-IN',
    instruction: indianLanguageRule(
      'Hindi',
      '"तुम" (never "तू", and not the formal "आप")',
      '"चाहिए", "मेरी सलाह", "सबसे अच्छा विकल्प", "सही फ़ैसला"',
    ),
    opening: 'हाय! मैं BlindSpot हूँ। तो बताओ, कौन सा फ़ैसला आजकल दिमाग़ में घर करके बैठा है?',
    closing: 'बढ़िया, इतना काफ़ी है। चलो, देखते हैं तुम क्या नहीं देख पा रहे।',
    fillers: ['अच्छा, ठीक है।', 'हम्म, समझ गया।', 'ओके, ओके।', 'रुको, ये बात याद रखते हैं।'],
    fallbackQuestion: 'अच्छा, सच-सच बताओ: उस तरफ़ तुम्हें असल में क्या खींच रहा है?',
    ranOut: 'बाक़ी हम पेज पर साथ में भर लेते हैं।',
    hint: 'हिन्दी हो या Hinglish, जैसे चाहो बोलो। बस एक मिनट लगेगा।',
    placeholder: 'या लिखो: “मुझे इंटर्नशिप का ऑफ़र मिला है…”',
  },
  mr: {
    label: 'मराठी',
    speechTag: 'mr-IN',
    instruction: indianLanguageRule(
      'Marathi',
      '"तू", the friendly form',
      '"पाहिजे", "करावे", "माझा सल्ला", "सर्वोत्तम पर्याय"',
    ),
    opening: 'हाय! मी BlindSpot. मग सांग, सध्या कोणता निर्णय डोक्यात घर करून बसलाय?',
    closing: 'मस्त, एवढं पुरेसं आहे. चल, बघूया तुला काय दिसत नाहीये.',
    fillers: ['अच्छा, ठीक आहे.', 'हम्म, कळलं.', 'ओके, ओके.', 'थांब, हा मुद्दा लक्षात ठेवूया.'],
    fallbackQuestion: 'खरं सांग, त्या बाजूला तुला नेमकं काय ओढतंय?',
    ranOut: 'बाकीचं आपण पेजवर एकत्र भरूया.',
    hint: 'मराठीत मोकळेपणाने बोल. फक्त एक मिनिट लागेल.',
    placeholder: 'किंवा लिही: “मला इंटर्नशिपची ऑफर आली आहे…”',
  },
};

/** Profile for a language, defaulting to English. */
export const profileFor = (language: Language = 'en'): LanguageProfile =>
  LANGUAGE_PROFILES[language];

/** Appends the language rule to a system prompt (unchanged for English). */
export const withLanguage = (systemPrompt: string, language: Language = 'en'): string => {
  const { instruction } = profileFor(language);
  return instruction ? `${systemPrompt}\n\n${instruction}` : systemPrompt;
};
