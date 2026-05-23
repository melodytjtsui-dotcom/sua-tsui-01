import { Link } from "react-router-dom";
import { Star, MapPin, Wallet } from "lucide-react";
import type { DBRestaurant } from "@/lib/restaurant-types";
import { priceLabel } from "@/lib/restaurant-types";

// ── Unsplash photo library ────────────────────────────────────────────────────
const IMG = {
  burger:       "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  friedChicken: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
  ramen:        "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800",
  sushi:        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
  hotpot:       "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
  bbq:          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
  steak:        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  pizza:        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  pasta:        "https://images.unsplash.com/photo-1551183053-bf91798d111b?w=800",
  coffee:       "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
  brunch:       "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
  breakfast:    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
  dessert:      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
  bubbleTea:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  tea:          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
  iceCream:     "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
  taiwanese:    "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800",
  streetFood:   "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800",
  stirFry:      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
  noodles:      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  dumplings:    "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800",
  dimSum:       "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  bento:        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  seafood:      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
  japanese:     "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800",
  korean:       "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
  thai:         "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800",
  vietnamese:   "https://images.unsplash.com/photo-1569562051672-4aacc32c0b22?w=800",
  indian:       "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  mexican:      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
  western:      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  bar:          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
  izakaya:      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800",
  vegan:        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  sandwich:     "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
  porridge:     "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
  fineDining:   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
};

// ── Step 1: match by restaurant NAME keywords ────────────────────────────────
function getImageByName(name: string): string | null {
  // Chain restaurants
  if (/麥當勞|mcdonald/i.test(name))              return IMG.burger;
  if (/肯德基|KFC|kfc/i.test(name))               return IMG.friedChicken;
  if (/星巴克|starbucks/i.test(name))              return IMG.coffee;
  if (/摩斯漢堡|mos burger/i.test(name))           return IMG.burger;
  if (/漢堡王|burger king/i.test(name))            return IMG.burger;
  if (/必勝客|pizza hut/i.test(name))              return IMG.pizza;
  if (/達美樂|domino/i.test(name))                 return IMG.pizza;
  if (/subway/i.test(name))                        return IMG.sandwich;

  // By dish keywords in name
  if (/拉麵|らーめん|ramen/i.test(name))           return IMG.ramen;
  if (/壽司|鮨|すし|sushi/i.test(name))            return IMG.sushi;
  if (/火鍋|麻辣鍋|涮涮鍋|shabu|鴛鴦鍋/i.test(name)) return IMG.hotpot;
  if (/燒肉|烤肉|燒烤|串燒|yakiniku/i.test(name)) return IMG.bbq;
  if (/牛排|steak|扒房/i.test(name))               return IMG.steak;
  if (/披薩|pizza|義大利/i.test(name))             return IMG.pizza;
  if (/義式|pasta|義麵/i.test(name))               return IMG.pasta;
  if (/咖啡|coffee|café|cafe/i.test(name))         return IMG.coffee;
  if (/珍奶|手搖|奶茶|珍珠|bubble/i.test(name))   return IMG.bubbleTea;
  if (/甜點|蛋糕|甜品|dessert|patisserie/i.test(name)) return IMG.dessert;
  if (/麵包|bakery|糕餅|西餅/i.test(name))         return IMG.dessert;
  if (/海鮮|seafood|生蠔|龍蝦|螃蟹/i.test(name))  return IMG.seafood;
  if (/壽喜燒|sukiyaki/i.test(name))               return IMG.hotpot;
  if (/天婦羅|tempura/i.test(name))                return IMG.japanese;
  if (/居酒屋|izakaya/i.test(name))                return IMG.izakaya;
  if (/泰式|泰國|thai/i.test(name))                return IMG.thai;
  if (/韓式|韓國|korean/i.test(name))              return IMG.korean;
  if (/越式|越南|河粉|pho|viet/i.test(name))       return IMG.vietnamese;
  if (/印度|indian/i.test(name))                   return IMG.indian;
  if (/墨西哥|mexican|tacos|taco/i.test(name))     return IMG.mexican;
  if (/素食|蔬食|vegan|vegetarian/i.test(name))    return IMG.vegan;
  if (/早餐|breakfast/i.test(name))                return IMG.breakfast;
  if (/早午餐|brunch/i.test(name))                 return IMG.brunch;
  if (/冰淇淋|冰品|雪糕|gelato|ice cream/i.test(name)) return IMG.iceCream;
  if (/餃子|dumpling|gyoza/i.test(name))           return IMG.dumplings;
  if (/炸雞|chicken/i.test(name))                  return IMG.friedChicken;
  if (/漢堡|burger/i.test(name))                   return IMG.burger;
  if (/三明治|sandwich|潛艇堡/i.test(name))        return IMG.sandwich;
  if (/粥|porridge|稀飯/i.test(name))              return IMG.porridge;
  if (/茶|tea house|茶藝|茶館/i.test(name))        return IMG.tea;
  if (/麵|noodle/i.test(name))                     return IMG.noodles;
  if (/便當|定食|bento/i.test(name))               return IMG.bento;
  if (/酒吧|bar|pub|lounge/i.test(name))           return IMG.bar;

  return null;
}

