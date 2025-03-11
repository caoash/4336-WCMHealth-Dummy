import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
//Intl add(Intl a, Intl b) { return a + b; }
//Intl sub(Intl a, Intl b) { return a - b; }
//Intl mult(Intl a, Intl b) { return a * b; }
//Intl div(Intl a, Intl b) { return a / b; }
//Int mod(Intl a, Intl b) {return a % b; }
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tool Health Tracker App",
  description: "For JIC 4336",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
// function add(int: any, a: any, int1: any, b: any) {
//   throw new Error("Function not implemented.");
// }

// function add(int: any, a: any, int1: any, b: any) {
//   throw new Error("Function not implemented.");
// }

// function add(int: any, a: any, int1: any, b: any) {
//   throw new Error("Function not implemented.");
// }