# GİB Vergi Takvimi API

Bu proje Gelir İdaresi Başkanlığı'nın `vergiTakvimi/specification/listAll` endpoint'ini düzenli olarak çağırarak JSON çıktıyı GitHub Pages'e yayımlayan hafif bir servis sunar. Ekstra bir sunucuya gerek kalmadan `data/takvim.json` dosyasını güncel tutar ve veriyi tüketen uygulamalar, doğrudan bu URL'i JSON API gibi kullanabilir.

## Yapılanlar

- `payload-all.json` içindeki filtreyle GİB'in vergi takvimi maddelerini topluca çeker.
- `daily-scraper.js` ve `scraper.js` içinde tanımlı POST gövdeleriyle `listAll` endpoint'ine istek gönderip yalnızca cari gün içeriğini alır.
- `data/takvim.json` içinde `metadata` (fetch zamanı, sayfa infosu) ve `items` (takvim girdileri) yapısını tutar.
- Saatlik GitHub Actions akışları `npm run update` komutunu çalıştırarak `data/takvim.json`'u ana dala yazdırır ve Pages çıktısını güncel tutar.

## Kurulum

1. Depoyu klonlayın ve bağımlılıkları kurun:
   ```bash
   git clone https://github.com/yigites/gib-vergitakvimi-api.git
   cd gib-vergitakvimi-api
   npm install
   ```
2. `payload-all.json` içindeki `filterRange`, `selectedCategories`, `selectedTaxTypes` gibi alanları ihtiyaç duyduğunuz tarihlere göre ayarlayın.
3. İlk veriyi çekmek için:
   ```bash
   npm run update
   ```

`npm run update` komutu `daily-scraper.js` ile aynı script'i çalıştırır; POST gövdesini `startdate < gün sonu` ve `stopdate > gün başı` şekilde ayarlayarak GİB'ten ilgili takvim maddelerini çeker.

## Kullanım örnekleri

- `npm run daily -- --date=2025-12-14`: belirtilen tarih için `data/takvim.json` dosyasını günceller (varsayılan olarak bugünün tarihi kullanılır).
- `npm run daily -- --output=takvim-gunluk.json`: farklı çıktılar yazmak için `--output` bayrağını kullanın.
- `node scraper.js`: `payload-all.json` filtresini kullanarak tüm takvim maddelerini çekip `data/takvim.json`'a yazar.

## Proje yapısı

- `daily-scraper.js`, `scraper.js`: GİB API'sine yapılacak POST isteklerini yöneten scriptler.
- `capture-tax.js`, `vergi-page.js`, `inspect.js`, `tax-calendar.html`: elde edilen veriyi doğrulama ve görselleştirme araçları.
- `payload-all.json`: takvim filtresi ve istek gövdesi.
- `data/`: `takvim.json` ve (isteğe bağlı) `takvim-gunluk.json` gibi çıktılar.
- `.github/workflows/update.yml`: saatlik `npm run update` çalıştırır ve değişiklikleri ana dala iter.
- `.github/workflows/pages.yml`: `main` dalındaki `data/` klasörünü GitHub Pages'e dağıtır.

## JSON çıktısı yapısı

`data/takvim.json` şu yapıya sahiptir:

```json
{
  "metadata": {
    "fetchedAt": "14-12-2025",
    "pageSize": 1000,
    "totalItems": 620,
    "pagesFetched": 1
  },
  "items": [
    {
      "id": 1073,
      "title": "Motorlu Taşıtlar Vergisi Taksit Ödemesi",
      "description": "2025 Yılı 1. Taksit",
      "startdate": "01-01-2025",
      "stopdate": "31-01-2025",
      "priority": 1,
      "taxType": "Motorlu Taşıtlar Vergisi",
      "subject": "Ödeme",
      "periodDescription": "2025 Yılı 1. Taksit"
    }
  ]
}
```

`items` içindeki her obje şu alanları içerir:

- `title`, `description`: GİB takvimindeki metinler.
- `startdate`, `stopdate`: dönemin başlangıç ve bitiş tarihleri.
- `taxType`, `subject`, `periodDescription`: sınıflandırma bilgileri.
- `priority`: kritik öğeleri öne çıkarmak için 1/2 değerleri.

## Yayınlama

GitHub Actions ana daldaki `data/takvim.json` değişimlerini `https://yigites.github.io/gib-vergitakvimi-api/data/takvim.json` adresine dağıtır. Bu URL'i kendi uygulamanızda JSON API gibi kullanabilirsiniz.

---

## ⚖️ Yasal Uyarı / Disclaimer

Bu proje, Gelir İdaresi Başkanlığı'nın vergi takvimi verilerini kullanan **gayri resmi (unofficial)** bir araçtır.

* **Veri Sahipliği:** Tüm takvim girdileri orijinal GİB sitesine aittir; bu repo sadece düzenli olarak çekip tek dosyada toplar.
* **Sorumluluk Reddi:** Verilerin doğruluğu ve güncelliği GİB sunucularına bağlıdır. Kritik kararlar için her zaman resmi GİB sayfalarını kullanın.
* **Kullanım Koşulları:** Bu script'ten gelen istekler GİB'in kullanım koşullarına ve `robots.txt` kurallarına uygun olmalıdır.

---

### 🌍 English Version

This is an **unofficial** scraper that aggregates the Turkish Revenue Administration's calendar data.

* **Data Ownership:** All calendar entries belong to GİB.
* **No Warranty:** No guarantee is provided for timeliness or accuracy; verify with the official GİB portal.
* **Liability:** Use of this repository is at your own risk. The maintainer is not liable for disruptions caused by scraping failures or misuse.

