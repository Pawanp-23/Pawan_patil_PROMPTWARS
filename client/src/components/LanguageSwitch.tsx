import { LANGUAGE_PROFILES, LANGUAGES, type Language } from '../../../shared/languages';

interface Props {
  value: Language;
  onChange: (language: Language) => void;
}

/** Picks the language BlindSpot listens, thinks and speaks in. */
export function LanguageSwitch({ value, onChange }: Props) {
  return (
    <div className="lang-switch" role="group" aria-label="Conversation language">
      <span className="mono muted lang-label" aria-hidden="true">
        Talk in
      </span>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={LANGUAGE_PROFILES[language].speechTag}
          className={`lang-option${language === value ? ' is-active' : ''}`}
          aria-pressed={language === value}
          onClick={() => onChange(language)}
        >
          {LANGUAGE_PROFILES[language].label}
        </button>
      ))}
    </div>
  );
}
