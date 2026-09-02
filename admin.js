let tokoAktif = null; // { id, slug, nama_toko, ... }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function masukAtauBuat() {
  const slug = document.getElementById('gateSlug').value.trim().toLowerCase().replace(/\s+/g, '-');
  const pin = document.getElementById('gatePin').value.trim();
  if (!slug || !pin) return showToast('Isi slug dan PIN dulu');

  const { data: existing } = await sb.from('toko').select('*').eq('slug', slug).maybeSingle();

  if (existing) {
    if (existing.admin_pin !== pin) return showToast('PIN salah untuk toko ini');
    tokoAktif = existing;
  } else {
    const { data: created, error } = await sb.from('toko')
      .insert({ slug, admin_pin: pin, nama_toko: slug }).select().single();
    if (error) return showToast('Gagal membuat toko: ' + error.message);
    tokoAktif = created;
    showToast('Toko baru dibuat!');
  }

  document.getElementById('gate').style.display = 'none';
  document.getElementById('wizard').style.display = 'block';
  document.getElementById('namaToko').value = tokoAktif.nama_toko || '';
  document.getElementById('linkToko').href = `index.html?toko=${tokoAktif.slug}`;
  cekOngkirConfig();
  muatBarang();
  muatRekening();
  muatQris();
  muatGeo();
}

// ---------- STEP 1: PROFIL ----------
async function simpanProfil() {
  const nama = document.getElementById('namaToko').value.trim();
  const file = document.getElementById('logoFile').files[0];
  const update = { nama_toko: nama };
  if (file) {
    const url = await uploadFile(file, 'logo');
    if (url) update.logo_url = url;
  }
  const { error } = await sb.from('toko').update(update).eq('id', tokoAktif.id);
  if (error) return showToast('Gagal simpan: ' + error.message);
  Object.assign(tokoAktif, update);
  showToast('Profil toko disimpan');
}

// ---------- STEP 2: BARANG ----------
async function muatBarang() {
  const { data } = await sb.from('barang').select('*').eq('toko_id', tokoAktif.id).order('created_at');
  const wrap = document.getElementById('listBarang');
  document.getElementById('counterBarang').textContent = `${data.length}/100`;
  wrap.innerHTML = data.length ? data.map(b => `
    <div class="rek-item">
      <div><div class="rek-bank">${b.nama_barang}</div><div class="rek-nama">${formatRupiah(b.harga)} · stok ${b.stok}</div></div>
      <button class="copy-btn" onclick="hapusBarang('${b.id}')">Hapus</button>
    </div>`).join('') : '';
}

async function tambahBarang() {
  const nama = document.getElementById('bNama').value.trim();
  const harga = document.getElementById('bHarga').value;
  const stok = document.getElementById('bStok').value || 0;
  const file = document.getElementById('bFoto').files[0];
  if (!nama || !harga) return showToast('Isi nama dan harga barang');

  const { count } = await sb.from('barang').select('*', { count: 'exact', head: true }).eq('toko_id', tokoAktif.id);
  if (count >= 100) return showToast('Sudah mencapai maksimal 100 barang');

  let foto_url = null;
  if (file) foto_url = await uploadFile(file, 'barang');

  const { error } = await sb.from('barang').insert({ toko_id: tokoAktif.id, nama_barang: nama, harga, stok, foto_url });
  if (error) return showToast('Gagal tambah: ' + error.message);
  document.getElementById('bNama').value = '';
  document.getElementById('bHarga').value = '';
  document.getElementById('bStok').value = '';
  document.getElementById('bFoto').value = '';
  showToast('Barang ditambahkan');
  muatBarang();
}

async function hapusBarang(id) {
  await sb.from('barang').delete().eq('id', id);
  muatBarang();
}

// ---------- STEP 3: REKENING ----------
async function muatRekening() {
  const { data } = await sb.from('rekening').select('*').eq('toko_id', tokoAktif.id).order('created_at');
  const wrap = document.getElementById('listRekening');
  document.getElementById('counterRek').textContent = `${data.length}/10`;
  wrap.innerHTML = data.length ? data.map(r => `
    <div class="rek-item">
      <div><div class="rek-bank">${r.nama_bank}</div><div class="rek-no">${r.nomor_rekening}</div><div class="rek-nama">a.n. ${r.atas_nama}</div></div>
      <button class="copy-btn" onclick="hapusRekening('${r.id}')">Hapus</button>
    </div>`).join('') : '';
}

