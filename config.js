// ============================================================
// KONFIGURASI APLIKASI TOKO KELONTONG
// Isi bagian ini sebelum upload ke GitHub Pages.
// ============================================================
const APP_CONFIG = {
  // 1. Ambil dari Supabase Dashboard > Project Settings > API
  SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "isi-anon-public-key-di-sini",

  // 2. Nama bucket storage untuk logo/foto/QRIS (sudah dibuat lewat schema.sql)
  STORAGE_BUCKET: "toko-kelontong",

  // 3. Ongkir instant — pakai aggregator Biteship. Biteship dipilih karena
  //    plan Instant-nya (mulai Rp99.000/bulan) lebih murah dibanding
  //    KiriminAja yang mewajibkan upgrade ke plan Pro (Rp200.000/bulan)
  //    untuk bisa akses layanan Instant (plan gratis KiriminAja cuma
  //    cakupan Express & Cargo, tidak termasuk GoSend/Grab Instant).
  //    Daftar di biteship.com, lalu isi API key di sini.
  //    Sampai api_key diisi, tombol ongkir akan tampil sebagai "segera hadir".
  ONGKIR: {
    provider: "biteship", // "biteship" | "kiriminaja" | null
    api_key: "",          // isi setelah daftar akun Biteship
    api_base_url: "https://api.biteship.com/v1",
  },
};
