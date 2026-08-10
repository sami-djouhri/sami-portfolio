'use client';

import { useState } from 'react';

import type { Message } from '@/lib/store';
import { WindowBar } from '../../components/Terminal';
import { deleteMessageAction, markMessageAction } from '../actions';

const STATUS_TONE: Record<Message['status'], string> = {
  neu: 'border-term/40 bg-term/10 text-term',
  gelesen: 'border-accent/40 bg-accent/10 text-accent',
  erledigt: 'border-border bg-bg/40 text-muted',
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Absenderadresse aus dem entschlüsselten Klartextblock ziehen (für „Antworten"). */
function extractEmail(text: string): string | null {
  const m = text.match(/E-Mail:\s*([^\s<>]+@[^\s<>]+)/);
  return m?.[1] ?? null;
}

/**
 * Repariert einen eingefügten ASCII-Armor-Private-Key. Handy-/SSH-Terminals zerstören
 * beim Kopieren regelmäßig die Zeilenstruktur (Umbrüche → Spaces/Tabs, führende Spaces,
 * alles auf einer Zeile) → openpgp.readPrivateKey scheitert dann mit „ungültig", obwohl
 * das Schlüsselmaterial korrekt ist. Wir rekonstruieren den Armor aus BEGIN/END-Marker
 * plus reinem Base64-Body (CRC-24 = letzte „=XXXX"). Empirisch gegen die typischen
 * Copy-Schäden verifiziert; unversehrter Input bleibt unverändert gültig.
 */
function normalizeArmoredKey(input: string): string {
  const s = String(input).replace(/\r\n?/g, '\n');
  const begin = s.match(/-----BEGIN PGP [A-Z ]*?KEY BLOCK-----/);
  const end = s.match(/-----END PGP [A-Z ]*?KEY BLOCK-----/);
  if (!begin || !end) return input;
  const inner = s.slice(s.indexOf(begin[0]) + begin[0].length, s.indexOf(end[0]));
  const body = inner.replace(/[^A-Za-z0-9+/=]/g, '');
  if (body.length < 6) return input;
  const crc = body.slice(-5); // GnuPG hängt die CRC-24 als „=XXXX" an
  const payload = body.slice(0, -5);
  const wrapped = payload.replace(/.{1,64}/g, '$&\n').trimEnd();
  return `${begin[0]}\n\n${wrapped}\n${crc}\n${end[0]}\n`;
}

export default function Posteingang({ messages }: { messages: Message[] }) {
  const unread = messages.filter((m) => m.status === 'neu').length;
  const encryptedCount = messages.filter((m) => m.encrypted).length;

  // Der private Schlüssel wird AUSSCHLIESSLICH im Browser gehalten (State, kein
  // sessionStorage, nie zum Server gesendet) und nach dem Entsperren wieder verworfen.
  const [privKey, setPrivKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function unlock() {
    setBusy(true);
    setError('');
    try {
      const openpgp = await import('openpgp');
      const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
      // Schritt 1 — Key-Block (Armor) lesen. Getrennte, konkrete Fehlermeldung, damit
      // klar ist, OB der Schlüssel oder die Passphrase das Problem ist.
      let parsed;
      try {
        parsed = await openpgp.readPrivateKey({ armoredKey: normalizeArmoredKey(privKey) });
      } catch (e) {
        setError(
          'Schlüssel-Block unlesbar — bitte den KOMPLETTEN Block markieren: von „-----BEGIN PGP PRIVATE KEY BLOCK-----" ' +
          'bis inklusive „-----END PGP PRIVATE KEY BLOCK-----" (beide Randzeilen mit allen Bindestrichen). [' + msg(e) + ']',
        );
        return;
      }
      // Schritt 2 — mit Passphrase entsperren. Getrimmt nachversuchen (Handy hängt gern
      // Whitespace an); eigene Fehlermeldung mit dem echten openpgp-Grund.
      let privateKey;
      try {
        privateKey = await openpgp.decryptKey({ privateKey: parsed, passphrase });
      } catch {
        try {
          privateKey = await openpgp.decryptKey({ privateKey: parsed, passphrase: passphrase.trim() });
        } catch (e) {
          setError(
            'Schlüssel ok, aber die Passphrase passt nicht. Sonderzeichen/Autokorrektur auf dem Handy? ' +
            'Passphrase am besten aus Vaultwarden einfügen statt tippen. [' + msg(e) + ']',
          );
          return;
        }
      }
      const out: Record<string, string> = {};
      let anyOk = false;
      for (const m of messages) {
        if (!m.encrypted) continue;
        try {
          const message = await openpgp.readMessage({ armoredMessage: m.encrypted });
          const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey });
          out[m.id] = typeof data === 'string' ? data : String(data);
          anyOk = true;
        } catch {
          out[m.id] = '(Entschlüsselung dieser Nachricht fehlgeschlagen)';
        }
      }
      if (!anyOk && encryptedCount > 0) {
        setError('Kein Eintrag ließ sich entschlüsseln — passt der Schlüssel zu diesem Postfach?');
        return;
      }
      setDecrypted(out);
      setUnlocked(true);
      // Schlüsselmaterial nach Gebrauch aus dem Speicher nehmen.
      setPrivKey('');
      setPassphrase('');
    } catch (e) {
      setError('Unerwarteter Fehler beim Entsperren. [' + (e instanceof Error ? e.message : String(e)) + ']');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        mail -i posteingang
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">Posteingang</h1>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-dim">
          {messages.length} gesamt · {unread} neu
          {encryptedCount > 0 ? ` · ${encryptedCount} verschlüsselt` : ''}
        </span>
      </div>

      {/* Entsperr-Panel: nur wenn es verschlüsselte Anfragen gibt und noch nicht entsperrt. */}
      {encryptedCount > 0 && !unlocked && (
        <div className="mt-6 overflow-hidden rounded-lg border border-accent/30 bg-surface/40">
          <WindowBar title="~/posteingang/entschluesseln" />
          <div className="space-y-3 p-5 sm:p-6">
            <p className="text-sm text-muted">
              Anfragen liegen PGP-verschlüsselt vor. Der private Schlüssel wird nur hier im
              Browser verarbeitet und nie an den Server gesendet.
            </p>
            <textarea
              value={privKey}
              onChange={(e) => setPrivKey(e.target.value)}
              rows={4}
              spellCheck={false}
              placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus:border-accent/60 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Passphrase"
                autoComplete="off"
                className="flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus:border-accent/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={unlock}
                disabled={busy || !privKey || !passphrase}
                className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:cursor-default disabled:opacity-40"
              >
                {busy ? 'entschlüssele…' : 'entsperren'}
              </button>
            </div>
            {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="mt-10 overflow-hidden rounded-lg border border-dashed border-border bg-surface/30">
          <WindowBar title="~/posteingang" />
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl text-text">Noch keine Nachrichten.</p>
            <p className="mt-2 text-sm text-muted">
              Anfragen über das Kontaktformular landen ab jetzt hier.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((m) => {
            const plain = m.encrypted ? decrypted[m.id] : m.message;
            const replyEmail = m.encrypted
              ? (plain ? extractEmail(plain) : null)
              : m.email;
            return (
              <li
                key={m.id}
                className={`overflow-hidden rounded-lg border bg-surface/50 ${
                  m.status === 'neu' ? 'border-term/30' : 'border-border'
                }`}
              >
                <WindowBar
                  title={`~/posteingang/${m.id.slice(0, 8)}`}
                  right={
                    <span className="flex items-center gap-2">
                      {m.encrypted && (
                        <span className="rounded-md border border-accent/30 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-accent/80">
                          🔒 pgp
                        </span>
                      )}
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest ${STATUS_TONE[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </span>
                  }
                />
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-display text-xl leading-tight text-text">
                      {m.encrypted ? 'Verschlüsselte Anfrage' : m.subject || '(ohne Betreff)'}
                    </h2>
                    <span className="font-mono text-xs text-muted-dim">{fmtDate(m.received_at)}</span>
                  </div>

                  {!m.encrypted && (
                    <p className="mt-2 font-mono text-xs text-muted">
                      <span className="text-muted-dim">von </span>
                      <span className="text-text/90">{m.name}</span>{' '}
                      <a href={`mailto:${m.email}`} className="text-accent hover:underline">
                        &lt;{m.email}&gt;
                      </a>
                    </p>
                  )}

                  {m.encrypted && !plain ? (
                    <p className="mt-4 font-mono text-sm text-muted-dim">
                      🔒 Inhalt verschlüsselt — oben mit dem privaten Schlüssel entsperren.
                    </p>
                  ) : (
                    <pre className="mt-4 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-text/90">
                      {plain}
                    </pre>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                    <StatusButton id={m.id} status="gelesen" label="gelesen" disabled={m.status === 'gelesen'} />
                    <StatusButton id={m.id} status="erledigt" label="erledigt" disabled={m.status === 'erledigt'} />
                    <StatusButton id={m.id} status="neu" label="als neu" disabled={m.status === 'neu'} />
                    {replyEmail && (
                      <a
                        href={`mailto:${replyEmail}?subject=${encodeURIComponent('Re: Deine Anfrage')}`}
                        className="ml-auto rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
                      >
                        Antworten →
                      </a>
                    )}
                    <form action={deleteMessageAction} className={replyEmail ? '' : 'ml-auto'}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim transition-colors hover:border-border-strong hover:text-text"
                      >
                        löschen
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  disabled,
}: {
  id: string;
  status: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <form action={markMessageAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md border border-border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
      >
        {label}
      </button>
    </form>
  );
}
