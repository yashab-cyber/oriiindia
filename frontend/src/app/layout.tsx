import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Orii - Open Research Institute of India",
  description: "Advancing research and innovation through collaboration and knowledge sharing",
  keywords: ["research", "institute", "india", "innovation", "collaboration", "academic"],
  authors: [{ name: "Orii Development Team" }],
  openGraph: {
    title: "Orii - Open Research Institute of India",
    description: "Advancing research and innovation through collaboration and knowledge sharing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
