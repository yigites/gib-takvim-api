# GİB Vergi Takvimi API

Gelir İdaresi Başkanlığı'nın `vergiTakvimi/specification/listAll` API'sinden çekilen verilerin JSON hâlinde sunulduğu hafif bir servis.

## 🚀 Amaç

- `payload-all.json` içinde tanımlı filtreyle tüm takvim maddelerini topluca almak
- `data/takvim.json` içinde `metadata` ve `items` yapılarını saklayıp GitHub Pages üzerinden sunmak
- GitHub Actions aracılığıyla düzenli güncelleme sağlamak

## 🧰 Kurulum ve manuel güncelleme

```bash
git clone https://github.com/YIGITES/gib-vergitakvimi-api.git
cd gib-vergitakvimi-api
npm install
npm run update
```

Bu işlem:

1. `npm run update` (ki bu script `daily-scraper.js` ile aynı) `startdate < gün sonu`, `stopdate > gün başı` koşullarını içeren POST gövdesiyle `listAll` endpoint'ini çağırır ve yalnızca o gün ekranında görünen maddeleri alır.
2. İstersen `payload-all.json` içeriğini kendi başına `node scraper.js` ile kullanarak tüm takvim girdilerini biriktirebilirsin; bu araç daha geniş raporlar için elimizde duruyor ama sürekli GitHub Actions ile çalışmıyor.
3. Geriye kalan adım yine `data/takvim.json` dosyasına `metadata` (fetch zamanı, page size gibi) ve `items` (takvim girdileri) olarak yazmak.

## 🗓 Günlük takvim

`npm run daily -- --date=2025-12-14` gibi bir komut günlük filtreyi çalıştırır ve varsayılan olarak `/data/takvim.json` dosyasını günceller; tarih belirtmezseniz bugünün tarihi kullanılır.

İstersen `--output=takvim-gunluk.json` gibi bir bayrak vererek farklı bir dosyaya yazdırabilirsin, ama API olarak bu dosyayı kullanacaksan varsayılan `takvim.json` sabit kalır. Komut tarayıcıdan çağrılan filtreyle aynı gövdeyi gönderir: `startdate < {gün sonu}` ve `stopdate > {gün başı}` koşulları sayesinde sadece ekran görüntüsündeki gibi o gün aktif olan maddeler döner. Üretken dosya da `metadata` içinde `requestedDay` içerir.

## ℹ️ Veri formatı

`data/takvim.json` şöyle bir yapıya sahiptir:

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

Alanlar:

- `title`, `description`: takvimde gösterilen metin
- `startdate`/`stopdate`: dönem aralığı
- `taxType`, `subject`, `periodDescription`: sınıflandırma bilgileri
- `priority`: kritik günler için 1, diğerleri 2 olarak geliyor

## 📡 API endpoint

GitHub Pages üzerinden yayımlanan dosya her güncellemede yenilenir:

- JSON: `https://yigites.github.io/gib-vergitakvimi-api/data/takvim.json`

## ⚙️ GitHub Actions akışı

- `.github/workflows/update.yml`: her saat `npm run update` çalıştırır ve değişiklikleri ana dala ittirir
- `.github/workflows/pages.yml`: `main` dalındaki değişimi GitHub Pages'a konuşlandırır

## ⚠️ Notlar

- `payload-all.json` içindeki filtreleri güncel takvim dönemiyle uyumlu hale getirirseniz yeniden `npm run update` çalıştırmanız yeterlidir
- GİB API'si alan adlarını değiştirdiğinde `scraper.js` içindeki `resultContainer` yapısına göre müdahale etmeniz gerekir

## 📦 API kullanımı ve GitHub akışı

- Depoyu ilk kez alırken `npm install` çalıştırın, ardından `npm run update` ile `payload-all.json` içindeki filtresiyle tüm takvim maddelerini çekip `data/takvim.json` dosyasına yazdırın. Bu JSON dosyasını GitHub Pages üzerinden `https://yigites.github.io/gib-vergitakvimi-api/data/takvim.json` adresinde yayınlıyoruz; tüketiciler bu adresi kendi uygulamalarında JSON API gibi kullanabilir.
- Kodda tarih filtresini özelleştirmek isterseniz `payload-all.json` içindeki `filterRange`, `selectedCategories`, `selectedTaxTypes` gibi alanları GİB sitesindeki `requestBody` örneğine göre güncelleyin ve `npm run update` ile tekrar çekin.
- Günlük görünüm (`Günlük`, `İlk günü bugün olanlar` gibi paneller) için `npm run daily -- --date=YYYY-MM-DD` çalıştırın. Bu komut varsayılan olarak `data/takvim.json` dosyasını tekrar yazar; sabit tutmak istersen `--output=takvim-gunluk.json` bayrağıyla alternatif hedef belirtebilirsiniz. Script, tarayıcıdaki filtreyle aynı POST gövdesini gönderir (`startdate < gün sonu`, `stopdate > gün başı`).
- GitHub Actions içinde `.github/workflows/update.yml` saatlik `npm run update`, `.github/workflows/pages.yml` ise `main` dalındaki `data/` dizinini GitHub Pages'a dağıtır; ilgili akışların sorunsuz çalışması için ana dalda `data/takvim.json` ve gerektiğinde diğer çıktılar tutulmalı.

