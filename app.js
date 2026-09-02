let toko = null;

const OJEK = [
  { nama: 'GoSend Instant', warna: '#2D8C4E' },
  { nama: 'Grab Express', warna: '#00B14F' },
  { nama: 'SPX Instant', warna: '#EE4D2D' },
  { nama: 'Maxim Delivery', warna: '#FFC900' },
];

async function muatToko() {
  const slug = ambilSlugDariURL();
  if (!slug) return tampilkanNotFound();

  const { data, error } = await sb.from('toko').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return tampilkanNotFound();
  toko = data;

  document.getElementById('namaTokoTampil').textContent = toko.nama_toko;
  document.getElementById('logoToko').src = toko.logo_url || 'icon-192.png';
  document.title = toko.nama_toko;

  await Promise.all([muatBarangPublik(), muatRekeningPublik(), muatQrisPublik()]);
  siapkanOngkir();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

function tampilkanNotFound() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('notFound').style.display = 'block';
}

async function muatBarangPublik() {
  const { data } = await sb.from('barang').select('*').eq('toko_id', toko.id).order('created_at');
  const grid = document.getElementById('barangGrid');
  if (!data.length) { document.getElementById('barangKosong').style.display = 'block'; return; }
  grid.innerHTML = data.map(b => `
    <div class="barang-card">
      <img src="${b.foto_url || 'icon-192.png'}" alt="${b.nama_barang}">
      <div class="info">
        <div class="nama">${b.nama_barang}</div>
        <div class="harga">${formatRupiah(b.harga)}</div>
        <div class="stok">Stok: ${b.stok}</div>
      </div>
    </div>`).join('');
}

async function muatRekeningPublik() {
  const { data } = await sb.from('rekening').select('*').eq('toko_id', toko.id).order('created_at');
  document.getElementById('rekeningList').innerHTML = data.map(r => `
    <div class="rek-item">
      <div>
        <div class="rek-bank">${r.nama_bank}</div>
        <div class="rek-no">${r.nomor_rekening}</div>
        <div class="rek-nama">a.n. ${r.atas_nama}</div>
      </div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${r.nomor_rekening}');showToast('Nomor disalin')">Salin</button>
    </div>`).join('');
}

async function muatQrisPublik() {
  const { data } = await sb.from('qris').select('*').eq('toko_id', toko.id).maybeSingle();
  if (!data) return;
  document.getElementById('qrisWrap').innerHTML = `
    <img src="${data.qris_image_url}" alt="QRIS toko">
    ${data.catatan_tambahan ? `<div class="qris-note">${data.catatan_tambahan}</div>` : ''}`;
}

function cekJangkauan() {
  if (!toko.geo_lat) return showToast('Toko belum mengatur lokasi');
  if (!navigator.geolocation) return showToast('Browser tidak mendukung lokasi');
  navigator.geolocation.getCurrentPosition((pos) => {
    const jarak = jarakMeter(toko.geo_lat, toko.geo_lng, pos.coords.latitude, pos.coords.longitude);
    const el = document.getElementById('geoStatus');
    el.style.display = 'flex';
    if (jarak <= toko.geo_radius_meter) {
      el.className = 'geo-status in';
      el.textContent = `Lokasi Anda ${Math.round(jarak)}m dari toko — masuk jangkauan antar instant ✔`;
    } else {
      el.className = 'geo-status out';
      el.textContent = `Lokasi Anda ${Math.round(jarak)}m dari toko — di luar radius layanan (${toko.geo_radius_meter}m)`;
    }
  }, () => showToast('Gagal ambil lokasi Anda'));
}

function siapkanOngkir() {
  const wrap = document.getElementById('ongkirList');
  const aktif = APP_CONFIG.ONGKIR.provider && APP_CONFIG.ONGKIR.api_key;
  wrap.innerHTML = OJEK.map(o => `
    <div class="ongkir-item">
      <span>${o.nama}</span>
      <span class="chip ${aktif ? 'chip-ok' : 'chip-muted'}">${aktif ? 'Cek ongkos' : 'Segera hadir'}</span>
    </div>`).join('');
  // Saat APP_CONFIG.ONGKIR.provider terisi (Biteship/KiriminAja), tambahkan
  // pemanggilan API cek-ongkos di sini menggunakan koordinat toko & pembeli.
}

muatToko();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
