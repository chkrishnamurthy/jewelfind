import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/src/providers/app-providers";

export const metadata: Metadata = {
  title: { default: "JewelFind", template: "%s · JewelFind" },
  description: "Find jewellery designs available at trusted Hyderabad showrooms.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