// ── Step 2: match by CATEGORY ────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  // 台灣料理
  "台灣料理": IMG.taiwanese,
  "台灣小吃": IMG.streetFood,
  "台式熱炒": IMG.stirFry,
  "台式燒烤": IMG.bbq,
  "小吃店":   IMG.streetFood,
  "Taiwanese restaurant": IMG.taiwanese,

  // 火鍋類
  "火鍋":                 IMG.hotpot,
  "Hot pot restaurant":   IMG.hotpot,
  "壽喜燒餐廳":           IMG.hotpot,
  "壽喜燒和日式火鍋餐廳": IMG.hotpot,
  "相撲火鍋店":           IMG.hotpot,
  "瑞士火鍋餐廳":         IMG.hotpot,

  // 日式
  "日式料理":             IMG.japanese,
  "Japanese restaurant":  IMG.japanese,
  "Authentic Japanese restaurant": IMG.japanese,
  "正宗日式料理餐廳":     IMG.japanese,
  "京都風味日式餐廳":     IMG.japanese,
  "懷石料理餐廳":         IMG.japanese,
  "食堂與定食餐廳":       IMG.bento,
  "日本地方料理餐廳":     IMG.japanese,
  "日式西餐廳":           IMG.japanese,

  // 壽司
  "壽司店":               IMG.sushi,
  "迴轉壽司餐廳":         IMG.sushi,
  "Sushi restaurant":     IMG.sushi,
  "海鮮丼餐廳":           IMG.sushi,

  // 拉麵/麵食
  "拉麵店":               IMG.ramen,
  "Ramen restaurant":     IMG.ramen,
  "中式麵食店":           IMG.noodles,
  "烏冬專門店":           IMG.noodles,
  "擔擔麵專門店":         IMG.noodles,
  "冷麵店":               IMG.noodles,
  "麵店":                 IMG.noodles,

  // 燒肉/串燒/烤肉
  "串燒烤肉店":           IMG.bbq,
  "串燒":                 IMG.bbq,
  "日式串燒餐廳":         IMG.bbq,
  "日式烤雞串餐廳":       IMG.bbq,
  "燒烤餐廳":             IMG.bbq,
  "蒙古烤肉餐廳":         IMG.bbq,
  "中東烤肉店":           IMG.bbq,

  // 牛排
  "Steak house":          IMG.steak,
  "美式扒房":             IMG.steak,
  "美式牛扒屋":           IMG.steak,
  "扒房":                 IMG.steak,
  "酒吧扒房":             IMG.steak,
  "Chophouse restaurant": IMG.steak,

  // 漢堡/美式
  "漢堡包餐廳":           IMG.burger,
  "American restaurant":  IMG.burger,
  "美式餐廳":             IMG.burger,
  "現代美式餐廳":         IMG.burger,
  "加州餐廳":             IMG.burger,
  "潛艇漢堡餐廳":         IMG.sandwich,

  // 披薩/義式
  "薄餅餐廳":             IMG.pizza,
  "薄餅外賣自取":         IMG.pizza,
  "義式料理":             IMG.pasta,

  // 韓式
  "韓式料理":             IMG.korean,
  "韓式燒烤餐廳":         IMG.bbq,

  // 泰式
  "泰式料理":             IMG.thai,
  "Thai restaurant":      IMG.thai,

  // 越式
  "越南餐廳":             IMG.vietnamese,
  "越式河粉餐廳":         IMG.vietnamese,

  // 印度
  "印度料理":             IMG.indian,
  "北印度餐廳":           IMG.indian,
  "現代印度餐廳":         IMG.indian,

  // 中式
  "中式料理":             IMG.dimSum,
  "Chinese restaurant":   IMG.dimSum,
  "中菜館":               IMG.dimSum,
  "中菜外賣":             IMG.dimSum,
  "港式快餐店":           IMG.dimSum,
  "酒樓":                 IMG.dimSum,
  "四川酒家":             IMG.stirFry,
  "京菜/北京菜館":        IMG.dimSum,
  "湘菜館":               IMG.stirFry,
  "客家菜館":             IMG.taiwanese,
  "粥餐廳":               IMG.porridge,
  "Porridge restaurant":  IMG.porridge,

  // 天婦羅
  "天婦羅餐廳":           IMG.japanese,
  "天婦羅丼餐廳":         IMG.japanese,

  // 居酒屋/酒吧
  "居酒屋":               IMG.izakaya,
  "Izakaya":              IMG.izakaya,
  "酒吧":                 IMG.bar,
  "Bar":                  IMG.bar,
  "餐酒館":               IMG.bar,
  "葡萄酒吧":             IMG.bar,
  "運動酒吧":             IMG.bar,
  "卡拉 OK 酒吧":         IMG.bar,
  "現代居酒屋":           IMG.izakaya,
  "現場音樂酒吧":         IMG.bar,
  "愛爾蘭酒吧":           IMG.bar,

  // 咖啡廳
  "咖啡廳":               IMG.coffee,
  "Cafe":                 IMG.coffee,
  "兒童咖啡廳":           IMG.coffee,
  "咖啡烘焙商":           IMG.coffee,
  "咖啡批發商":           IMG.coffee,
  "蒸餾咖啡吧":           IMG.coffee,
  "藝廊咖啡廳":           IMG.coffee,
  "巧克力咖啡館":         IMG.coffee,
  "角色扮演咖啡廳":       IMG.coffee,

  // 早餐/早午餐
  "早餐店":               IMG.breakfast,
  "早餐／早午餐":         IMG.brunch,
  "Brunch restaurant":    IMG.brunch,

  // 甜點/飲料
  "甜品店":               IMG.dessert,
  "甜品餐廳":             IMG.dessert,
  "點心":                 IMG.dessert,
  "法式糕餅店":           IMG.dessert,
  "西餅店":               IMG.dessert,
  "中式糕餅店":           IMG.dessert,
  "雪糕店":               IMG.iceCream,
  "冰品飲料店":           IMG.iceCream,
  "珍珠奶茶店":           IMG.bubbleTea,
  "果汁店":               IMG.bubbleTea,
  "茶藝館":               IMG.tea,
  "中式茶館":             IMG.tea,
  "Tea house":            IMG.tea,
  "班戟店":               IMG.brunch,

  // 海鮮
  "海鮮料理":             IMG.seafood,
  "Seafood restaurant":   IMG.seafood,
  "螃蟹餐廳":             IMG.seafood,
  "生蠔吧餐廳":           IMG.seafood,
  "海鰻料理餐廳":         IMG.seafood,
  "鰻魚料理餐廳":         IMG.seafood,

  // 素食
  "蔬食料理":             IMG.vegan,
  "純素餐廳":             IMG.vegan,
  "健康食品餐廳":         IMG.vegan,
  "無麩質食品餐廳":       IMG.vegan,

  // 餃子/點心
  "餃子店":               IMG.dumplings,
  "Dumpling restaurant":  IMG.dumplings,

  // 三文治
  "三文治店":             IMG.sandwich,
  "Deli":                 IMG.sandwich,

  // 炸物
  "炸物串與串炸餐廳":     IMG.friedChicken,
  "雞肉餐廳":             IMG.friedChicken,

  // 西式/歐式/美式
  "Western restaurant":   IMG.fineDining,
  "歐洲餐廳":             IMG.fineDining,
  "歐陸餐廳":             IMG.fineDining,
  "法國餐廳":             IMG.fineDining,
  "現代法國餐廳":         IMG.fineDining,
  "Fine dining restaurant": IMG.fineDining,
  "高級餐廳":             IMG.fineDining,
  "創意料理":             IMG.fineDining,
  "亞洲 Fusion 菜餐廳":   IMG.fineDining,
  "融合菜式餐廳":         IMG.fineDining,

  // 便當/自助
  "盒餐餐廳":             IMG.bento,
  "飯盒供應商":           IMG.bento,
  "自助餐":               IMG.bento,
  "自助餐廳":             IMG.bento,
  "快餐店":               IMG.burger,

  // 通用
  "家庭餐廳":             IMG.western,
  "Restaurant":           IMG.fineDining,
  "餐廳":                 IMG.fineDining,
  "輕食餐廳":             IMG.brunch,
};

