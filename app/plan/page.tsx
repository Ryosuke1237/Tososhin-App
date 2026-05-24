export default function PlanPage() {
  return (
    <div className="page">

      {/* ── ページヘッダー ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👑 プラン・料金</h1>
          <p className="page-sub">あなたの闘争心に合ったプランを選択</p>
        </div>
      </div>

      {/* ── プランカードグリッド ── */}
      <div className="plans-grid">

        {/* STANDARD */}
        <div className="plan-card">
          <div className="plan-name">STANDARD</div>
          <div className="plan-price">¥3,300<span>/月</span></div>
          <div className="plan-tagline">はじめての一歩</div>
          <ul className="plan-features">
            <li>食事ログ（月30回まで）</li>
            <li>AI栄養解析</li>
            <li>闘争心スコア</li>
            <li className="gray">高橋相談室24h</li>
            <li className="gray">高橋節フィードバック</li>
            <li className="gray">週次レポート</li>
          </ul>
          <button className="plan-btn outline">このプランで始める</button>
        </div>

        {/* PREMIUM */}
        <div className="plan-card recommended">
          <div className="plan-recommended-badge">おすすめ</div>
          <div className="plan-name">PREMIUM</div>
          <div className="plan-price">¥5,500<span>/月</span></div>
          <div className="plan-tagline">本気の経営者へ</div>
          <ul className="plan-features">
            <li>食事ログ（無制限）</li>
            <li>AI栄養解析（GPT-4o Vision）</li>
            <li>闘争心スコア</li>
            <li>高橋相談室24h</li>
            <li>高橋節フィードバック</li>
            <li>週次レポート</li>
          </ul>
          <button className="plan-btn fill">現在のプラン</button>
        </div>

        {/* CHAMPION VIP */}
        <div className="plan-card">
          <div className="plan-name" style={{ color: "var(--gold)" }}>CHAMPION VIP</div>
          <div className="plan-price" style={{ color: "var(--gold)" }}>¥11,000<span>/月</span></div>
          <div className="plan-tagline">頂点を目指す猛者へ</div>
          <ul className="plan-features">
            <li>全PREMIUM機能</li>
            <li>月1回オンライン面談</li>
            <li>カスタム目標設定</li>
            <li>優先サポート対応</li>
            <li>限定コンテンツ</li>
            <li>VIP専用バッジ</li>
          </ul>
          <button className="plan-btn gold">VIPにアップグレード</button>
        </div>

      </div>

      {/* ── AI管理オプション ── */}
      <div className="card" style={{ marginTop: "24px", padding: "24px" }}>
        <div className="card-title" style={{ marginBottom: "12px" }}>AI管理オプション（既存会員向け）</div>
        <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--gray)" }}>
          高橋ジムの回数券プランをご利用中の方は、月額¥5,500でAI管理機能をアドオンとして追加できます。
          アプリに蓄積されたデータが「あなただけの健康資産」になります。
        </p>
        <div className="divider" />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "30px" }}>🤝</div>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px" }}>無料体験・お問い合わせ</div>
            <div style={{ fontSize: "13px", color: "var(--gray)" }}>まずはデモをお試しください。高橋代表が直接ご説明します。</div>
          </div>
          <button className="plan-btn fill" style={{ width: "auto", padding: "10px 20px", whiteSpace: "nowrap" }}>
            お問い合わせ
          </button>
        </div>
      </div>

    </div>
  );
}
