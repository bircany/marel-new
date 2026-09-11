export interface SeriesItem {
  id: string;
  code: string;
  image: string;
  name: string;
  price: number;
  slug?: string;
}

export interface SeriesGroup {
  id: string;
  title: string;
  basePrice: number;
  items: SeriesItem[];
}

export const YAREN_SERIES_LIST: SeriesGroup[] = [
  {
    id: "diamond",
    title: "DIAMOND SERIES",
    basePrice: 550,
    items: [
      { id: "dia-100", code: "DİAMOND-100", image: "/images/yaren/diamond100.png", name: "Diamond Beyaz", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-101", code: "DİAMOND-101", image: "/images/yaren/diamond101.png", name: "Diamond Ekru", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-102", code: "DİAMOND-102", image: "/images/yaren/diamond102.png", name: "Diamond Gri", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-103", code: "DİAMOND-103", image: "/images/yaren/diamond103.png", name: "Diamond Ara-Gri", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-104", code: "DİAMOND-104", image: "/images/yaren/diamond104.png", name: "Diamond Vizon", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-105", code: "DİAMOND-105", image: "/images/yaren/diamond105.png", name: "Diamond Bej", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-108", code: "DİAMOND-108", image: "/images/yaren/diamond108.png", name: "Diamond Krem", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-109", code: "DİAMOND-109", image: "/images/yaren/diamond109.png", name: "Diamond Açık Gri", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-110", code: "DİAMOND-110", image: "/images/yaren/diamond110.png", name: "Diamond Antrasit", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-111", code: "DİAMOND-111", image: "/images/yaren/diamond111.png", name: "Diamond Siyah", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-112", code: "DİAMOND-112", image: "/images/yaren/diamond112.png", name: "Diamond Füme", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-113", code: "DİAMOND-113", image: "/images/yaren/diamond113.png", name: "Diamond Kahve", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-yesil", code: "DİAMOND-YEŞİL", image: "/images/yaren/diamondyesil.png", name: "Diamond Yeşil", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-mavi", code: "DİAMOND-MAVİ", image: "/images/yaren/diamondmavi.png", name: "Diamond Mavi", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-kirmizi", code: "DİAMOND-KIRMIZI", image: "/images/yaren/diamondkirmizi.png", name: "Diamond Kırmızı", price: 550, slug: "diamond-series-plise-perde" },
      { id: "dia-turuncu", code: "DİAMOND-TURUNCU", image: "/images/yaren/diamondmudanya.png", name: "Diamond Turuncu", price: 550, slug: "diamond-series-plise-perde" },
    ]
  },
  {
    id: "touch",
    title: "TOUCH SERIES",
    basePrice: 605,
    items: [
      { id: "touch-1001", code: "TOUCH-1001", image: "/images/yaren/TOUCH-1001.png", name: "Touch Bej", price: 605, slug: "touch-series-plise-perde" },
      { id: "touch-1002", code: "TOUCH-1002", image: "/images/yaren/TOUCH-1002.png", name: "Touch Gri", price: 605, slug: "touch-series-plise-perde" },
      { id: "touch-1003", code: "TOUCH-1003", image: "/images/yaren/TOUCH-1003.png", name: "Touch Antrasit", price: 605, slug: "touch-series-plise-perde" },
      { id: "touch-1004", code: "TOUCH-1004", image: "/images/yaren/TOUCH-1004.png", name: "Touch Kahve", price: 605, slug: "touch-series-plise-perde" },
    ]
  },
  {
    id: "new",
    title: "NEW SERIES",
    basePrice: 605,
    items: [
      { id: "new-2001", code: "NEW-2001", image: "/images/yaren/NEW-2001.png", name: "New Bej", price: 605, slug: "new-series-plise-perde" },
      { id: "new-2002", code: "NEW-2002", image: "/images/yaren/NEW-2002.png", name: "New Antrasit", price: 605, slug: "new-series-plise-perde" },
      { id: "new-2003", code: "NEW-2003", image: "/images/yaren/NEW-2003.png", name: "New Gri", price: 605, slug: "new-series-plise-perde" },
      { id: "new-2004", code: "NEW-2004", image: "/images/yaren/NEW-2004.png", name: "New Füme", price: 605, slug: "new-series-plise-perde" },
      { id: "new-2005", code: "NEW-2005", image: "/images/yaren/NEW-2005.png", name: "New Bordo", price: 605, slug: "new-series-plise-perde" },
    ]
  },
  {
    id: "tulle",
    title: "TULLE SERIES",
    basePrice: 605,
    items: [
      { id: "tulle-1", code: "TULLE SERIES", image: "/images/yaren/TULLE-01_-scaled.jpg", name: "Tülle Serisi", price: 605, slug: "tulle-series-plise-perde" },
    ]
  },
  {
    id: "efe",
    title: "EFE SERIES",
    basePrice: 605,
    items: [
      { id: "efe-3001", code: "EFE-3001", image: "/images/yaren/EFE-3001.png", name: "Efe Bej", price: 605, slug: "efe-series-plise-perde" },
      { id: "efe-3002", code: "EFE-3002", image: "/images/yaren/EFE-3002.png", name: "Efe Gri", price: 605, slug: "efe-series-plise-perde" },
      { id: "efe-3003", code: "EFE-3003", image: "/images/yaren/EFE-3003.png", name: "Efe Antrasit", price: 605, slug: "efe-series-plise-perde" },
    ]
  },
  {
    id: "ece",
    title: "ECE SERIES",
    basePrice: 605,
    items: [
      { id: "ece-4001", code: "ECE-4001", image: "/images/yaren/ECE-4001.png", name: "Ece Bej", price: 605, slug: "ece-series-plise-perde" },
      { id: "ece-4002", code: "ECE-4002", image: "/images/yaren/ECE-4002.png", name: "Ece Gri", price: 605, slug: "ece-series-plise-perde" },
      { id: "ece-4003", code: "ECE-4003", image: "/images/yaren/ECE-4003.png", name: "Ece Antrasit", price: 605, slug: "ece-series-plise-perde" },
    ]
  },
  {
    id: "blackout",
    title: "BLACKOUT SERIES",
    basePrice: 1166,
    items: [
      { id: "bo-krem", code: "BLACKOUT-KREM", image: "/images/yaren/BLACOUT-KREM.png", name: "Blackout Krem", price: 1166, slug: "blackout-series-plise-perde" },
      { id: "bo-gri", code: "BLACKOUT-GRİ", image: "/images/yaren/BLACOUT-GRI.png", name: "Blackout Gri", price: 1166, slug: "blackout-series-plise-perde" },
      { id: "bo-antrasit", code: "BLACKOUT-ANTRASİT", image: "/images/yaren/BLACOUT-ANTRASIT.png", name: "Blackout Antrasit", price: 1166, slug: "blackout-series-plise-perde" },
      { id: "bo-kahve", code: "BLACKOUT-KAHVE", image: "/images/yaren/BLACOUT-KAHVE.png", name: "Blackout Kahve", price: 1166, slug: "blackout-series-plise-perde" },
      { id: "bo-siyah", code: "BLACKOUT-SİYAH", image: "/images/yaren/BLACOUT-SIYAH.png", name: "Blackout Siyah", price: 1166, slug: "blackout-series-plise-perde" },
    ]
  },
  {
    id: "honeycomb",
    title: "HONEYCOMB SERIES",
    basePrice: 1166,
    items: [
      { id: "honey-001", code: "HONEY-001", image: "/images/yaren/HONEY-001.png", name: "Honeycomb Beyaz", price: 1166, slug: "honeycomb-series-plise-perde" },
      { id: "honey-002", code: "HONEY-002", image: "/images/yaren/HONEY-002.png", name: "Honeycomb Krem", price: 1166, slug: "honeycomb-series-plise-perde" },
      { id: "honey-003", code: "HONEY-003", image: "/images/yaren/HONEY-003.png", name: "Honeycomb Gri", price: 1166, slug: "honeycomb-series-plise-perde" },
      { id: "honey-004", code: "HONEY-004", image: "/images/yaren/HONEY-004.png", name: "Honeycomb Antrasit", price: 1166, slug: "honeycomb-series-plise-perde" },
      { id: "honey-005", code: "HONEY-005", image: "/images/yaren/HONEY-005.png", name: "Honeycomb Kahve", price: 1166, slug: "honeycomb-series-plise-perde" },
    ]
  },
  {
    id: "dark",
    title: "DARK SERIES",
    basePrice: 825,
    items: [
      { id: "dark-5001", code: "DARK-5001", image: "/images/yaren/DARK-5001.png", name: "Dark Antrasit", price: 825, slug: "dark-series-plise-perde" },
      { id: "dark-5002", code: "DARK-5002", image: "/images/yaren/DARK-5002.png", name: "Dark Krem", price: 825, slug: "dark-series-plise-perde" },
      { id: "dark-5003", code: "DARK-5003", image: "/images/yaren/DARK-5003.png", name: "Dark Gri", price: 825, slug: "dark-series-plise-perde" },
      { id: "dark-5004", code: "DARK-5004", image: "/images/yaren/DARK-5004.png", name: "Dark Kahve", price: 825, slug: "dark-series-plise-perde" },
    ]
  },
  {
    id: "bambu",
    title: "BAMBU SERIES",
    basePrice: 660,
    items: [
      { id: "bambu-6001", code: "BAMBU-6001", image: "/images/yaren/BAMBU-6001.png", name: "Bambu Açık Gri", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6002", code: "BAMBU-6002", image: "/images/yaren/BAMBU-6002.png", name: "Bambu Gri", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6003", code: "BAMBU-6003", image: "/images/yaren/BAMBU-6003.png", name: "Bambu Beyaz", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6004", code: "BAMBU-6004", image: "/images/yaren/BAMBU-6004.png", name: "Bambu Krem", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6005", code: "BAMBU-6005", image: "/images/yaren/BAMBU-6005.png", name: "Bambu Vizon", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6006", code: "BAMBU-6006", image: "/images/yaren/BAMBU-6006.png", name: "Bambu Kahve", price: 660, slug: "bambu-series-plise-perde" },
      { id: "bambu-6007", code: "BAMBU-6007", image: "/images/yaren/BAMBU-6007.png", name: "Bambu Antrasit", price: 660, slug: "bambu-series-plise-perde" },
    ]
  },
  {
    id: "silver",
    title: "SILVER SERIES",
    basePrice: 770,
    items: [
      { id: "silver-7001", code: "SILVER-7001", image: "/images/yaren/SILVER-7001.png", name: "Silver Beyaz", price: 770, slug: "silver-series-plise-perde" },
      { id: "silver-7002", code: "SILVER-7002", image: "/images/yaren/SILVER-7002.png", name: "Silver Gri", price: 770, slug: "silver-series-plise-perde" },
      { id: "silver-7003", code: "SILVER-7003", image: "/images/yaren/SILVER-7003.png", name: "Silver Krem", price: 770, slug: "silver-series-plise-perde" },
      { id: "silver-7004", code: "SILVER-7004", image: "/images/yaren/SILVER-7004.png", name: "Silver Antrasit", price: 770, slug: "silver-series-plise-perde" },
      { id: "silver-7005", code: "SILVER-7005", image: "/images/yaren/SILVER-7005.png", name: "Silver Siyah", price: 770, slug: "silver-series-plise-perde" },
    ]
  },
  {
    id: "gold",
    title: "GOLD SERIES",
    basePrice: 770,
    items: [
      { id: "gold-8001", code: "GOLD-8001", image: "/images/yaren/GOLD-8001.png", name: "Gold Gri", price: 770, slug: "gold-series-plise-perde" },
      { id: "gold-8002", code: "GOLD-8002", image: "/images/yaren/GOLD-8002.png", name: "Gold Beyaz", price: 770, slug: "gold-series-plise-perde" },
      { id: "gold-8003", code: "GOLD-8003", image: "/images/yaren/GOLD-8003.png", name: "Gold Krem", price: 770, slug: "gold-series-plise-perde" },
      { id: "gold-8004", code: "GOLD-8004", image: "/images/yaren/GOLD-8004.png", name: "Gold Vizon", price: 770, slug: "gold-series-plise-perde" },
      { id: "gold-8005", code: "GOLD-8005", image: "/images/yaren/GOLD-8005.png", name: "Gold Antrasit", price: 770, slug: "gold-series-plise-perde" },
    ]
  }
];
