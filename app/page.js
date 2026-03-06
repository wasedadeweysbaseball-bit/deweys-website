import Image from "next/image";
import { client } from "@/lib/microcms";

// microCMSからデータを取得する関数
async function getDeweysData() {
  const data = await client.get({
    endpoint: "deweys", // ここは自分のmicroCMSのエンドポイント名に合わせてね
  });
  return data;
}

export default async function Home() {
  const data = await getDeweysData();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- ヒーローセクション（背景画像エリア） --- */}
      <section className="relative w-full h-[60vh] md:h-screen bg-gray-900">
        {/* 解説：
          h-[60vh] -> スマホでは画面の60%の高さに抑えて、横長写真が小さくなりすぎないように調整
          md:h-screen -> PC（中型画面以上）では画面いっぱいの高さに表示
        */}
        <Image
          src={data.bg_image.url}
          fill
          priority
          alt="早稲田大学軟式野球サークル W.DEWEYS"
          className="object-contain md:object-cover"
          /* 解説：
            object-contain -> スマホで画像全体を収める（端が切れない）
            md:object-cover -> PCでは画面いっぱいに広げて迫力を出す
          */
        />
        
        {/* 写真の上に重なるオーバーレイ文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter drop-shadow-lg">
            W.DEWEYS
          </h1>
          <p className="mt-2 text-sm md:text-xl font-medium tracking-widest">
            WASEDA UNIVERSITY BASEBALL CLUB
          </p>
        </div>
      </section>

      {/* --- コンテンツエリア（活動紹介など） --- */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-4 mb-8">
          NEWS / LOGS
        </h2>
        
        <div className="grid gap-8">
          {/* microCMSのリストを表示するループ処理（例） */}
          {data.activities?.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              {item.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image.url}
                    fill
                    className="object-cover"
                    alt={item.title}
                  />
                </div>
              )}
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">{item.date}</p>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
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