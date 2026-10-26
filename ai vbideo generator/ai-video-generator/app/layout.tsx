import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrameForge AI — Video Generator",
  description: "Turn your imagination into cinematic AI videos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
