import { getProfile, getTodayRecord, getChatMessages, getScoreHistory, getTodayNutrition } from "@/lib/db";
import { mockKpi, mockProgress, mockChat, mockQuickReplies, getTodayQuote, getTodayLabel } from "@/lib/mockData";

export default async function Dashboard() {
  const quote = getTodayQuote();
  const dateLabel = getTodayLabel();

  // ── Supabaseからデータ取得（失敗時はモックにフォールバック）──
  const profile = await getProfile();
  const todayRecord = profile ? await getTodayRecord(profile.id) : null;
  const chatMessages = profile ? await getChatMessages(profile.id) : [];
  const scoreHistory = profile ? await getScoreHistory(profile.id) : [58, 63, 70, 67, 75, 78, 82];
  const nutrition = profile ? await getTodayNutrition(profile.id) : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // ── ユーザー情報（DBまたはモック）──
  const user = profile
    ? {
        name: profile.name,
        nameInitial: profile.name_initial,
        rank: profile.rank,
        score: profile.score,
        streak: profile.streak,
      }
    : { name: "Ryo-chan", nameInitial: "R", rank: "4回戦", score: 82, streak: 14 };

  // ── KPI（DBまたはモック）──
  const kpi = todayRecord
    ? [
        { id: "score",   icon: "🔥", value: String(todayRecord.score),   unit: "pt",   label: "闘争心スコア",       trend: `↑ 昨日比 +7pt`,       trendType: "up"      },
        { id: "cal",     icon: "🍽️", value: todayRecord.calories.toLocaleString(), unit: "kcal", label: "今日の摂取カロリー", trend: "目標 2,200kcal",  trendType: "neutral" },
        { id: "protein", icon: "💪", value: String(todayRecord.protein), unit: "g",    label: "タンパク質",         trend: `↑ 目標比 ${Math.round(todayRecord.protein/160*100)}%`, trendType: "up" },
        { id: "weight",  icon: "⚖️", value: String(todayRecord.weight),  unit: "kg",   label: "体重",               trend: `↓ 先週比`,              trendType: "down"    },
      ]
    : mockKpi;

  // ── 栄養進捗（食事ログから集計）──
  const nutritionProgress = [
    { icon: "🔥", label: "総摂取カロリー", value: `${nutrition.calories.toLocaleString()} / 2,200kcal`, pct: Math.min(Math.round(nutrition.calories / 2200 * 100), 100), color: "linear-gradient(90deg,#880000,#ff2020)" },
    { icon: "💪", label: "タンパク質（蛋）", value: `${nutrition.protein}g / 160g`,   pct: Math.min(Math.round(nutrition.protein / 160 * 100), 100),  color: "linear-gradient(90deg,#1a4a8a,#3a8fd1)" },
    { icon: "🌾", label: "炭水化物（糖）",  value: `${nutrition.carbs}g / 250g`,     pct: Math.min(Math.round(nutrition.carbs / 250 * 100), 100),    color: "linear-gradient(90deg,#555,#ffffff)" },
    { icon: "🧈", label: "脂質（脂）",      value: `${nutrition.fat}g / 70g`,        pct: Math.min(Math.round(nutrition.fat / 70 * 100), 100),       color: "linear-gradient(90deg,#8a6a00,#fbbf24)" },
  ];

  // ── チャット（DBまたはモック）──
  const chat = chatMessages.length > 0
    ? chatMessages.map((m) => ({
        role: m.role,
        text: m.text,
        time: new Date(m.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      }))
    : mockChat;

  const maxScore = Math.max(...scoreHistory);

  return (
    <div className="page">

      {/* ── ページヘッダー ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">おはようございます、{user.name}さん</h1>
          <p className="page-sub">{dateLabel} · 今日も闘争心を燃やせ 🔥</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon">🔔</button>
          <div className="user-avatar-sm">{user.nameInitial}</div>
        </div>
      </div>

      {/* ── トレーナーメッセージ ── */}
      <div className="message-card">
        <div className="message-bg-text" aria-hidden>闘争</div>
        <div className="message-trainer">
          <div className="trainer-avatar">
            高
            <span className="online-dot" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "3px" }}>高橋 代表</div>
            <div style={{ fontSize: "10px", color: "var(--gray-l)", marginBottom: "6px" }}>
              株式会社闘争心 · 代表トレーナー
            </div>
            <span className="live-badge"><span className="live-dot" />LIVE</span>
          </div>
        </div>
        <blockquote className="message-quote">{quote.quote}</blockquote>
        <p className="message-author">— {quote.author}</p>
      </div>

      {/* ── KPI グリッド ── */}
      <div className="kpi-grid">
        {kpi.map((k) => (
          <div key={k.id} className={`kpi-card${k.id === "score" ? " primary" : ""}`}>
            <div className="kpi-icon">{k.icon}</div>
            <div>
              <span className={`kpi-value${k.id === "score" ? " red" : ""}`}>{k.value}</span>
              <span className="kpi-unit">{k.unit}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-trend ${k.trendType === "up" ? "trend-up" : k.trendType === "down" ? "trend-down" : "trend-neutral"}`}>
              {k.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── 2カラム ── */}
      <div className="two-col">

        {/* 左：今日の栄養摂取 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">今日の栄養摂取</span>
            <span className="card-sub">
              {profile ? "Supabase連携中 ✅" : "モックデータ"}
            </span>
          </div>
          <div className="progress-list">
            {nutritionProgress.map((item, i) => (
              <div key={i} className="progress-item">
                <div className="progress-meta">
                  <span className="progress-label">
                    <span className="progress-icon">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="progress-val">{item.value}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右カラム */}
        <div className="right-col">

          {/* 次回トレーニング */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">次回トレーニング</span>
            </div>
            <div className="training-card-inner">
              <div className="cal-box">
                <div className="cal-month">APR</div>
                <div className="cal-day">23</div>
              </div>
              <div>
                <div className="training-time">18:00 – 19:00</div>
                <div className="training-label">🥊 ボクシング個別指導</div>
                <div style={{ fontSize: "10px", color: "var(--gray)", marginTop: "4px" }}>高橋代表トレーナー</div>
              </div>
            </div>
          </div>

          {/* スコア推移 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">闘争スコア推移</span>
              <span className="card-sub">過去7日</span>
            </div>
            <div className="score-chart">
              {scoreHistory.map((val, i) => (
                <div
                  key={i}
                  className="score-bar"
                  style={{
                    height: `${(val / maxScore) * 100}%`,
                    background: i === scoreHistory.length - 1
                      ? "var(--red)"
                      : "var(--border)",
                    opacity: i === scoreHistory.length - 1 ? 1 : 0.6 + i * 0.06,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--gray)" }}>7日前</span>
              <span style={{ fontSize: "10px", color: "var(--red-b)", fontWeight: 700 }}>今日 {user.score}pt</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── アクションボタン ── */}
      <div className="actions-row">
        <button className="btn-primary">🍽️ 食事を記録する</button>
        <button className="btn-secondary">💬 高橋代表に相談</button>
        <button className="btn-secondary">📊 週活レポートを見る</button>
      </div>

      {/* ── AIお話室チャット ── */}
      <div className="chat-card">
        <div className="chat-header">
          <div className="chat-trainer-info">
            <div className="trainer-avatar" style={{ width: "36px", height: "36px", fontSize: "13px" }}>
              高<span className="online-dot" />
            </div>
            <div>
              <div className="chat-trainer-name">高橋代表 AIお話室</div>
              <div className="chat-trainer-sub">🟢 24時間いつでも対応</div>
            </div>
          </div>
          <div className="chat-stats">
            <span>今日の質問 <strong style={{ color: "var(--white)" }}>3件</strong></span>
            &nbsp;·&nbsp;
            <span>今週累計 <strong style={{ color: "var(--white)" }}>限定回数</strong></span>
          </div>
        </div>

        <div className="chat-messages">
          {chat.map((msg, i) => (
            <div key={i} className={`msg-row${msg.role === "user" ? " user" : ""}`}>
              <div className={`msg-avatar-sm ${msg.role === "trainer" ? "msg-avatar-trainer" : "msg-avatar-user"}`}>
                {msg.role === "trainer" ? "高" : user.nameInitial}
              </div>
              <div>
                <div className={`msg-bubble${msg.role === "user" ? " user" : ""}`}>
                  {msg.text.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
                <div className={`msg-time${msg.role === "user" ? " text-right" : ""}`} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-quick">
          {mockQuickReplies.map((r, i) => (
            <button key={i} className="quick-btn">{r}</button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            placeholder="高橋代表に質問する..."
          />
          <button className="send-btn">➤</button>
        </div>
      </div>

    </div>
  );
}
