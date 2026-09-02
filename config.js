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

  // 3. Ongkir instant — pakai aggregator (Biteship / KiriminAja), BUKAN API
  //    langsung dari GoSend/Grab/SPX/Maxim (tidak tersedia untuk reseller kecil).
  //    Daftar dulu di salah satu, lalu isi API key & endpoint di sini.
  //    Sampai diisi, tombol ongkir akan tampil sebagai "segera hadir".
  ONGKIR: {
    provider: "biteship", // "biteship" | "kiriminaja" | null
    api_key: "",          // isi setelah daftar akun aggregator
    api_base_url: "https://api.biteship.com/v1",
  },
};
