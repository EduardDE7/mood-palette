import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Palettrix | Color Generator & Editor",
  description:
    "Generate, edit, and export stunning color palettes instantly. Perfect for designers and developers looking for seamless workflow integration with CSS and Tailwind export.",
  keywords: [
    "color palette",
    "design system",
    "color generator",
    "tailwind colors",
    "css variables",
    "ui design",
  ],
  authors: [{ name: "Eduard" }],
  openGraph: {
    title: "Palettrix | Color Generator",
    description: "Generate and export stunning color palettes instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
