export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string;
  published: number;
  featured: number;
  published_at: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  reading_time?: string;
  author?: string;
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "ann-whatsapp-olcu",
    slug: "whatsapp-olcu-destegi",
    title: "Fotoğrafınızı Gönderin, Sistemi Birlikte Seçelim: WhatsApp ile Plise Perde Ölçü Desteği ve Ölçü Alma Rehberi",
    summary: "Plise perde, cam balkon ve kapı sistemlerinde milimetrik hatasız ölçü almanın püf noktaları. WhatsApp danışmanımıza pencerenizin fotoğrafını gönderin; fitil, kanat derinliği ve montaj paylarını birlikte hesaplayalım.",
    image_url: "/images/catalog/diamond.webp",
    published: 1,
    featured: 1,
    published_at: "2026-03-08T10:00:00.000Z",
    created_at: "2026-03-08T10:00:00.000Z",
    tags: ["Ölçü Rehberi", "Cam Balkon", "WhatsApp Destek", "Montaj"],
    reading_time: "5 dk okuma süresi",
    author: "Marel Plise Perde Teknik Ekibi",
    body: `Plise perde seçiminde müşterilerimizin en çok tereddüt ettiği konu **doğru ölçü alma** sürecidir. Standart hazır perdelerin aksine, plise perdeler pencerenizin milimetrik cam çıtası derinliğine ve cam yüzeyine tam oturacak şekilde kişiye özel üretilir.

Marel Plise Perde olarak, Türkiye'nin neresinde olursanız olun hatasız sipariş vermeniz için **WhatsApp Birebir Ölçü ve Sistem Danışmanlığı** sunuyoruz. Pencerenizin veya cam balkonunuzun bir fotoğrafını bize ilettiğinizde, uzman teknik ekibimiz profil tipinize en uygun montaj şeklini (vidalı veya yapıştırmalı) ve net ölçülerinizi sizinle birlikte belirler.

---

## Neden Fotoğraflı WhatsApp Desteği?

Her pencerenin profil derinliği, conta yapısı ve açılım mekanizması farklıdır. Özellikle katlanır cam balkonlarda kanatların birbirinin üzerine toplanması için profil kalınlığı ve kol payı kritik önem taşır.

- **Sıfır Hata Garantisi:** Ölçülerinizi siparişe girmeden önce fotoğrafla inceliyor, olası pay hatalarını önceden düzeltiyoruz.
- **Doğru Sistem Seçimi:** Vidalı montaj mı yoksa delme gerektirmeyen yapıştırmalı sistem mi uygun, pencerenizin çıta yapısına göre belirliyoruz.
- **Kumaş ve Renk Tavsiyesi:** Yaşam alanınızın güneş alma açısına göre tül, tam karartma (Blackout) veya ısı yalıtımlı (Honeycomb) serilerimizden en uygun olanını öneriyoruz.
- **Hızlı Dönüş:** WhatsApp hattımıza gönderdiğiniz görseller dakikalar içinde incelenip yanıtlanır.

[whatsapp-cta:WhatsApp ile Fotoğraf Gönderin & Ölçü Alın|Penceremin fotoğrafını gönderip plise perde ölçüsü ve fiyat desteği almak istiyorum.]

---

## Adım Adım Plise Perde Ölçüsü Nasıl Alınır?

Ölçü alırken mutlaka **çelik şerit metre** kullanınız. Terzi mezurası veya yumuşak şeritler esneme yaptığı için milimetrik sapmalara yol açabilir.

### 1. Cam İçi Montaj Ölçüsü (En Popüler Yöntem)
Cam içi montajda perde doğrudan camın önündeki çıta aralığına yerleştirilir. Bu sistemde perde pencerenin açılıp kapanmasını kesinlikle engellemez.

1. **En Ölçüsü:** Camın sol fitilinden sağ fitiline kadar olan genişliği ölçün. Ölçüyü camın en üstünden, ortasından ve altından olmak üzere 3 farklı noktadan alın. En küçük çıkan değeri not edin.
2. **Boy Ölçüsü:** Camın üst fitilinden alt fitiline kadar olan yüksekliği yine sağ, orta ve sol olmak üzere 3 noktadan ölçün. En küçük ölçüyü baz alın.

### 2. Yapıştırmalı (Vidasız) Sistem Ölçüsü
PVC pencerenizin profiline vida atmak istemiyorsanız özel yapışkanlı profiller kullanılır. Bu sistemde cam çıtasının düz yüzey genişliği ölçülür.

### 3. Cam Balkon Sistemleri İçin Ölçü
Cam balkonlarda her bir cam kanadı bağımsız açılıp katlandığı için her cam kanadı tek tek ölçülmelidir. Kanat genişliği ve yükseklik net cam fitil sınırları dahilinde alınır.

---

## Plise Perde Ölçü ve Montaj Seçenekleri Karşılaştırma Tablosu

Aşağıdaki tabloda pencereleriniz için uygulayabileceğiniz montaj alternatiflerini, gereken çıta derinliklerini ve avantajlarını inceleyebilirsiniz:

| Montaj Tipi | Minimum Çıta Derinliği | Vidalama Gerekir mi? | Uygulama Alanı | Temizlik & Pratiklik |
| :--- | :--- | :--- | :--- | :--- |
| **Cam İçi Vidalı** | 18 mm | Evet (Köşelerden 4 minik vida) | Tüm PVC ve Alüminyum pencereler | İplerden ayrılıp kolayca yıkanabilir |
| **Yapıştırmalı (Vidasız)** | 15 mm düz alan | Hayır (Özel 3M endüstriyel bant) | Delik açılması istenmeyen camlar | Güçlü tutunur, söküldüğünde iz bırakmaz |
| **Cam Balkon Klipsli** | 12 mm | Klipsli / Vidalı | Katlanır ve sürme cam balkonlar | Kanat katlanmalarında birbirine sürtmez |
| **Kapı & Sineklik Kasa** | 25 mm | Vidalı dış çerçeve | Balkon kapıları, Fransız balkonlar | Çift yönlü bağımsız açılır akordiyon |

---

## Fotoğraf Çekerken Dikkat Edilecek 3 İpucu

Teknik ekibimize WhatsApp üzerinden fotoğraf gönderirken şu 3 detaya dikkat etmeniz süreci çok hızlandırır:

1. **Pencereyi Tam Karşıdan Çekin:** Pencerenin tamamını, özellikle açılır kanadı, kolu ve menteşeyi kapsayacak şekilde genel bir açıdan fotoğraflayın.
2. **Cam Çıtası Detayı:** Cam ile plastik profilin birleştiği fitil köşesini 30-40 cm mesafeden yakından çekin (çıtanın düz mü, oval mi veya açılı mı olduğunu anlamamız için gereklidir).
3. **Yaklaşık Ölçü Notu:** Metreyle aldığınız tahmini en x boy ölçüsünü fotoğrafın altına ekleyin.

[whatsapp-cta:Hemen Fotoğraf Gönderin (0546 735 66 02)|Merhaba, penceremin fotoğrafını çektim. Plise perde ölçüsü için danışmak istiyorum.]

---

## Marel Plise Perde Kalitesi: Elbistan'dan Tüm Türkiye'ye

Kahramanmaraş Elbistan'daki entegre üretim tesisimizde üretilen tüm plise perdelerimiz;
- **1. Sınıf Leke Tutmaz Kumaşlar:** Antistatik kaplama sayesinde toz tutmaz, nemli bezle veya ılık suyla kolayca silinir.
- **Kalın Eloksallı Alüminyum Profiller:** Eğilme, bükülme veya paslanma yapmaz; güneş ışınlarına ve sıcağa tam dayanıklıdır.
- **Kopmaz Paraşüt İpleri:** Yüksek sürtünme dayanımlı örgü ipler mekanizmanın yıllarca pürüzsüz kaymasını sağlar.
- **1.000 ₺ Üzeri Ücretsiz Kargo:** Türkiye'nin 81 iline korunaklı özel kutusunda ücretsiz ve sigortalı ulaştırılır.

---

## Sıkça Sorulan Sorular (SSS)

### Ölçüyü yanlış alırsam ne olur?
Siparişinizi vermeden önce veya verdikten hemen sonra WhatsApp hattımız üzerinden ölçülerinizi ve pencere fotoğrafınızı birlikte teyit ediyoruz. Karşılıklı onay alınmadan üretime başlanmadığı için hata riski tamamen ortadan kalkar.

### Plise perde cam balkon kanatlarının katlanmasını engeller mi?
Kesinlikle engellemez. Marel plise perdelerin alüminyum profil et payı yalnızca 16 mm kalınlığındadır. Bu incelik sayesinde cam balkon kanatları birbirinin üzerine toplanırken perdeler birbirine temas etmez veya sıkışmaz.

### Plise perde nasıl temizlenir?
Plise perdelerimiz toz tutmayan özel kumaş yapısına sahiptir. Günlük temizlikte toz alma püskülü veya nemli bir mikrofiber bezle silmeniz yeterlidir. İstenirse montaj ayaklarından çıtçıt sistemiyle tek hamlede sökülüp duş altında ılık suyla yıkanabilir ve tekrar yerine asılarak kurutulabilir.

### Kargoya veriliş süresi kaç gündür?
Ölçü onayı tamamlandıktan sonra siparişiniz 24 ila 48 saat içerisinde kişiye özel olarak üretilir ve korunaklı ambalajıyla MNG / Yurtiçi Kargo güvencesiyle sevk edilir.`
  },
  {
    id: "ann-olcuye-ozel",
    slug: "olcuye-ozel-uretim-rehberi",
    title: "Ölçüye Özel Plise Perde Üretim Süreci: Siparişten Teslimata Tüm Aşamalar",
    summary: "Ölçü teyidinden lazer kumaş kesimine, pile presinden dayanıklılık testlerine kadar Marel atölyesindeki milimetrik üretim adımlarını keşfedin.",
    image_url: "/images/real/diamond-beyaz-siyah-ip.jpeg",
    published: 1,
    featured: 1,
    published_at: "2026-03-05T09:00:00.000Z",
    created_at: "2026-03-05T09:00:00.000Z",
    tags: ["Üretim", "Kalite Standartları", "Özel Sipariş"],
    reading_time: "4 dk okuma süresi",
    author: "Marel Üretim Departmanı",
    body: `Plise perde üretiminde her milimetre önemlidir. Hazır ölçülü seri üretim perdelerin aksine, Marel atölyesinde her perde müşterinin verdiği net pencere boyutlarına göre tekil olarak işlenir.

Peki web sitemizden veya WhatsApp üzerinden sipariş verdiğiniz andan kapınıza gelene kadar hangi aşamalardan geçer? İşte şeffaf üretim sürecimiz:

---

## 1. Aşama: Sipariş Analizi ve Ölçü Teyidi
Siparişiniz sisteme düştüğünde müşteri danışmanımız cam ve profil ölçülerinizi inceler. Gerekli durumlarda WhatsApp üzerinden pencere açılım yönü ve kol mesafesi doğrulanır.

## 2. Aşama: Lazer Ölçüm ve Kumaş Kesimi
Kumaşlar, seçtiğiniz modelin (Diamond, Blackout, Honeycomb veya Desenli seriler) orijinal rulosundan otomatik kesim masalarında sıfır çapakla kesilir. Pile aralıkları milimetrik simetriyle korunur.

## 3. Aşama: Alüminyum Profil İşleme
Perdenin üst ve alt taşıyıcı profilleri, elektrostatik fırın boyalı birinci sınıf alüminyum çubuklardan kesilir. Kumaş renginize veya pencere renginize (Beyaz, Antrasit, Krem, Kahve, Meşe, Altınmeşe) uygun profil seçilir.

| Üretim Adımı | Kullanılan Malzeme | Tolerans Değeri | Kalite Kontrol Noktası |
| :--- | :--- | :--- | :--- |
| **Kumaş Kesimi** | 1. Sınıf Polyester / Termal | ± 1 mm | Leke ve ip çekilme kontrolü |
| **Profil Kesimi** | Eloksallı Alüminyum | ± 0.5 mm | Çapak temizliği ve boya kontrolü |
| **İp Dizilimi** | Yüksek Mukavemetli Polyester İp | Eşit gerilim | Dengeli açılma-kapanma testi |
| **Son Kontrol** | Montaj aparatı & ambalaj | 0 Hata | Test sehpasında 5 kez tam açılım |

---

## 4. Aşama: Gergi İpleri ve Mekanizma Montajı
Plise perdenin yıllar boyunca sarkmadan düz durmasını sağlayan unsur gergi iplerinin gerilimidir. Atölyemizde uzman ustalarımız ipleri özel gergi yayları ile dengeli biçimde sabitler.

## 5. Aşama: Test ve Korunaklı Paketleme
Her perde kargolanmadan önce test sehpasında yukarı ve aşağı 5 kez hareket ettirilir. Sorunsuz çalışan perdeler darbe emici balonlu naylon ve sert mukavva silindir/kutu içine konularak kargoya verilir.`
  },
  {
    id: "ann-honeycomb-isi",
    slug: "honeycomb-isi-yalitimi",
    title: "Honeycomb (Bal Peteği) Plise Perde ile Dört Mevsim Isı Yalıtımı ve Enerji Tasarrufu",
    summary: "Hücresel altıgen hava kanalları sayesinde kışın ısı kaybını önleyen, yazın ise güneş ışınlarını kırarak serinlik sağlayan Honeycomb teknolojisini yakından inceleyin.",
    image_url: "/images/hero/marel-honeycomb-hero-v3.png",
    published: 1,
    featured: 1,
    published_at: "2026-03-01T08:00:00.000Z",
    created_at: "2026-03-01T08:00:00.000Z",
    tags: ["Honeycomb", "Isı Yalıtımı", "Enerji Tasarrufu", "Blackout"],
    reading_time: "4 dk okuma süresi",
    author: "Marel İnovasyon & Ar-Ge",
    body: `Modern mimaride geniş cam yüzeyler ve cam balkonlar evlere ferahlık katarken, kışın ısı kaybına yazın ise aşırı ısınmaya sebep olabilir. **Honeycomb (Hücresel Bal Peteği) Plise Perde**, bu sorunu estetik ve bilimsel bir yaklaşımla çözer.

---

## Honeycomb Teknolojisi Nasıl Çalışır?

Honeycomb kumaşların kesitine bakıldığında altıgen bal peteği şeklinde hava kanalları görülür. Bu kapalı hava hücreleri, pencere camı ile oda sıcaklığı arasında doğal bir **termal bariyer (yalıtım tamponu)** oluşturur.

- **Kışın:** Evdeki sıcak havanın soğuk cam yüzeyine çarparak soğumasını engeller. Isıtma giderlerinde %25 ila %40 oranında tasarruf sağlar.
- **Yazın:** Güneşten gelen doğrudan ultraviyole (UV) ve kızılötesi ışınları geri yansıtarak iç mekânın klima yükünü hafifletir.
- **Ses Yalıtımı:** Çift katmanlı hücresel yapı sokaktan gelen yankı ve ses dalgalarını sönümleyerek daha sessiz bir oda ortamı sunar.

---

## Standart Perde vs. Honeycomb Karşılaştırması

| Özellik | Standart Tül / Kumaş | Standart Plise Perde | Honeycomb Plise Perde |
| :--- | :--- | :--- | :--- |
| **Isı İzolasyonu** | Çok düşük (%5) | Orta (%15) | **Çok Yüksek (%40'a kadar)** |
| **Görünür İp Delikleri** | Var | Kumaş ortasından geçer | **Deliksiz (Gizli ip kanalı)** |
| **Işık Karartma (Blackout)** | Yetersiz | Kısmi | **%100 Tam Karartma Seçeneği** |
| **Ses İzolasyonu** | Yok | Düşük | **Belirgin akustik sönümleme** |
| **Kullanım Alanı** | Klasik korniş | Tüm pencereler & cam balkon | Yatak odaları, ofisler, kış bahçeleri |

[whatsapp-cta:Honeycomb Modelleri ve Kumaş Kartelası İçin Yazın|Honeycomb plise perde modelleri, renk kartelası ve fiyat bilgisi almak istiyorum.]

---

## Gizli İp Kanalı ile %100 Karartma Deneyimi

Standart plise perdelerde ipler kumaşın üzerindeki küçük deliklerden geçer. Honeycomb perdelerde ise ipler altıgen hücrelerin içinden geçtiği için kumaş yüzeyinde hiçbir iğne deliği bulunmaz.

Özellikle bebek odalarında, yatak odalarında, projeksiyon veya sinema odalarında ışık sızmasını tamamen kesmek isteyenler için alüminyum yan ray profilli Honeycomb Blackout modelimiz rakipsiz bir çözümdür.`
  }
];
