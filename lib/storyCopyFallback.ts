// Teks cadangan kartu Story per mood, dipakai kalau AI tidak mengisi field storyCopy.
// Sengaja kalimat umum, BUKAN cerita asli pengguna.
import type { MoodKey } from "./moods";
import type { PlaylistResponse, QuizResult, ReportRow, Track } from "./types";

type Notification = { title: string; body: string };

export type StoryText = {
  chatOpening: string; // gelembung pengguna di template Chat
  chatClosing: string; // gelembung penutup di template Chat
  receiptChange: string; // "Kembalian" di template Struk
  ticketSeat: string; // "Kursi" di template Tiket
  advice: string; // saran cadangan di template Ramalan
  quiz: QuizResult; // template Kuis
  report: ReportRow[]; // template Rapor (5 baris)
  reportNote: string; // catatan wali kelas
  notifications: Notification[]; // template Notifikasi (3)
  trainRoute: { from: string; to: string }; // template Karcis kereta
};

/** Catatan per lagu cadangan (urutan lagu di kartu) */
type PerSong = { setlistNotes: string[]; threadCaptions: string[] };

type Fallback = StoryText & PerSong;

const DEFAULT_TEXT: Fallback = {
  chatOpening: "lagi campur aduk, temenin dong",
  chatClosing: "Apa pun rasanya, kamu nggak sendirian.",
  receiptChange: "Rasa yang lebih jelas",
  ticketSeat: "Dekat jendela",
  advice: "Dengerin sampai habis, baru putuskan perasaanmu.",
  quiz: {
    type: "Si Perasa Diam-diam",
    rarity: 14,
    description: "Kamu jarang cerita, tapi lagu yang kamu putar selalu jujur soal isi hatimu. Teman-temanmu tahu kamu baik-baik saja kalau playlist-mu mulai ceria lagi.",
    traits: [
      { label: "Peka", value: 86 },
      { label: "Tenang", value: 72 },
      { label: "Rahasia", value: 64 },
      { label: "Hangat", value: 78 },
    ],
  },
  report: [
    { subject: "Mengenali perasaan", score: 84, grade: "A-", note: "Mulai berani jujur" },
    { subject: "Istirahat cukup", score: 70, grade: "B-", note: "Kurangi begadang, ya" },
    { subject: "Cerita ke teman", score: 76, grade: "B", note: "Pelan-pelan makin terbuka" },
    { subject: "Menikmati lagu", score: 95, grade: "A+", note: "Selera musik juara" },
    { subject: "Sabar sama diri", score: 80, grade: "B+", note: "Terus pertahankan" },
  ],
  reportNote: "Rasamu sedang belajar tumbuh. Tidak apa-apa pelan, yang penting terus jalan.",
  notifications: [
    { title: "Pengingat", body: "Sudah minum air hari ini?" },
    { title: "Teman lama", body: "eh, kabarmu gimana? kangen ngobrol" },
    { title: "Feelist", body: "Playlist barumu sudah siap diputar" },
  ],
  trainRoute: { from: "Bingung", to: "Lega" },
  setlistNotes: ["buka pelan", "ikut nyanyi", "tarik napas", "jangan skip", "tutup manis"],
  threadCaptions: [
    "Lagu pembuka yang pas banget buat hari ini.",
    "Bagian reff-nya bikin diem sebentar.",
    "Yang ini diputar sambil liat jendela.",
    "Nggak nyangka bakal relate separah ini.",
    "Penutup yang bikin lega.",
  ],
};

