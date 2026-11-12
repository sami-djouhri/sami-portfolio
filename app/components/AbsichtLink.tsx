'use client';

/**
 * `Link`, der erst bei Absicht vorlaedt: Zeiger darueber, Finger darauf oder
 * Tastaturfokus. Fuer Raster mit vielen Verweisen (Werkfeld der Startseite,
 * Werkliste auf /projekte), Muster aus der Next-Doku
 * (`docs/01-app/02-guides/prefetching.md`, „Hover-triggered prefetch").
 *
 * Anlass (2026-11-01): fuer statische Seiten laedt `Link` die Zielseite
 * VOLLSTAENDIG vor, sobald der Verweis sichtbar wird. Wer am Handy durch die
 * 25 Werk-Zellen scrollt, holte so nebenbei bis zu rund 350 KB (gzip) an
 * Fallstudien, von denen er meist keine oeffnet. Mit dieser Huelle kostet eine
 * Fallstudie erst etwas, wenn jemand sie ansteuert; die Beruehrung am Handy
 * liegt rund 100 ms vor dem Klick und reicht fuer die eine Seite.
 */
import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

export function AbsichtLink(props: ComponentProps<typeof Link>) {
  const [absicht, setAbsicht] = useState(false);
  const { onMouseEnter, onTouchStart, onFocus, ...rest } = props;
  return (
    <Link
      {...rest}
      prefetch={absicht ? null : false}
      onMouseEnter={(e) => {
        setAbsicht(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setAbsicht(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setAbsicht(true);
        onFocus?.(e);
      }}
    />
  );
}