function getRestaurantImage(r: DBRestaurant): string {
  // Use cover_image from DB if available
  if (r.cover_image) return r.cover_image;
  // Try name-based keyword detection first (most accurate)
  const byName = getImageByName(r.name ?? "");
  if (byName) return byName;
  // Fall back to category map
  const byCat = CATEGORY_MAP[r.category];
  if (byCat) return byCat;
  // Last resort: generic food photo
  return IMG.fineDining;
}

const RestaurantCard = ({ r }: { r: DBRestaurant }) => {
  const cover = getRestaurantImage(r);
  return (
    <Link
      to={`/r/${r.id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border shadow-card hover:shadow-stamp hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={r.name}
          loading="lazy"
          width={1024}
          height={768}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== IMG.fineDining) img.src = IMG.fineDining;
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {r.rating != null && r.rating > 0 && (
          <span className="absolute top-3 right-3 stamp h-10 w-10 text-sm rounded-full">
            {r.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-ink truncate group-hover:text-primary transition-colors">
            {r.name}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 inline-flex items-center gap-1">
            <Wallet className="h-3 w-3" /> NT${r.avg_price ?? "—"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {r.description ?? priceLabel(r.avg_price)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {r.rating != null && r.rating > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {r.rating.toFixed(1)} ({(r.review_count ?? 0).toLocaleString()})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground/60">
              <Star className="h-3.5 w-3.5" />
              暫無評分
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {r.city}
            {r.district ? ` · ${r.district}` : ""}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">
            {r.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
