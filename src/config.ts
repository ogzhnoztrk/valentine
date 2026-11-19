/**
 * Bütün kişisel metinler burada.
 * Cümleleri, isimleri, fotoğrafı ve müzik dosyalarını değiştirmek için
 * component dosyalarına girmen gerekmez.
 *
 * Fotoğraf: public/photos/ içine koy, yolu aşağıya yaz.
 * Müzik: public/music/ içine koy. Telifli şarkıyı yalnızca kullanma hakkın varsa ekle.
 * Göndermeden önce dosyasını eklemediğin parçaları listeden sil.
 */

export type MusicTrack = {
  id: string
  title: string
  artist: string
  /** null ise yerleşik orijinal piyano çalar. Dolu ise public klasörüne göre yol. */
  src: string | null
}

export const siteConfig = {
  metaTitle: 'Aşkıma',
  metaDescription: '',

  /** Polaroid üzerinde görünür. Boş bırakırsan sadece küçük bir kalp kalır. */
  herName: '',
  /** Finalde ince bir imza. Boş bırakırsan görünmez. */
  myName: '',

  opening: {
    line1: 'Butun Bunlaar hep senin için AŞKKK <3',
    line2: 'bakcaksın artık',
    button: '-> BURAYA BAS BAKAM <-',
  },

  cards: {
    title: 'Aslında sana söylemek istediğim birkaç şey var...',
    flipHint: 'çevir',
    items: [
      {
        front: 'Sana bir şey itiraf etmem gerekiyor...',
        back: 'Seninleyken zamanın nasıl geçtiğini gerçekten anlamıyorum...',
      },
      {
        front: 'Biliyor musun?',
        back: 'Bazen ufacık bir mesajımla modumu yükseltebiliyorsun ve beni çoook mutlu edeysun :)',
      },
      {
        front: 'Bir sır daha...',
        back: 'Sana sandığından daha çok önem veriyorum......',
      },

    ],
  },

  question: {
    intro: 'Şimdi sana çok önemli bir sorum var...',
    ask: 'Benimle çıkar mısın? ❤️',
    yes: 'EVET ❤️',
    no: 'HAYIR 🙈',
    noStages: [
      'Emin misin?',
      'Bir daha düşün 🥺',
      'Gerçekten mi?',
      'Ama ben çok istiyorum...',
      'Son kararın mı?',
    ],
    yesMessage: 'Kolay Oldu!! HEHEHHE.',
  },

  finale: {
    title: 'O zamannn daha nice güzel günlere...',
    photo: 'photos/ask.jpeg',
    photoAlt: 'Bizim fotoğrafımız',
    photoHint: 'Fotoğrafını public/photos klasörüne koyup yolu config dosyasından güncelle.',
    /** Polaroidun altındaki küçük satır. Boşsa sevgilinin adı, o da boşsa kalp görünür. */
    polaroidNote: 'Rümeysamm',
    lines: [
      'Seninle geçireceğimiz daha nice güzel günlere...',
      'Daha çok kahkahaya, daha çok anıya, daha çok sarılmaya, daha çok öpücüğe...',
      'İyi ki varsın. ❤️',
    ],
    closing: 'Bu daha başlangıç...  Doğru kalbi bulursan bir sürpriz daha vaar.',
  },

  secret: {
    label: 'Küçük bir kalp',
    message: 'Sen benim başıma gelen en güzel şey.\n
          Anlamı yok, anlamsız sen yoksan her şey.\n
          Beni yine sev, beni yine sev, beni yeniden sev.\n
          Sensiz bu dünya gözümde hiçbi şey',
    close: 'Kapat',
  },

  music: {
    defaultVolume: 0.55,
    missingHint: 'Bu melodi henüz eklenmemiş. Kendi dosyanı public/music klasörüne bırakman yeterli.',
    unsupported: 'Bu tarayıcıda ses açılamadı.',
    tracks: [
      // {
      //   id: 'piano',
      //   title: 'Yumuşak Romantik Piyano',
      //   artist: 'Senin için',
      //   src: null,
      // },
      {
        id: 'rose',
        title: 'Cupid',
        artist: 'FIFTY FIFTY',
        src: 'music/hopeless-romantic.mp3',
      },
      // {
      //   id: 'falling',
      //   title: "Can't Help Falling in Love",
      //   artist: 'Enstrümantal',
      //   src: 'music/cant-help-falling-in-love.mp3',
      // },
      // {
      //   id: 'whisper',
      //   title: 'Careless Whisper',
      //   artist: 'George Michael',
      //   src: 'music/careless-whisper.mp3',
      // },
    ] satisfies MusicTrack[],
  },
}
