import { describe, expect, it } from 'vitest';
import { containsRecommendation, guardFindings, stripRecommendations } from '../engine/guard.js';
import type { Finding } from '../../shared/schema.js';

const finding = (overrides: Partial<Finding>): Finding => ({
  id: 'f1',
  type: 'overlooked',
  area: 'academics',
  insight: 'This overlaps with your semester.',
  question: 'How will you manage exams?',
  ...overrides,
});

describe('containsRecommendation', () => {
  it.each([
    'You should accept the offer.',
    'I recommend declining.',
    'I would suggest taking it.',
    'This is clearly the best option.',
    'Taking it is the right choice.',
    'Just go with the internship.',
    "You'd be better off waiting.",
    'Definitely accept it.',
  ])('flags prescriptive text: %s', (text) => {
    expect(containsRecommendation(text)).toBe(true);
  });

  it.each([
    'How will you manage exams?',
    'What would change your mind?',
    'Who else is affected by this choice?',
  ])('allows neutral questions: %s', (text) => {
    expect(containsRecommendation(text)).toBe(false);
  });
});

describe('containsRecommendation in Indian languages', () => {
  it.each([
    'आपको यह इंटर्नशिप ले लेनी चाहिए।',
    'तुम्हें ऑफ़र ठुकरा देना चाहिए।',
    'मेरी सलाह है कि कॉलेज पर ध्यान दो।',
    'यही सबसे अच्छा विकल्प है।',
    'इंटर्नशिप लेना ही सही फ़ैसला होगा।',
    'ज़रूर ले लो, मौका बार-बार नहीं आता।',
    'तुम्ही ही इंटर्नशिप स्वीकारावी पाहिजे.',
    'तू कॉलेजवर लक्ष द्यावं, असं मला वाटतं; तुला ते करावं लागेल.',
    'माझा सल्ला असा आहे की थांब.',
    'हा सर्वोत्तम पर्याय आहे.',
    'Aapko internship le leni chahiye.',
    'Meri salah hai ki offer lo.',
  ])('flags prescriptive text: %s', (text) => {
    expect(containsRecommendation(text)).toBe(true);
  });

  it.each([
    'सेमेस्टर की परीक्षाओं के दौरान रोज़ 10 से 6 का काम कैसे चलेगा?',
    'इस फ़ैसले से घर में और किस पर असर पड़ेगा?',
    'तुम्हें किस बात की सबसे ज़्यादा चिंता है?',
    'डिसेंबरच्या परीक्षांच्या वेळी हे वेळापत्रक कसं जमेल?',
    'या निर्णयाचा तुझ्या घरच्यांवर काय परिणाम होईल?',
    'Agar exams aur internship dono saath chale, toh kya hoga?',
  ])('allows neutral questions: %s', (text) => {
    expect(containsRecommendation(text)).toBe(false);
  });
});

describe('stripRecommendations', () => {
  it('removes only the prescriptive Hindi sentence, split on the danda', () => {
    expect(stripRecommendations('काम के घंटे लंबे हैं। आपको ऑफ़र ले लेना चाहिए।')).toBe(
      'काम के घंटे लंबे हैं।',
    );
  });

  it('removes only the prescriptive sentence', () => {
    expect(stripRecommendations('The hours are long. You should decline.')).toBe(
      'The hours are long.',
    );
  });
});

describe('guardFindings', () => {
  it('keeps neutral findings untouched', () => {
    const result = guardFindings([finding({})]);
    expect(result.findings).toHaveLength(1);
    expect(result.blockedCount).toBe(0);
  });

  it('drops findings whose question prescribes a choice', () => {
    const result = guardFindings([finding({ question: 'Why not just go with the internship?' })]);
    expect(result.findings).toHaveLength(0);
    expect(result.blockedCount).toBe(1);
  });

  it('drops findings whose question is not a question', () => {
    const result = guardFindings([finding({ question: 'Think about exams.' })]);
    expect(result.findings).toHaveLength(0);
  });

  it('strips prescriptive sentences from insights', () => {
    const result = guardFindings([finding({ insight: 'Hours are long. I recommend declining.' })]);
    expect(result.findings[0].insight).toBe('Hours are long.');
    expect(result.blockedCount).toBe(1);
  });
});
