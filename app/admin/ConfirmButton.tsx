'use client';

/**
 * Submit-Button mit nativer Rückfrage. In ein `<form action={serverAction}>` gesetzt;
 * bricht die Server-Action ab, wenn der Admin die Bestätigung ablehnt. Bewusst minimal —
 * für ein Single-Admin-LAN-CMS reicht ein confirm() als Schutz vor Fehlklicks.
 */
export function ConfirmButton({
  children,
  message,
  className,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
