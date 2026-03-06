import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: '早稲田大学軟式野球サークル W.DEWEYS（デウェイズ）公式サイト',
  description: '早稲田大学を中心に活動する軟式野球サークルW.DEWEYS（デウェイズ）の公式サイトです。初心者・経験者大歓迎！練習日程や活動記録、入会案内を掲載中。',
  keywords: '早稲田大学, 野球サークル, 軟式野球, インカレ, デウェイズ, DEWEYS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}