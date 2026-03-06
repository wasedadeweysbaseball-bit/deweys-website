"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { client } from "@/lib/microcms";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await client.get({
        endpoint: "deweys", 
      });
      setData(res);
    };
    fetchData();
  }, []);

  if (!data) return <div className="bg-black min-h-screen flex items-center justify-center text-white font-bold">LOADING...</div>;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- ヒーローセクション（写真が絶対に切れない設定） --- */}
      <section className="relative w-full flex flex-col items-center">
        {/* 写真部分：スマホでは横幅100%で表示し、高さは写真の比率に合わせる */}
        <div className="relative w-full aspect-[16/9] md:h-screen">
          <Image
            src={data.bg_image.url}
            fill
            priority
            alt="W.DEWEYS 集合写真"
            className="object-contain md:object-cover"
            /* 解説：
               スマホ（object-contain）: 画像が枠に収まるように小さくなる。左右は絶対に切れない。
               PC（md:object-cover）: 画面いっぱいに広がる。
            */
          />
        </div>
        
        {/* 文字コンテンツ：写真の下、または写真に少し重ねて配置 */}
        <div className="w-full py-10 px-6 flex flex-col items-center text-center bg-gradient-to-b from-black/80 to-black">
          <h1 className="text-3xl md:text-8xl font-black italic tracking-tighter mb-2">
            野球やろうぜ！
          </h1>
          <p className="text-2xl md:text-6xl font-bold text-cyan-400 mb-6">
            W.DEWEYS
          </p>
          
          {/* 統計バー：スマホでも見やすく横並びに */}
          <div className="flex justify-center items-center gap-6 border-y border-white/10 py-4 w-full max-w-md">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase">部員数</p>
              <p className="text-lg font-bold">35名</p>
            </div>
            <div className="text-center border-x border-white/10 px-6">
              <p className="text-[10px] text-gray-400 uppercase">初心者</p>
              <p className="text-lg font-bold text-cyan-300">30%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase">大学数</p>
              <p className="text-lg font-bold">3校+</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 活動紹介セクション --- */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black italic mb-8 border-l-4 border-cyan-500 pl-4">NEWS / LOGS</h2>
        
        <div className="grid gap-10">
          {data.activities?.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <footer className="py-10 text-center text-gray-600 text-[10px] tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} WASEDA UNIVERSITY W.DEWEYS.</p>
      </footer>
    </main>
  );
}

function ActivityCard({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#111] rounded-xl overflow-hidden border border-white/5">
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

      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[10px] font-bold border border-white px-4 py-1 rounded-full hover:bg-white hover:text-black transition-all"
          >
            {isOpen ? "CLOSE" : "READ"}
          </button>
        </div>

        <div 
          className={`overflow-hidden transition-all duration-500 ${
            isOpen ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-6 whitespace-pre-wrap">
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}