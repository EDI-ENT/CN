// Nama jabatan yang tampil di aplikasi. Diatur Admin di halaman Tim (Nama Jabatan),
// termasuk jadwal pergantian nama. Kode jabatan di sistem tidak pernah berubah.
(function () {
  var URL_FN = "https://larbyekmthmdkdcpdbcc.supabase.co/functions/v1/Nama_Jabatan";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcmJ5ZWttdGhtZGtkY3BkYmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjYxNzUsImV4cCI6MjEwNTgwMjE3NX0.0I-fqB1fVLaKR2Dz8jdrccns5tXdjDAqZdHxSwgukNk";
  var KUNCI = "namaJabatan";
  var peta = {};
  try { peta = JSON.parse(localStorage.getItem(KUNCI) || "{}") || {}; } catch (e) { peta = {}; }

  function token() {
    try { return (JSON.parse(localStorage.getItem("staffSession") || "null") || {}).token || null; }
    catch (e) { return null; }
  }

  // Nama yang tampil untuk satu kode jabatan; cadangan dipakai bila belum pernah dimuat.
  function nama(kode, cadangan) {
    return (peta[kode] && peta[kode].tampil) || cadangan || kode;
  }

  // Kode peran di sistem -> tulisan yang enak dibaca (PSR_AM menjadi PSR/AM).
  function peran(kode) {
    if (kode === "PSR_AM") return "PSR/AM";
    var dasar = { DM: "DM", SM: "SM", FINANCE_STAFF: "Finance Staff", JR_FINANCE_MANAGER: "Jr Finance Manager", BOM: "Back Office Manager", DIREKTUR: "Direktur" };
    if (dasar[kode]) return nama(kode, dasar[kode]);
    return String(kode || "").replace(/_/g, " ");
  }

  // Status CN tersimpan dengan nama asli ("Menunggu Jr Finance Manager"); di layar diganti nama yang berlaku.
  function status(s) {
    if (s == null) return s;
    var out = String(s);
    Object.keys(peta).forEach(function (k) {
      var p = peta[k];
      if (p && p.dasar && p.tampil && p.dasar !== p.tampil) {
        out = out.split("Menunggu " + p.dasar).join("Menunggu " + p.tampil);
      }
    });
    return out;
  }

  // Memperbarui salinan di peramban. Gagal tidak mengganggu apa pun; salinan lama tetap dipakai.
  function muat() {
    var t = token();
    if (!t) return Promise.resolve(false);
    return fetch(URL_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ANON, "apikey": ANON },
      body: JSON.stringify({ token: t })
    })
      .then(function (r) { return r.json(); })
      .then(function (h) {
        if (h && h.data) {
          peta = h.data;
          try { localStorage.setItem(KUNCI, JSON.stringify(peta)); } catch (e) {}
          return true;
        }
        return false;
      })
      .catch(function () { return false; });
  }

  window.NJ = { nama: nama, peran: peran, status: status, muat: muat };

  // Angka tidak boleh berubah sendiri karena roda mouse/geser layar atau tombol panah.
  document.addEventListener("wheel", function () {
    var a = document.activeElement;
    if (a && a.tagName === "INPUT" && a.type === "number") a.blur();
  }, { passive: true });
  document.addEventListener("keydown", function (e) {
    var a = document.activeElement;
    if (a && a.tagName === "INPUT" && a.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) e.preventDefault();
  });

  // Setiap halaman memperbarui salinannya diam-diam; teks yang sudah ditandai ikut diperbarui.
  function terapkan() {
    var el = document.getElementById("namaJrFM");
    if (el) el.textContent = nama("JR_FINANCE_MANAGER", "Jr Finance Manager");
  }
  document.addEventListener("DOMContentLoaded", function () {
    terapkan();
    muat().then(terapkan);
  });
})();
