"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { client } from "@/lib/microcms";

export default function Home() {
  const [data, setData] = useState(null);

  // クライアントサイドでデータを取得
  useEffect(() => {
    const fetchData = async () => {
      const res = await client.get({
        endpoint: "deweys", // ここが自分のエンドポイント名と合っているか確認してね
      });
      setData(res);
    };
    fetchData();
  }, []);

  if (!data) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- ヒーローセクション（背景画像エリア） --- */}
      <section className="relative w-full h-[60vh] md:h-screen bg-gray-900">
        <Image
          src={data.bg_image.url}
          fill
          priority
          alt="早稲田大学軟式野球サークル W.DEWEYS"
          className="object-contain md:object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter drop-shadow-lg">
            W.DEWEYS
          </h1>
          <p className="mt-2 text-sm md:text-xl font-medium tracking-widest">
            WASEDA UNIVERSITY BASEBALL CLUB
          </p>
        </div>
      </section>

      {/* --- コンテンツエリア（活動紹介） --- */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-4 mb-8 text-white">
          NEWS / LOGS
        </h2>
        
        <div className="grid gap-8">
          {data.activities?.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* --- フッター --- */}
      <footer className="py-10 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} Waseda University W.DEWEYS.</p>
      </footer>
    </main>
  );
}

// 各カードの開閉を管理するコンポーネント
function ActivityCard({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-gray-800">
      {/* メイン画像 */}
      {item.image && (
        <div className="relative h-56 w-full">
          <Image
            src={item.image.url}
            fill
            className="object-cover"
            alt={item.title}
          />
        </div>
      )}

      {/* テキストエリア */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{item.title}</h3>
          {/* READボタン */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-bold border border-white px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-all active:scale-95"
          >
            {isOpen ? "CLOSE" : "READ"}
          </button>
        </div>

        {/* 開閉する説明文（READを押すと広がる） */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="text-gray-300 text-sm md:text-base leading-relaxed border-t border-gray-800 pt-6 whitespace-pre-wrap">
            {/* whitespace-pre-wrap を入れることで、microCMSでの改行がそのまま反映されるよ */}
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}