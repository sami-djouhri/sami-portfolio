import { t } from '@/lib/i18n/dict';
import type { Locale } from '@/lib/i18n/config';

export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a href="#main" className="skip-link">
      {t(locale, 'skip.toContent')}
    </a>
  );
}
