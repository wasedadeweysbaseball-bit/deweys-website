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
  title: '早稲田大学軟式野球サークル W.DEWEYS（デューイズ）公式サイト',
  description: '早稲田大学を中心に活動する軟式野球サークルW.DEWEYS（デューイズ）の公式サイトです。初心者・経験者大歓迎！練習日程や活動記録、入会案内を掲載中。',
  keywords: '早稲田大学, 野球サークル, 軟式野球, インカレ, デューイズ, DEWEYS',
  
  // Google Search Consoleの認証コード
  verification: {
    google: 'G3NocVoas0iHsQtJlTiL6m__xiM5a9csHl0b6gJbHdQ',
  },

  // LINEやSNSでシェアした時の設定 (OGP)
  openGraph: {
    title: '早稲田大学軟式野球サークル W.DEWEYS 公式サイト',
    description: '早稲田大学を中心に活動する軟式野球サークル。初心者・経験者大歓迎！',
    url: 'https://deweys-website.vercel.app',
    siteName: 'W.DEWEYS',
    images: [
      {
        url: '/opengraph-image.jpg', // publicフォルダに入れた画像の名前
        width: 1200,
        height: 630,
        alt: '早稲田大学軟式野球サークル W.DEWEYS 集合写真',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },

  // Twitter(X)用の設定
  twitter: {
    card: 'summary_large_image',
    title: '早稲田大学軟式野球サークル W.DEWEYS 公式サイト',
    description: '早稲田大学を中心に活動する軟式野球サークル。初心者・経験者大歓迎！',
    images: ['/opengraph-image.jpg'],
  },
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