<div align="center">

# feelist

### ceritain mood-mu, biar lagunya yang ngerti.

**playlist dari perasaanmu.** ketik apa yang lagi kamu rasain, dan feelist menyusun lagu yang pas.<br>
bisa digeser dari sendu sampai ceria, dibagikan jadi kartu Story, dan dirangkum tiap bulan.

![next.js](https://img.shields.io/badge/next.js-16-111111?style=flat-square&logo=nextdotjs&logoColor=white)
![react](https://img.shields.io/badge/react-19-111111?style=flat-square&logo=react&logoColor=61DAFB)
![typescript](https://img.shields.io/badge/typescript-5-111111?style=flat-square&logo=typescript&logoColor=3178C6)
![tailwind](https://img.shields.io/badge/tailwind-v4-111111?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![pwa](https://img.shields.io/badge/pwa-bisa_dipasang-6C4CF5?style=flat-square)
![ai](https://img.shields.io/badge/ai-gemini_gratis-6C4CF5?style=flat-square)

**[buka feelist →](https://feelist-six.vercel.app)**

[fitur](#-fitur) · [tangkapan layar](#-tangkapan-layar) · [coba jalankan](#-coba-jalankan) · [di balik layar](#-di-balik-layar) · [privasi](#-privasi)

<br>

<img src="docs/screenshots/beranda-desktop.webp" alt="Beranda feelist di desktop" width="68%" />
&nbsp;
<img src="docs/screenshots/hasil-hp.webp" alt="Halaman hasil di HP" width="22%" />

</div>

<br>

## ✦ kenapa feelist?

Kadang kita tahu apa yang dirasain, tapi bingung mau dengerin apa. **feelist** mengubah cerita perasaan, misalnya _"galau habis UTS tapi pengen semangat lagi"_, jadi playlist. Rekomendasinya dibuat oleh AI, lalu tiap lagu dicocokkan ke Deezer untuk cover, preview 30 detik, dan link-nya.

| | |
| --- | --- |
| 🎚️ **geser mood** | satu slider 5 tingkat, dari *"Temenin aku"* sampai *"Hibur aku"*. Lagu, warna, dan gelombang suaranya berubah realtime tanpa memanggil AI lagi |
| 🃏 **21 kartu Story** | kartu 1080×1920 siap Instagram dalam 4 kategori, dengan rekomendasi gaya sesuai mood |
| 📼 **rangkuman bulanan** | 9 slide ala Story: angka, kuis, mood, kalender rasa, jam favorit, lagu teratas, dan tipe pendengar |
| 🗂️ **playlist terakhir** | 50 playlist tersimpan di perangkat, bisa dibuka ulang tanpa AI, bahkan saat offline |
| 📱 **PWA & offline** | bisa dipasang ke layar utama; halaman, font, dan cover lagu tetap ada tanpa internet |
| ♿ **aksesibel** | bisa dipakai penuh dengan keyboard, kontras ≥ 4.5:1, Lighthouse aksesibilitas 100 |

<br>

## ✦ tangkapan layar

**Beranda.** Cukup ceritakan rasamu, atau ketuk chip mood. Bahasa dan era lagu dipilih lewat satu kalimat interaktif.

<p align="center">
<img src="docs/screenshots/beranda-desktop.webp" alt="Beranda desktop" width="70%" />
&nbsp;
<img src="docs/screenshots/beranda-hp.webp" alt="Beranda HP" width="23%" />
</p>

**Hasil & geser mood.** Geser slider-nya, dan urutan lagu, warna panel, serta gelombangnya langsung berubah.

<p align="center">
<img src="docs/screenshots/hasil-desktop.webp" alt="Halaman hasil desktop dengan lagu diputar" width="94%" />
<img src="docs/screenshots/geser-mood.webp" alt="Geser mood: temenin aku vs hibur aku" width="94%" />
</p>

<details>
<summary><b>kartu Story, playlist terakhir & rangkuman bulanan</b></summary>

<p align="center">
<img src="docs/screenshots/pilih-kartu-desktop.webp" alt="Layar pilih gaya kartu" width="94%" />
<img src="docs/screenshots/kartu-story.webp" alt="Contoh kartu Story" width="80%" />
</p>

<p align="center">
<img src="docs/screenshots/riwayat-desktop.webp" alt="Playlist terakhir di desktop" width="70%" />
&nbsp;
<img src="docs/screenshots/riwayat-hp.webp" alt="Playlist terakhir di HP" width="23%" />
</p>

Edisi Oktober, *"Hujan pertama"*, bertema **Neon malam**.

<p align="center">
<img src="docs/screenshots/rangkuman-slide.webp" alt="Slide Rangkuman bulanan" width="100%" />
<img src="docs/screenshots/rangkuman-bagikan.webp" alt="Gambar rangkuman 1080×1920 untuk dibagikan" width="34%" />
&nbsp;
<img src="docs/screenshots/rangkuman-arsip.webp" alt="Arsip edisi rangkuman" width="58%" />
</p>

</details>

<br>

## ✦ fitur

<details open>
<summary><b>beranda</b></summary>

- kolom cerita bebas (2–200 karakter) dengan placeholder yang berganti tiap 3 detik, ditambah 3 contoh cerita acak yang bisa diketuk
- chip mood: Galau, Bahagia, Semangat, Hujan, Perjalanan, Patah hati. Kalau tidak memilih mood, AI yang menebak
- kalimat interaktif **"Lagu {bahasa} dari era {era}"**, dan pilihan terakhir diingat di perangkat
- warna latar dan aksen ikut mood yang dipilih, plus satu kalimat arti warnanya
- banner **"Rangkuman {bulan} kamu sudah siap"** di tanggal 1–7

</details>

<details open>
<summary><b>hasil & geser mood</b></summary>

- AI menyusun ±25 lagu (*pool*), masing-masing dengan skor `lift` 1–5 (1 = sangat sendu, 5 = sangat ceria)
- **geser mood**: slider 5 tingkat memilih 5–10 lagu dari pool, diurutkan dari sendu ke ceria, sepenuhnya di browser
- indikator **MoodWave** di tiap lagu: gelombang yang makin rapat dan tinggi untuk lagu yang makin ceria
- klik baris untuk memutar preview 30 detik; **Ganti lagu** mengambil cadangan dari pool
- **Dengerin full** membuka Spotify atau YouTube Music, dan pilihan terakhir diingat
- **Buat ulang** menghasilkan rekomendasi baru tanpa mengulang lagu lama

</details>

<details open>
<summary><b>kartu Story (21 template)</b></summary>

| kategori | template |
| --- | --- |
| **Seru** | Rasa kamu · Poster · Tiket · Kolase · Struk · Diputar · Ramalan |
| **Ngobrol** | Chat · Utas · Notifikasi · Kuis |
| **Kalcer** | Zine · Roll film · Flyer gigs · Poster film · Setlist · CD · Mixtape |
| **Lokal** | Karcis kereta · Bukti transfer · Rapor |

- kartu 1080×1920 dengan area aman Instagram; judul panjang mengecil sendiri dan kata tidak pernah terpotong
- di HP dibagikan lewat lembar berbagi bawaan, di desktop gambarnya diunduh
- template yang paling cocok dipilih otomatis sesuai mood

</details>

<details open>
<summary><b>playlist terakhir & rangkuman bulanan</b></summary>

- maksimal 50 playlist terbaru tersimpan; buka ulang tanpa AI, saring per mood, dan hapus bisa diurungkan
- rangkuman muncul kalau ada minimal 3 playlist di bulan itu, diputar ala Story dengan 9 slide
- **tipe pendengar**: Si Penikmat Sendu, Si Pencari Semangat, Si Pengelana, Si Anak Pagi, Si Anak Malam, Si Serba Rasa
- **12 edisi**, satu judul dan tema untuk tiap bulan. Baru **Neon malam** yang dibuat lengkap; tema lain sementara memakainya sebagai cadangan

</details>

<br>

## ✦ coba jalankan

Cara paling cepat: buka **[feelist-six.vercel.app](https://feelist-six.vercel.app)**. Untuk menjalankan di komputer sendiri, siapkan Node.js 20.9+ dan API key Gemini **gratis** dari <https://aistudio.google.com/apikey>.

```bash
git clone https://github.com/masigoooel/Feelist.git
cd Feelist
npm install
cp .env.example .env.local   # isi GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

| perintah | gunanya |
| --- | --- |
| `npm run dev` | mode development |
| `npm run build` | build production |
| `npm start` | jalankan hasil build (service worker hanya aktif di sini & di Vercel) |
| `npm run lint` | ESLint, termasuk aturan aksesibilitas |
| `npm test` | unit test rangkuman bulanan (Vitest) |

<details>
<summary><b>environment variables</b></summary>

| variabel | wajib | keterangan |
| --- | --- | --- |
| `AI_PROVIDER` | tidak | `gemini` (default, gratis) atau `claude` (berbayar) |
| `GEMINI_API_KEY` | ya, kalau pakai Gemini | key dari Google AI Studio |
| `GEMINI_MODEL` | tidak | default `gemini-3.8-flash` |
| `GEMINI_FALLBACK_MODELS` | tidak | model cadangan saat model utama sibuk/kuota habis |
| `ANTHROPIC_API_KEY` | ya, kalau pakai Claude | key dari console Anthropic |
| `ANTHROPIC_MODEL` | tidak | default `claude-opus-5-5` |

> 🔒 API key hanya dipakai di server, tidak pernah dikirim ke browser. `.env.local` sudah diabaikan git.

</details>

<details>
<summary><b>deploy ke Vercel</b></summary>

1. push repo ke GitHub
2. di [vercel.com](https://vercel.com), pilih **Add New → Project** lalu import repo-nya
3. di **Environment Variables**, isi `GEMINI_API_KEY` dan `AI_PROVIDER`
4. klik **Deploy**. Setiap push ke `main` otomatis di-deploy ulang

Route `/api/playlist` memakai `maxDuration = 60` detik, karena memanggil AI lalu mencari belasan lagu ke Deezer.

</details>

<details>
<summary><b>coba di HP lewat Wi-Fi yang sama</b></summary>

Jalankan `npm run build && npx next start -H 0.0.0.0`, lalu buka `http://<IP-laptop>:3000` di HP. Di Windows, izinkan port tersebut di firewall untuk jaringan *Private*. Install ke layar utama dan tombol Bagikan butuh HTTPS, jadi paling mudah dicoba lewat hasil deploy Vercel.

</details>

<br>

## ✦ di balik layar

| bagian | teknologi |
| --- | --- |
| framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| styling | Tailwind CSS v4 |
| AI | Google Gen AI SDK (Gemini, gratis) · Anthropic SDK (opsional) |
| musik | Deezer API publik |
| penyimpanan | IndexedDB via idb-keyval, localStorage untuk pilihan kecil |
| gambar | html-to-image (kartu Story & rangkuman → PNG) |
| offline | Serwist (service worker) |
| kualitas | ESLint + jsx-a11y · Vitest · axe-core · Lighthouse |

1. AI diminta membalas **hanya JSON**: judul, deskripsi, tebakan mood, teks kartu Story, dan ±25 lagu dengan skor `lift`
2. tiap lagu dicari ke Deezer; yang tidak ketemu dibuang
3. kalau model Gemini utama sibuk atau kuotanya habis, model cadangan dicoba otomatis
4. slider geser mood memilih lagu dari pool di browser (`lib/moodSlider.ts`)

<details>
<summary><b>struktur folder</b></summary>

```
app/
├─ page.tsx                  beranda
├─ hasil/ · riwayat/         halaman hasil & playlist terakhir
├─ rangkuman/                arsip & pemutar rangkuman bulanan
└─ api/                      playlist, ganti lagu, preview, proxy cover, analitik anonim
components/
├─ FeelistApp.tsx            alur utama: beranda → memuat → hasil → pilih kartu
├─ story/templates/          21 template kartu Story
└─ recap/                    pemutar, banner, arsip & tema rangkuman
lib/
├─ ai.ts · gemini.ts · claude.ts · prompt.ts   penyedia AI, prompt & validasi JSON
├─ deezer.ts                                   pencarian lagu & antrean kuota
├─ moods.ts · moodSlider.ts                    palet mood & geser mood
├─ playlistStore.ts                            riwayat di IndexedDB
└─ rate-limit.ts · validate.ts                 batas request & validasi
```

</details>

<details>
<summary><b>kualitas & pengujian</b></summary>

| pemeriksaan | hasil |
| --- | --- |
| Lighthouse (HP, produksi) | performa **98** · aksesibilitas **100** · best practices **100**, CLS 0 |
| axe-core (WCAG 2.1 AA) | 0 pelanggaran di semua halaman, HP & desktop |
| responsif | 7 halaman × 6 ukuran layar (360–1920px) tanpa scroll ke samping |
| kartu Story | 21 template × 3 mood tanpa teks tertutup, kontras ≥ 4.5:1 |
| TypeScript & ESLint | bersih |

</details>

<details>
<summary><b>batas beban</b></summary>

| bagian | batas |
| --- | --- |
| `/api/playlist` | 8 request/menit per IP |
| `/api/playlist/more`, `/api/replace` | 8 & 12 request/menit per IP |
| semua route yang memanggil AI | maks. 12 panggilan AI/menit per IP |
| AI berjalan bersamaan | maks. 6 per instance server |
| pencarian Deezer | maks. 35 request / 5 detik & 8 bersamaan |

Di Vercel (serverless) tiap instance punya penghitung sendiri, jadi sifatnya *best effort*. Untuk trafik besar, pakai Redis/Upstash.

</details>

<details>
<summary><b>kustomisasi</b></summary>

- **warna mood** ada di satu file, `lib/moods.ts`
- **template kartu Story baru**: buat komponen di `components/story/templates/`, lalu daftarkan di `lib/storyTemplates.ts` dan `lib/storyTemplateIds.ts`
- **teks rangkuman**: semua kalimat ada di `lib/recap/copy.ts`
- **tema edisi rangkuman baru**: buat folder `components/recap/themes/<nama>/`, lalu daftarkan di `components/recap/themes/index.ts`

</details>

<br>

## ✦ privasi

> Tanpa login, tanpa database. Riwayat dan rangkumanmu hanya ada di perangkatmu.

- cerita pengguna **tidak pernah tampil** di kartu Story maupun gambar rangkuman, dan tidak ikut terkirim saat berbagi
- log server hanya berisi mood, lagu/template, dan waktu, tanpa cerita dan tanpa IP
- cerita dikirim ke penyedia AI untuk membuat playlist. Data lewat free tier Gemini **bisa dipakai Google untuk mengembangkan produknya**, jadi jangan masukkan data sensitif

<br>

## ✦ catatan & kredit

- preview Deezer hanya 30 detik dan link-nya punya masa berlaku; yang kedaluwarsa diganti otomatis saat diputar
- free tier Gemini punya batas harian; kalau habis, app menampilkan *"Kuota gratis AI lagi habis"*
- rekomendasi lagu oleh AI · cover, preview & durasi lagu dari [Deezer](https://www.deezer.com)

<details>
<summary><b>troubleshooting</b></summary>

| masalah | solusi |
| --- | --- |
| "GEMINI_API_KEY belum diisi" | pastikan `.env.local` berisi key asli, lalu restart. Di Vercel: isi di Environment Variables lalu redeploy |
| "API key Gemini nggak valid" | salin ulang key dari AI Studio, tanpa spasi atau tanda kutip |
| "Kuota gratis AI lagi habis" | tunggu beberapa menit, atau sampai besok kalau kuota harian habis |
| "Lagunya nggak ada yang ketemu di Deezer" | ubah mood atau longgarkan pilihan, misalnya era "mana aja" |
| "Pelan-pelan dulu, ya" | kena rate limit, tunggu sekitar 1 menit |
| rangkuman bulanan tidak muncul | butuh minimal 3 playlist di bulan itu, di perangkat yang sama |
| tombol Bagikan mengunduh gambar | wajar di desktop atau saat dibuka lewat `http`; lembar berbagi hanya ada di HP dengan HTTPS |

</details>

<br>

<div align="center">

**feelist** · dibuat dengan ♥ oleh [@masigoooel](https://github.com/masigoooel)

</div>
