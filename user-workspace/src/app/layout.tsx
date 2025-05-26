import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const comicNeue = Comic_Neue({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Speech Learning App",
  description: "Learn speech with keywords and three-word sentences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={comicNeue.className}>{children}</body>
    </html>
  );
}
