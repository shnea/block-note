import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@shnea/blocknote example",
  description: "Editor and JSON viewer example for @shnea/blocknote",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
