import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rift Counter — League of Legends Counter Picks & Items",
  description:
    "Find counter champions and counter items for any League of Legends champion. Up-to-date with the latest patch via Riot Data Dragon.",
  openGraph: {
    title: "Rift Counter",
    description: "League counter picks and item builds — every patch, every role.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
