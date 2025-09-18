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
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-900 text-slate-100`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
              success: {
                style: {
                  background: '#1e293b',
                  color: '#10b981',
                  border: '1px solid #059669',
                },
              },
              error: {
                style: {
                  background: '#1e293b',
                  color: '#ef4444',
                  border: '1px solid #dc2626',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
