// ─── ユーザー ───────────────────────────────────────────
export const mockUser = {
  name: "Ryo-chan",
  nameInitial: "R",
  rank: "4回戦",
  nextRank: "6回戦",
  rankProgress: 65,
  score: 82,
  streak: 14,
};

// ─── KPI ───────────────────────────────────────────
export const mockKpi = [
  { id: "score",    icon: "🔥", value: "82",    unit: "pt",   label: "闘争心スコア",       trend: "↑ 昨日比 +7pt",  trendType: "up"      },
  { id: "cal",      icon: "🍽️", value: "1,840", unit: "kcal", label: "今日の摂取カロリー", trend: "目標 2,200kcal",  trendType: "neutral" },
  { id: "protein",  icon: "💪", value: "118",   unit: "g",    label: "タンパク質",         trend: "↑ 目標比 74%",    trendType: "up"      },
  { id: "weight",   icon: "⚖️", value: "74.2",  unit: "kg",   label: "体重",               trend: "↓ 先週比 -0.8kg", trendType: "down"    },
];

// ─── 進捗 ───────────────────────────────────────────
export const mockProgress = [
  { icon: "🍽️", label: "食事記録",         value: "2 / 3食",   pct: 67, color: "linear-gradient(90deg,#880000,#ff2020)" },
  { icon: "💪", label: "タンパク質充足",   value: "74%",       pct: 74, color: "linear-gradient(90deg,#8a7030,#c8a84b)" },
  { icon: "💧", label: "水分補給",         value: "1.8L / 2.5L", pct: 72, color: "linear-gradient(90deg,#205080,#3a8fd1)" },
  { icon: "🏋️", label: "今週のトレーニング", value: "2 / 3回", pct: 67, color: "linear-gradient(90deg,#880000,#ff2020)" },
  { icon: "🛌", label: "睡眠時間",         value: "6.5h / 7h", pct: 93, color: "linear-gradient(90deg,#1a7040,#2ecc71)" },
];

// ─── チャット ───────────────────────────────────────────
export const mockChat = [
  { role: "trainer", text: "田中社長、お疲れ様です。今日もコンディション管理できていますね。ダッシュボードを見ると闘争心スコアが92ptまで上がっています。素晴らしい。\n何かお困りはありますか？", time: "10:00" },
  { role: "user",    text: "今日、クライアントとの会食があります。焼肉店なので、何を頼めばいいですか？", time: "10:15" },
];

export const mockQuickReplies = [
  "食事を記録したい",
  "記録を振り返りたい",
  "今週の進捗が見たい",
  "サプリ相談",
  "運動前の食事",
];

// ─── 偉人の名言（日替わり） ───────────────────────────────────────────
const quotes = [
  { quote: "結果を出す経営者は、身体の管理も経営と同じだ。曖昧にするな。数字で見ろ。今日も妥協するな。", author: "高橋 良輔 代表" },
  { quote: "成功とは、情熱を失わずに失敗から失敗へと進む能力である。", author: "ウィンストン・チャーチル" },
  { quote: "チャンピオンは試合が終わった後ではなく、練習が辛いときに作られる。", author: "ムハマド・アリ" },
  { quote: "困難の中に、機会がある。", author: "アルベルト・アインシュタイン" },
  { quote: "不可能とは、努力することを拒む者の言い訳に過ぎない。", author: "ムハマド・アリ" },
  { quote: "千里の道も一歩から。", author: "老子" },
  { quote: "逆境は人を鍛える。平穏なる海では、優秀な船乗りは育たない。", author: "フランクリン・ルーズベルト" },
  { quote: "やる前から諦める者は、最も哀れな敗者である。", author: "ナポレオン・ボナパルト" },
  { quote: "今日できることを明日に延ばすな。", author: "ベンジャミン・フランクリン" },
  { quote: "我々は自分たちが繰り返し行うことによって定義される。卓越とは行為ではなく、習慣である。", author: "アリストテレス" },
  { quote: "成功する人は失敗を恐れない。ただ次の機会を見つけるだけだ。", author: "マイケル・ジョーダン" },
  { quote: "打席に立たなければホームランは打てない。", author: "ベーブ・ルース" },
  { quote: "勝つことが全てではない。しかし、勝とうとする意志が全てだ。", author: "ビンス・ロンバルディ" },
  { quote: "どれだけ打ちのめされても、立ち上がる勇気を持つ者だけが最後に勝つ。", author: "ネルソン・マンデラ" },
  { quote: "限界は、君が自分に課すものだ。", author: "マイケル・フェルプス" },
  { quote: "苦しいから逃げるのではない。逃げるから苦しくなるのだ。", author: "岡本太郎" },
  { quote: "前進あるのみ。立ち止まったら死と同じだ。", author: "勝海舟" },
  { quote: "才能とは、情熱を持ち続ける能力だ。", author: "ヴィクトール・フランクル" },
  { quote: "何かを始めるのに、完璧な時などない。今すぐ始めろ。", author: "ナポレオン・ヒル" },
  { quote: "夢を見ることができれば、それは実現できる。", author: "ウォルト・ディズニー" },
];

export function getTodayQuote() {
  const now = new Date();
  const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[day % quotes.length];
}

export function getTodayLabel() {
  const now = new Date();
  const wd = ["日","月","火","水","木","金","土"][now.getDay()];
  return `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（${wd}）`;
}
