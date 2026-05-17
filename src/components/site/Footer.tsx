import logo from "@/assets/logo-suatshui.png";

const Footer = () => (
  <footer className="mt-24 border-t border-border bg-paper">
    <div className="container py-12 grid gap-10 md:grid-cols-4 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <img src={logo} alt="Sua-Tshui" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-bold">Sua-Tshui 食喙</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          台灣最值得信賴的餐廳探索與訂位平台。讓每個人都能找到適合的餐廳，讓每間好店都被看見。
        </p>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3">探索</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>依縣市瀏覽</li>
          <li>依分類瀏覽</li>
          <li>深夜營業</li>
          <li>可訂位餐廳</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3">業者</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>店家入駐</li>
          <li>業者後台</li>
          <li>合作方案</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3">關於</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>關於食寶島</li>
          <li>隱私權政策</li>
          <li>使用條款</li>
          <li>聯絡我們</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-5 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
        <span>© 2026 Sua-Tshui 食喙. All rights reserved.</span>
        <span>探索 · 評鑑 · 訂位 — 從一碗熱湯開始。</span>
      </div>
    </div>
  </footer>
);

export default Footer;