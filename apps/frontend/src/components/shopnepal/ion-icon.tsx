// @ts-nocheck
'use client';
export function IonIcon({ name, style, className }: { name: string; style?: React.CSSProperties; className?: string }) {
  return <ion-icon name={name} style={style} className={className} suppressHydrationWarning={true} aria-hidden="true" />;
}
