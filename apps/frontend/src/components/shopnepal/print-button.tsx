'use client';
export function PrintButton({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button onClick={() => window.print()} style={style}>
      {children}
    </button>
  );
}
