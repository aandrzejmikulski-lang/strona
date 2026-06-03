import "./globals.css";
import { Inter } from "next/font/google";
import { AppToaster } from "../components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Panel Administracyjny",
  description: "System zarządzania wspólnotami — full wypas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className="min-h-screen bg-black">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
