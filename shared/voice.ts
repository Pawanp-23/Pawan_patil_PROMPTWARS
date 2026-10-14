import { LANGUAGE_PROFILES } from './languages.js';

/** First line the voice agent says (English); shared so client and server stay in sync. */
export const OPENING_LINE = LANGUAGE_PROFILES.en.opening;

/** Said when the interview has enough to analyze (English). */
export const CLOSING_LINE = LANGUAGE_PROFILES.en.closing;

/**
 * Instant acknowledgements played the moment the user stops talking, while the next
 * question is generated. Neutral by design: they never react to which option is better.
 */
export const FILLERS = LANGUAGE_PROFILES.en.fillers;
