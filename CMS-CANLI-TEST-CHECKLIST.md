# 5 Dakikalık Canlı CMS Test Checklisti

## Amaç
Pages CMS üzerinden yapılan içerik girişlerinin (ürün/blog) repoya yazıldığını ve lokal sitede doğru göründüğünü hızlıca doğrulamak.

## Ön Koşul
- Repo: `UlasCanSaru/arslan-celik-kapi`
- Lokal site açık: `http://127.0.0.1:4321/`
- Pages CMS erişimi: `https://app.pagescms.org`

## 0:00 - 0:30 | Giriş ve Repo Seçimi
1. `https://app.pagescms.org` adresine GitHub ile giriş yap.
2. `UlasCanSaru/arslan-celik-kapi` reposunu aç.
3. Sol menüde `Ürünler` ve `Blog` koleksiyonlarını gördüğünü doğrula.

## 0:30 - 2:00 | Ürün Ekleme Testi
1. `Ürünler` koleksiyonunda `Yeni` kayıt oluştur.
2. Zorunlu alanları doldur:
   - Ürün Adı
   - Model Kodu
   - Kategori
   - Kısa Açıklama
   - Ölçü
   - Renk
   - Malzeme
   - Görsel
3. `Taslak (Draft)` alanını `false` bırak.
4. Kaydet/Publish et.

## 2:00 - 3:00 | Blog Ekleme Testi
1. `Blog` koleksiyonunda `Yeni` kayıt oluştur.
2. Zorunlu alanları doldur:
   - Başlık
   - Özet
   - Yayın Tarihi
   - Kapak Görseli
   - İçerik
3. `Taslak (Draft)` alanını `false` bırak.
4. Kaydet/Publish et.

## 3:00 - 4:00 | GitHub Dosya Yazımı Doğrulama
1. GitHub repo içinde yeni dosyaları kontrol et:
   - `src/content/products/*.md`
   - `src/content/blog/*.md`
2. Görsellerin geldiğini doğrula:
   - `public/images/products/...`
   - `public/images/blog/...`

## 4:00 - 5:00 | Sitede Görünürlük Doğrulama
1. Ürün listesinde kaydı kontrol et: `http://127.0.0.1:4321/urunler/`
2. Ürün detay sayfasına girip alanları doğrula (model kodu, ölçü, renk, malzeme, görsel).
3. Blog listesinde kaydı kontrol et: `http://127.0.0.1:4321/blog/`
4. Blog detay sayfasına girip içerik doğrula.

## Hızlı Hata Kontrolü
- Kayıt CMS’de var ama sitede yoksa:
  - `draft` alanı `true` olabilir.
  - Zorunlu alanlardan biri boş kalmış olabilir.
- Görsel görünmüyorsa:
  - Görsel yolu `public/images` altında mı kontrol et.
- "Siteyi Yayınla" çalışmıyorsa:
  - Bu normal olabilir; `TURHOST_FTP_*` secret'ları henüz girilmediyse deploy başarısız olur.

## Test Sonu Başarılı Kriteri
- CMS’den eklenen ürün ve blog içeriği hem repoda dosya olarak oluşmuş hem de lokal sitede görünür durumda olmalı.