const FALLBACK: Record<MoodKey, Fallback> = {
  galau: {
    chatOpening: "lagi galau, temenin dong",
    chatClosing: "Pelan-pelan aja, nanti juga pulih.",
    receiptChange: "Hati yang lebih tenang",
    ticketSeat: "Pojok paling sepi",
    advice: "Dengerin sambil rebahan, jangan chat mantan.",
    quiz: {
      type: "Si Overthinker Romantis",
      rarity: 12,
      description: "Kamu memikirkan semuanya sampai detail terkecil, apalagi jam dua pagi. Hatimu besar, cuma butuh lagu yang mau ikut begadang dan nggak menghakimi.",
      traits: [
        { label: "Mikir panjang", value: 94 },
        { label: "Peka", value: 88 },
        { label: "Rindu", value: 81 },
        { label: "Tidur cepat", value: 12 },
      ],
    },
    report: [
      { subject: "Mengelola rindu", score: 68, grade: "C+", note: "Masih sering kambuh malam" },
      { subject: "Tidak buka chat lama", score: 62, grade: "C", note: "Perlu banyak latihan" },
      { subject: "Merenung", score: 98, grade: "A+", note: "Bakat alami" },
      { subject: "Tidur sebelum jam 12", score: 64, grade: "C", note: "Coba matikan HP" },
      { subject: "Menyayangi diri", score: 82, grade: "B+", note: "Ada kemajuan bagus" },
    ],
    reportNote: "Anak ini perasa dan tulus. Semester depan semoga lebih banyak tidur dan tertawa.",
    notifications: [
      { title: "Galeri", body: "Kenangan 3 tahun lalu: lihat lagi momen ini?" },
      { title: "Sahabat", body: "udah tidur belum? kalau belum, cerita aja" },
      { title: "Feelist", body: "Lagu buat overthinking malam ini sudah siap" },
    ],
    trainRoute: { from: "Rindu", to: "Pulih" },
    setlistNotes: ["pelan aja", "jangan nangis", "ini bagianku", "tarik napas", "pulang, yuk"],
    threadCaptions: [
      "Buka malam ini dengan yang paling jujur.",
      "Liriknya kayak baca isi kepala sendiri.",
      "Diputar sambil liatin langit-langit kamar.",
      "Yang ini jangan didengar pas lagi kangen.",
      "Pelan-pelan, besok pasti lebih ringan.",
    ],
  },
  bahagia: {
    chatOpening: "lagi seneng banget, rayain yuk",
    chatClosing: "Semoga senengnya awet terus, ya!",
    receiptChange: "Senyum yang makin lebar",
    ticketSeat: "Baris depan",
    advice: "Putar keras-keras, ajak orang rumah joget.",
    quiz: {
      type: "Si Matahari Berjalan",
      rarity: 18,
      description: "Senyummu menular, bahkan ke orang yang baru kenal. Kamu tipe yang memutar lagu keras-keras dan mengajak semua orang ikut bernyanyi tanpa malu.",
      traits: [
        { label: "Ceria", value: 96 },
        { label: "Menular", value: 89 },
        { label: "Spontan", value: 77 },
        { label: "Galau", value: 9 },
      ],
    },
    report: [
      { subject: "Menyebar senyum", score: 97, grade: "A+", note: "Bikin satu kelas ceria" },
      { subject: "Joget tanpa malu", score: 92, grade: "A", note: "Gerakannya makin luwes" },
      { subject: "Bersyukur", score: 88, grade: "A-", note: "Terus dipertahankan" },
      { subject: "Volume wajar", score: 66, grade: "C+", note: "Tetangga mulai protes" },
      { subject: "Berbagi bahagia", score: 90, grade: "A", note: "Teman ikut senang" },
    ],
    reportNote: "Energimu menghangatkan kelas. Jangan lupa istirahat supaya senyumnya awet.",
    notifications: [
      { title: "Grup keluarga", body: "Mama: kamu kok kelihatan seneng banget hari ini?" },
      { title: "Teman kantor", body: "traktiran kapan nih? kabar bahagianya udah nyebar" },
      { title: "Feelist", body: "Playlist buat joget di kamar sudah siap" },
    ],
    trainRoute: { from: "Senyum", to: "Pesta" },
    setlistNotes: ["keras-keras!", "semua joget", "teriak reff", "lompat!", "sekali lagi"],
    threadCaptions: [
      "Pembuka yang bikin langsung senyum lebar.",
      "Wajib diputar pas lagi naik motor.",
      "Reff-nya cocok buat teriak bareng.",
      "Yang ini bikin kaki gerak sendiri.",
      "Tutup hari dengan senyum paling lebar.",
    ],
  },
  semangat: {
    chatOpening: "butuh semangat nih, bantuin dong",
    chatClosing: "Gas terus, kamu pasti bisa!",
    receiptChange: "Energi buat mulai lagi",
    ticketSeat: "Paling depan",
    advice: "Pasang lagu pertama, langsung kerjain satu hal.",
    quiz: {
      type: "Si Pantang Mundur",
      rarity: 16,
      description: "Kamu boleh jatuh, tapi selalu punya lagu untuk bangkit lagi. Daftar targetmu panjang dan kamu menyelesaikannya satu per satu sambil ikut bernyanyi.",
      traits: [
        { label: "Gigih", value: 93 },
        { label: "Berani", value: 85 },
        { label: "Fokus", value: 79 },
        { label: "Rebahan", value: 21 },
      ],
    },
    report: [
      { subject: "Bangun pagi", score: 78, grade: "B", note: "Alarm kedua sudah cukup" },
      { subject: "Menyelesaikan target", score: 90, grade: "A", note: "Satu per satu tuntas" },
      { subject: "Bangkit setelah gagal", score: 95, grade: "A+", note: "Mental baja" },
      { subject: "Istirahat", score: 65, grade: "C+", note: "Jangan lupa jeda" },
      { subject: "Menyemangati teman", score: 86, grade: "A-", note: "Energinya menular" },
    ],
    reportNote: "Semangatmu luar biasa. Ingat, istirahat juga bagian dari perjuangan.",
    notifications: [
      { title: "Pengingat", body: "Target hari ini: satu langkah kecil dulu" },
      { title: "Pelatih", body: "ayo, satu set lagi! kamu pasti bisa" },
      { title: "Feelist", body: "Lagu penyemangatmu sudah siap diputar" },
    ],
    trainRoute: { from: "Lelah", to: "Juara" },
    setlistNotes: ["pemanasan", "gas pol!", "jangan berhenti", "hampir sampai", "kamu bisa"],
    threadCaptions: [
      "Pembuka biar langsung semangat kerja.",
      "Diputar pas mulai ngerjain tugas berat.",
      "Beat-nya bikin lupa capek.",
      "Yang ini buat lari pagi besok.",
      "Penutup biar bangun dengan target baru.",
    ],
  },
  hujan: {
    chatOpening: "lagi hujan, temenin santai dong",
    chatClosing: "Nikmatin hujannya pelan-pelan, ya.",
    receiptChange: "Hati yang adem",
    ticketSeat: "Dekat jendela",
    advice: "Seduh teh hangat dulu, baru tekan play.",
    quiz: {
      type: "Si Pecinta Gerimis",
      rarity: 21,
      description: "Bagimu hujan bukan alasan untuk sedih, tapi undangan untuk melambat. Selimut, teh hangat, dan lagu yang pelan sudah cukup membuat harimu sempurna.",
      traits: [
        { label: "Tenang", value: 91 },
        { label: "Nyaman", value: 87 },
        { label: "Melamun", value: 74 },
        { label: "Buru-buru", value: 11 },
      ],
    },
    report: [
      { subject: "Menikmati gerimis", score: 96, grade: "A+", note: "Paling jago melambat" },
      { subject: "Bawa payung", score: 62, grade: "C", note: "Sering lupa di rumah" },
      { subject: "Menyeduh teh", score: 89, grade: "A-", note: "Takarannya makin pas" },
      { subject: "Melamun di jendela", score: 93, grade: "A", note: "Penuh penghayatan" },
      { subject: "Bangun dari selimut", score: 67, grade: "C+", note: "Perlu dorongan sedikit" },
    ],
    reportNote: "Kamu pandai menemukan tenang di hari mendung. Jangan lupa bawa payung, ya.",
    notifications: [
      { title: "Cuaca", body: "Hujan ringan sampai malam. Cocok buat rebahan" },
      { title: "Teman kos", body: "mau titip gorengan? aku keluar bentar" },
      { title: "Feelist", body: "Lagu teman hujan sore ini sudah siap" },
    ],
    trainRoute: { from: "Mendung", to: "Teduh" },
    setlistNotes: ["seduh teh", "dengar hujan", "selimutan", "lihat jendela", "tidur siang"],
    threadCaptions: [
      "Buka sore hujan dengan yang paling adem.",
      "Cocok sama suara rintik di genteng.",
      "Diputar sambil nunggu teh hangat.",
      "Yang ini bikin pengen tidur siang.",
      "Penutup sampai hujannya reda.",
    ],
  },
  perjalanan: {
    chatOpening: "lagi di jalan, temenin dong",
    chatClosing: "Hati-hati di jalan, sampai ketemu di tujuan!",
    receiptChange: "Kenangan sepanjang jalan",
    ticketSeat: "Dekat jendela",
    advice: "Duduk dekat jendela, biarin lagunya yang cerita.",
    quiz: {
      type: "Si Penjelajah Jendela",
      rarity: 19,
      description: "Kamu paling bahagia saat pemandangan bergerak di balik kaca. Setiap perjalanan punya lagunya sendiri, dan kamu selalu hafal kapan harus memutar yang mana.",
      traits: [
        { label: "Petualang", value: 92 },
        { label: "Penasaran", value: 84 },
        { label: "Santai", value: 76 },
        { label: "Mabuk jalan", value: 18 },
      ],
    },
    report: [
      { subject: "Memilih kursi", score: 94, grade: "A", note: "Selalu dapat jendela" },
      { subject: "Sing along", score: 91, grade: "A", note: "Hafal semua lirik" },
      { subject: "Bawa bekal", score: 72, grade: "B-", note: "Camilan cepat habis" },
      { subject: "Tepat waktu", score: 66, grade: "C+", note: "Hampir ketinggalan lagi" },
      { subject: "Menikmati jalan", score: 97, grade: "A+", note: "Tiap tikungan ada cerita" },
    ],
    reportNote: "Kamu belajar bahwa perjalanan sama berharganya dengan tujuan. Lanjutkan!",
    notifications: [
      { title: "Peta", body: "Sisa perjalanan 2 jam 15 menit" },
      { title: "Teman jalan", body: "udah sampai mana? jangan lupa foto pemandangan" },
      { title: "Feelist", body: "Playlist sepanjang jalan sudah siap" },
    ],
    trainRoute: { from: "Berangkat", to: "Pulang" },
    setlistNotes: ["mesin nyala", "buka jendela", "nyanyi keras", "lewat tol", "hampir sampai"],
    threadCaptions: [
      "Pembuka pas mobil baru keluar gerbang.",
      "Wajib diputar pas lewat jalan sepi.",
      "Yang ini bikin satu mobil sing along.",
      "Pas banget sama pemandangan sore.",
      "Penutup waktu tujuan mulai kelihatan.",
    ],
  },
  "patah-hati": {
    chatOpening: "lagi patah hati, temenin dong",
    chatClosing: "Nggak apa-apa, kamu bakal baik-baik aja.",
    receiptChange: "Hati yang mulai utuh lagi",
    ticketSeat: "Kursi paling belakang",
    advice: "Boleh nangis dulu, besok kita bangkit bareng.",
    quiz: {
      type: "Si Hati Tahan Banting",
      rarity: 10,
      description: "Hatimu sedang retak, tapi kamu tetap memilih merasakannya dengan jujur. Itu kekuatan langka. Lagu-lagu ini menemanimu sampai kamu utuh lagi.",
      traits: [
        { label: "Tulus", value: 95 },
        { label: "Kuat", value: 83 },
        { label: "Ikhlas", value: 58 },
        { label: "Mau balikan", value: 27 },
      ],
    },
    report: [
      { subject: "Ikhlas melepaskan", score: 64, grade: "C", note: "Masih dalam proses" },
      { subject: "Hapus foto lama", score: 70, grade: "B-", note: "Sudah setengah galeri" },
      { subject: "Menangis sehat", score: 92, grade: "A", note: "Lega setelahnya" },
      { subject: "Tidak stalking", score: 61, grade: "C", note: "Kadang masih kepo" },
      { subject: "Mencintai diri", score: 85, grade: "A-", note: "Mulai bersinar lagi" },
    ],
    reportNote: "Kamu lebih kuat dari yang kamu kira. Hatimu akan utuh pada waktunya.",
    notifications: [
      { title: "Sahabat", body: "aku di depan rumahmu, bawa martabak" },
      { title: "Galeri", body: "Ruang penyimpanan lega setelah foto dihapus" },
      { title: "Feelist", body: "Lagu buat pulih pelan-pelan sudah siap" },
    ],
    trainRoute: { from: "Patah", to: "Utuh" },
    setlistNotes: ["boleh nangis", "lepasin", "bukan salahmu", "bangkit", "kamu cukup"],
    threadCaptions: [
      "Pembuka buat yang hatinya baru retak.",
      "Liriknya kayak pelukan dari jauh.",
      "Yang ini boleh sambil nangis.",
      "Mulai berani lihat ke depan.",
      "Penutup: kamu bakal baik-baik aja.",
    ],
  },
};

