import beefNoodle from "@/assets/dish-beef-noodle.jpg";
import xiaolongbao from "@/assets/dish-xiaolongbao.jpg";
import rechao from "@/assets/dish-rechao.jpg";
import yansuji from "@/assets/dish-yansuji.jpg";
import cafe from "@/assets/dish-cafe.jpg";
import brunch from "@/assets/dish-brunch.jpg";

export type Category =
  | "台灣料理"
  | "台式熱炒"
  | "台灣小吃"
  | "點心"
  | "咖啡廳"
  | "早午餐";

export const categories: { name: Category; emoji: string; image: string; count: number }[] = [
  { name: "台灣料理", emoji: "🍚", image: beefNoodle, count: 1284 },
  { name: "台式熱炒", emoji: "🥢", image: rechao, count: 642 },
  { name: "台灣小吃", emoji: "🍢", image: yansuji, count: 980 },
  { name: "點心", emoji: "🥟", image: xiaolongbao, count: 318 },
  { name: "咖啡廳", emoji: "☕", image: cafe, count: 526 },
  { name: "早午餐", emoji: "🍳", image: brunch, count: 411 },
];

export const cities = [
  { name: "台北", count: 1820, area: "北部" },
  { name: "新北", count: 1142, area: "北部" },
  { name: "桃園", count: 612, area: "北部" },
  { name: "新竹", count: 388, area: "北部" },
  { name: "台中", count: 1024, area: "中部" },
  { name: "台南", count: 892, area: "南部" },
  { name: "高雄", count: 974, area: "南部" },
  { name: "宜蘭", count: 246, area: "東部" },
  { name: "花蓮", count: 198, area: "東部" },
];

export type Restaurant = {
  id: string;
  name: string;
  nameEn: string;
  category: Category;
  city: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  priceRange: string; // e.g. "NT$ 200–400"
  priceTier: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  bookable: boolean;
  image: string;
  tagline: string;
  description: string;
  signature: string[];
  station: string;
};

