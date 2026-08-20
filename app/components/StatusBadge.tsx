import type { ProjectStatus } from '@/lib/projects';
import type { Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';

function statusLabel(locale: Locale, status: ProjectStatus): string {
  return t(locale, `status.${status}`);
}

const STATUS_CLASS: Record<ProjectStatus, string> = {
  live: 'status-dot status-dot--live',
  'im-aufbau': 'status-dot status-dot--build',
  wartung: 'status-dot status-dot--wartung',
  pivot: 'status-dot status-dot--pivot',
};

export function StatusBadge({
  status,
  locale,
  suffix,
}: {
  status: ProjectStatus;
  locale: Locale;
  suffix?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={STATUS_CLASS[status]} aria-hidden />
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
        {statusLabel(locale, status)}
        {suffix ? ` · ${suffix}` : ''}
      </span>
    </span>
  );
}

export function StatusDot({ status }: { status: ProjectStatus }) {
  return <span className={STATUS_CLASS[status]} aria-hidden />;
}

const CHIP_CLASS: Record<ProjectStatus, string> = {
  live: 'border-term/40 bg-term/10 text-term',
  'im-aufbau': 'border-accent/40 bg-accent/10 text-accent',
  wartung: 'border-accent/30 bg-accent/5 text-accent/80',
  pivot: 'border-border bg-bg/40 text-muted',
};

export function StatusChip({ status, locale }: { status: ProjectStatus; locale: Locale }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest ${CHIP_CLASS[status]}`}
    >
      <span className={STATUS_CLASS[status]} aria-hidden />
      {statusLabel(locale, status)}
    </span>
  );
}
