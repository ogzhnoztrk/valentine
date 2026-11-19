# Just One Question

Sevgiline gönderebileceğin, sahneden sahneye ilerleyen küçük bir romantik sürpriz sitesi. Backend yok. Tarayıcıda açılır, GitHub Pages’te ücretsiz yayınlanır.

## Göndermeden önce

Bütün kişisel metinler `src/config.ts` içinde.

1. `herName` ve `myName` alanlarını doldur. İstersen cümlelerin içine de adını yaz.
2. Fotoğrafını `public/photos/` klasörüne koy. Örnek: `public/photos/biz.jpg`
3. `finale.photo` değerini o dosyaya çevir: `photos/biz.jpg`
4. Müzik kullanacaksan dosyaları `public/music/` içine, config’deki adlarla koy.
5. Dosyasını eklemediğin şarkıları `music.tracks` listesinden sil. Aksi halde o parçaya geçilince “melodi henüz eklenmemiş” uyarısı çıkar.
6. `npm run dev` ile baştan sona bir kez kendin dene.

Yerleşik parça orijinal, yumuşak bir piyano döngüsü. Tarayıcı üretir; indirilecek bir dosya yoktur.

## Müzik ve telif

Careless Whisper, La Vie En Rose ve Can't Help Falling in Love bu projeye **gömülü değildir**. Bu isimler yalnızca senin kendi lisanslı dosyanı koyabileceğin yuvalardır.

- Telifli bir kaydı iznin yoksa repoya ekleme.
- Özellikle herkese açık bir GitHub reposuna telifli mp3 yükleme.
- İstediğin telifsiz veya satın aldığın enstrümantal kaydı ilgili dosya adıyla `public/music/` içine bırakabilirsin.

Beklenen dosya adları:

| Parça | Dosya |
| --- | --- |
| La Vie En Rose | `public/music/la-vie-en-rose.mp3` |
| Can't Help Falling in Love | `public/music/cant-help-falling-in-love.mp3` |
| Careless Whisper | `public/music/careless-whisper.mp3` |

Farklı bir ad kullanırsan yolu `src/config.ts` içinde değiştir. Müzik, sahne değişince kesilmez. Oynatma, duraklatma ve seviye sağ üstteki kontrolde.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## GitHub Pages

Proje göreli asset yolu kullanır (`base: './'`). Kullanıcı sitesinde de proje sitesinde de aynı build çalışır. Fotoğraf ve müzik `public/` altından gelir.

1. GitHub’da yeni bir depo aç.
2. Bu klasörü o depoya pushla. Ana dal `main` veya `master` olsun.
3. Depoda **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.
4. `main` dalına push yeter. `.github/workflows/deploy.yml` siteyi derleyip yayınlar.
5. İş bitince adres şuna benzer: `https://kullaniciadin.github.io/depo-adi/`

Ücretsiz GitHub Pages, herkese açık depolar içindir. Depoyu gizli tutup sayfayı yayınlamak GitHub’ın ücretli planını gerektirir. Telifli müzik ekleyeceksen bunu ayrıca düşün.

Sayfa boş kalırsa Pages kaynağının GitHub Actions olduğunu ve Actions sekmesinde deploy’un yeşil bittiğini kontrol et.

## Sahneler

1. Açılış sözü ve kalp. **Sürprizi Aç** kalbi büyütüp sonraki sahneye geçer.
2. Üç kart. Hepsi çevrilince birkaç saniye sonra soru gelir.
3. Evet / Hayır. Hayır her seferinde yazısını değiştirir, Evet büyür. Cümleler bitince Hayır küçülüp kaçar. Evet kutlamadan finale geçer.
4. Fotoğraf ve kapanış.

Küçük sırlar:

- Sol üstte nabız gibi duran kalbe bas.
- Fotoğrafa üç kez dokun.
- Son ekranda boş bir yere dokununca küçük kalpler yükselir.

## Yapı

- `src/config.ts` — metinler, isimler, fotoğraf, müzik
- `public/photos/` — fotoğraf
- `public/music/` — senin ses dosyaların
- `src/components/scenes/` — dört sahne