export const restaurants: Restaurant[] = [
  {
    id: "lin-dong-fang",
    name: "林東芳牛肉麵",
    nameEn: "Lin Dong Fang Beef Noodle",
    category: "台灣料理",
    city: "台北",
    district: "中山區",
    address: "台北市中山區八德路二段322號",
    phone: "02-2752-2556",
    hours: "11:00 – 03:00（週日公休）",
    priceRange: "NT$ 200 – 400",
    priceTier: 2,
    rating: 4.6,
    reviewCount: 3284,
    bookable: true,
    image: beefNoodle,
    tagline: "台北深夜最有靈魂的一碗清燉",
    description:
      "創立於 1965 年，以清燉牛肉湯與半筋半肉聞名。湯頭由牛骨與多種辛香料燉煮十二小時，自家製的辣牛油更是一絕。深夜時段排隊人潮從不間斷。",
    signature: ["半筋半肉麵", "清燉牛肉麵", "滷牛腱", "辣牛油"],
    station: "捷運南京復興站 步行 6 分鐘",
  },
  {
    id: "din-tai-fung",
    name: "鼎泰豐 · 信義店",
    nameEn: "Din Tai Fung Xinyi",
    category: "點心",
    city: "台北",
    district: "信義區",
    address: "台北市信義區市府路45號 B1",
    phone: "02-8101-7799",
    hours: "11:00 – 21:30",
    priceRange: "NT$ 500 – 1000",
    priceTier: 3,
    rating: 4.8,
    reviewCount: 9821,
    bookable: true,
    image: xiaolongbao,
    tagline: "米其林一星，世界級的小籠包工藝",
    description:
      "每顆小籠包恪守 18 摺、5 公克皮、16 公克餡的黃金比例。麵皮薄透、湯汁飽滿，是國際旅客來台必訪的名店之一。",
    signature: ["小籠包", "蝦仁燒賣", "元盅雞湯", "蛋炒飯"],
    station: "捷運市政府站 步行 3 分鐘",
  },
  {
    id: "rechao-no7",
    name: "七號鐵板熱炒",
    nameEn: "No.7 Rechao",
    category: "台式熱炒",
    city: "台南",
    district: "中西區",
    address: "台南市中西區海安路三段 77 號",
    phone: "06-221-7707",
    hours: "17:00 – 01:00",
    priceRange: "NT$ 300 – 600",
    priceTier: 2,
    rating: 4.5,
    reviewCount: 1428,
    bookable: true,
    image: rechao,
    tagline: "海安路上最猛的鑊氣三杯",
    description:
      "由二代主廚阿凱領軍，堅持當日現流海鮮與台南在地食材。三杯雞、鳳梨蝦球、椒鹽中卷是必點三劍客，配上一杯冰啤恰到好處。",
    signature: ["三杯雞", "鳳梨蝦球", "椒鹽中卷", "炒山蘇"],
    station: "近台南火車站 開車 8 分鐘",
  },
  {
    id: "shilin-yansuji",
    name: "豪大大鹹酥雞",
    nameEn: "Hao Da Yan Su Ji",
    category: "台灣小吃",
    city: "台北",
    district: "士林區",
    address: "台北市士林區文林路 113 號",
    phone: "02-2882-1110",
    hours: "16:00 – 00:30",
    priceRange: "NT$ 100 以下",
    priceTier: 1,
    rating: 4.3,
    reviewCount: 5210,
    bookable: false,
    image: yansuji,
    tagline: "夜市傳奇，整隻雞排比臉還大",
    description:
      "1992 年創立的士林夜市老店，現點現炸，外酥內嫩，九層塔香氣逼人。是台北人從學生時代就吃到大的回憶。",
    signature: ["巨無霸雞排", "鹹酥雞", "炸銀絲卷", "甜不辣"],
    station: "捷運劍潭站 步行 4 分鐘",
  },
  {
    id: "fika-fika",
    name: "Fika Fika Café",
    nameEn: "Fika Fika Café",
    category: "咖啡廳",
    city: "台北",
    district: "中山區",
    address: "台北市中山區伊通街 33 號",
    phone: "02-2507-0633",
    hours: "10:00 – 21:00",
    priceRange: "NT$ 200 – 500",
    priceTier: 2,
    rating: 4.7,
    reviewCount: 2104,
    bookable: true,
    image: cafe,
    tagline: "北歐冠軍咖啡師打造的台北綠洲",
    description:
      "由 2013 年北歐盃咖啡烘焙大賽冠軍 James Chen 主理，以淺焙單品為核心。明亮通透的店內空間是工作與閒談的好去處。",
    signature: ["冰瑞典皇室咖啡", "Espresso", "巴拿馬瑰夏手沖", "肉桂卷"],
    station: "捷運松江南京站 步行 5 分鐘",
  },
  {
    id: "good-day-brunch",
    name: "好日子 Good Day 早午餐",
    nameEn: "Good Day Brunch",
    category: "早午餐",
    city: "台中",
    district: "西區",
    address: "台中市西區美村路一段 200 號",
    phone: "04-2326-8090",
    hours: "08:00 – 15:00",
    priceRange: "NT$ 200 – 500",
    priceTier: 2,
    rating: 4.4,
    reviewCount: 982,
    bookable: true,
    image: brunch,
    tagline: "陽光灑落的台中週末儀式",
    description:
      "選用在地小農雞蛋與酸種麵包，主打地中海風格的健康早午餐。週末建議提前訂位，戶外座位區是寵物友善空間。",
    signature: ["酪梨班尼迪克", "酸種烤吐司", "希臘優格碗", "燕麥拿鐵"],
    station: "近草悟道，開車 5 分鐘",
  },
];

export const reviews = [
  {
    restaurantId: "lin-dong-fang",
    author: "美食阿宏",
    date: "2026-04-12",
    rating: 5,
    type: "在地" as const,
    content:
      "從學生時代吃到現在，湯頭依然是台北數一數二。半筋半肉軟嫩到入口即化，淋一勺辣牛油立刻昇華。深夜場最有氛圍，老闆娘永遠記得我點的麵硬度。",
  },
  {
    restaurantId: "lin-dong-fang",
    author: "Yuki さん",
    date: "2026-03-28",
    rating: 4,
    type: "旅客" as const,
    content:
      "從日本來台北玩，朋友一定要我吃這家。湯頭很乾淨不油膩，跟日本拉麵的厚重感完全不同，意外地好喝。辣牛油加一點就足夠。",
  },
  {
    restaurantId: "lin-dong-fang",
    author: "陳太太",
    date: "2026-02-14",
    rating: 5,
    type: "在地" as const,
    content:
      "牛腱切得漂亮，醬汁夠味不死鹹，配麵或單吃都好。價格雖然不便宜，但份量與品質對得起這個價錢。",
  },
];