function fallbackFor(key: MoodKey | null): Fallback {
  return key ? FALLBACK[key] : DEFAULT_TEXT;
}

export function storyCopyFallback(key: MoodKey | null): StoryText {
  return fallbackFor(key);
}

/** Teks kartu: dari AI (storyCopy) kalau ada, selain itu cadangan per mood */
export function storyText(playlist: PlaylistResponse): StoryText {
  const fallback = fallbackFor(playlist.mood);
  const ai = playlist.storyCopy;
  return {
    chatOpening: ai?.chatOpening || fallback.chatOpening,
    chatClosing: ai?.chatClosing || fallback.chatClosing,
    receiptChange: ai?.receiptChange || fallback.receiptChange,
    ticketSeat: ai?.ticketSeat || fallback.ticketSeat,
    advice: playlist.horoscope?.advice || fallback.advice,
    quiz: ai?.quiz?.description ? ai.quiz : fallback.quiz,
    report: ai?.report?.length === 5 ? ai.report : fallback.report,
    reportNote: ai?.reportNote || fallback.reportNote,
    notifications: ai?.notifications?.length === 3 ? ai.notifications : fallback.notifications,
    trainRoute: ai?.trainRoute ?? fallback.trainRoute,
  };
}

/** Catatan spidol lagu ke-i di kartu Setlist: dari AI (menempel di lagunya) atau cadangan per mood */
export function setlistNote(playlist: PlaylistResponse, track: Track, i: number): string {
  const list = fallbackFor(playlist.mood).setlistNotes;
  return track.setlistNote || list[i % list.length];
}

/** Kalimat utas lagu ke-i di kartu Utas */
export function threadCaption(playlist: PlaylistResponse, track: Track, i: number): string {
  const list = fallbackFor(playlist.mood).threadCaptions;
  return track.threadCaption || list[i % list.length];
}
