// app/layout.tsx
import React from 'react';
// Use relative path instead of alias
import StyledComponentsRegistry from '../lib/registry';
import './globals.css';

export const metadata = {
  title: 'Literary Edventures',
  description: 'Interactive literary explorations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}