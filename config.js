// ============================================================
// KONFIGURASI APLIKASI TOKO KELONTONG
// Isi bagian ini sebelum upload ke GitHub Pages.
// ============================================================
const APP_CONFIG = {
  // 1. Ambil dari Supabase Dashboard > Project Settings > API
  SUPABASE_URL: "https://uuejlrebqanlkgguerhk.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZWpscmVicWFubGtnZ3VlcmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNDI3MTIsImV4cCI6MjEwMDcxODcxMn0.CnlC0xknSICXYv1hxCEcqwsSYP8N6QVXHm_Z_xsKluY",,

  // 2. Nama bucket storage untuk logo/foto/QRIS (sudah dibuat lewat schema.sql)
  STORAGE_BUCKET: "toko-kelontong",

  // 3. Ongkir instant — pakai aggregator KiriminAja (gratis daftar, tanpa
  //    biaya bulanan, cocok untuk reseller ke banyak toko kecil). Daftar di
  //    kiriminaja.com, lalu isi API key di sini. Catatan: hanya GoSend Instant
  //    & Grab Express Instant yang tersedia — SPX Instant & Maxim Delivery
  //    belum didukung aggregator manapun per pengecekan terakhir.
  //    Sampai api_key diisi, tombol ongkir akan tampil sebagai "segera hadir".
  ONGKIR: {
    provider: "kiriminaja", // "kiriminaja" | "biteship" | null
    api_key: "",            // isi setelah daftar akun KiriminAja
    api_base_url: "https://api.kiriminaja.com/v1",
  },
};
