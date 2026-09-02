// Fungsi & koneksi yang dipakai bersama oleh admin.html dan index.html
const sb = window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function formatRupiah(angka) {
  return 'Rp' + Number(angka || 0).toLocaleString('id-ID');
}

// Upload 1 file ke bucket storage, return public URL-nya
async function uploadFile(file, folder) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(APP_CONFIG.STORAGE_BUCKET).upload(path, file, { upsert: true });
  if (error) { showToast('Upload gagal: ' + error.message); return null; }
  const { data } = sb.storage.from(APP_CONFIG.STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Jarak antar 2 koordinat (meter) — rumus Haversine
function jarakMeter(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ambilSlugDariURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('toko') || '';
}