async function tambahRekening() {
  const nama_bank = document.getElementById('rBank').value.trim();
  const nomor_rekening = document.getElementById('rNomor').value.trim();
  const atas_nama = document.getElementById('rNama').value.trim();
  if (!nama_bank || !nomor_rekening || !atas_nama) return showToast('Lengkapi data rekening');

  const { count } = await sb.from('rekening').select('*', { count: 'exact', head: true }).eq('toko_id', tokoAktif.id);
  if (count >= 10) return showToast('Sudah mencapai maksimal 10 rekening');

  const { error } = await sb.from('rekening').insert({ toko_id: tokoAktif.id, nama_bank, nomor_rekening, atas_nama });
  if (error) return showToast('Gagal tambah: ' + error.message);
  document.getElementById('rBank').value = '';
  document.getElementById('rNomor').value = '';
  document.getElementById('rNama').value = '';
  showToast('Rekening ditambahkan');
  muatRekening();
}

async function hapusRekening(id) {
  await sb.from('rekening').delete().eq('id', id);
  muatRekening();
}

// ---------- STEP 4: QRIS ----------
async function muatQris() {
  const { data } = await sb.from('qris').select('*').eq('toko_id', tokoAktif.id).maybeSingle();
  if (data) {
    document.getElementById('qCatatan').value = data.catatan_tambahan || '';
    document.getElementById('previewQris').innerHTML = `<img src="${data.qris_image_url}" style="width:140px;border-radius:10px;border:1px solid var(--line)">`;
  }
}

async function simpanQris() {
  const file = document.getElementById('qFile').files[0];
  const catatan_tambahan = document.getElementById('qCatatan').value.trim();
  const { data: existing } = await sb.from('qris').select('id').eq('toko_id', tokoAktif.id).maybeSingle();

  let qris_image_url = null;
  if (file) qris_image_url = await uploadFile(file, 'qris');
  if (!qris_image_url && !existing) return showToast('Upload gambar QRIS dulu');

  if (existing) {
    const update = { catatan_tambahan };
    if (qris_image_url) update.qris_image_url = qris_image_url;
    await sb.from('qris').update(update).eq('id', existing.id);
  } else {
    await sb.from('qris').insert({ toko_id: tokoAktif.id, qris_image_url, catatan_tambahan });
  }
  showToast('QRIS disimpan');
  muatQris();
}

// ---------- STEP 5: GEOFENCING ----------
let lokasiSementara = null;

function ambilLokasi() {
  if (!navigator.geolocation) return showToast('HP/browser tidak mendukung lokasi');
  document.getElementById('lokasiInfo').textContent = 'Mengambil lokasi...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      lokasiSementara = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      document.getElementById('lokasiInfo').textContent =
        `Lokasi terkunci: ${lokasiSementara.lat.toFixed(5)}, ${lokasiSementara.lng.toFixed(5)}`;
    },
    () => showToast('Gagal ambil lokasi — pastikan izin lokasi diaktifkan')
  );
}

async function muatGeo() {
  if (tokoAktif.geo_lat) {
    lokasiSementara = { lat: tokoAktif.geo_lat, lng: tokoAktif.geo_lng };
    document.getElementById('lokasiInfo').textContent = `Lokasi tersimpan: ${tokoAktif.geo_lat.toFixed(5)}, ${tokoAktif.geo_lng.toFixed(5)}`;
    document.getElementById('radiusMeter').value = tokoAktif.geo_radius_meter || 500;
  }
}

async function simpanGeo() {
  if (!lokasiSementara) return showToast('Ambil lokasi dulu sebelum simpan');
  const radius = Number(document.getElementById('radiusMeter').value) || 500;
  const { error } = await sb.from('toko').update({
    geo_lat: lokasiSementara.lat, geo_lng: lokasiSementara.lng, geo_radius_meter: radius,
  }).eq('id', tokoAktif.id);
  if (error) return showToast('Gagal simpan lokasi: ' + error.message);
  showToast('Lokasi & radius disimpan');
}

// ---------- STEP 6: ONGKIR ----------
function cekOngkirConfig() {
  const el = document.getElementById('ongkirStatus');
  if (APP_CONFIG.ONGKIR.provider && APP_CONFIG.ONGKIR.api_key) {
    el.textContent = `Aktif via ${APP_CONFIG.ONGKIR.provider}`;
    el.className = 'chip chip-ok';
  } else {
    el.textContent = 'Belum diisi — lihat config.js';
    el.className = 'chip chip-muted';
  }
}
