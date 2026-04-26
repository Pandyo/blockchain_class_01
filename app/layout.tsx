import type { Metadata } from "next";
import Web3Provider from "@/components/Web3Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TipJarPlus",
  description: "Sepolia TipJarPlus dApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}