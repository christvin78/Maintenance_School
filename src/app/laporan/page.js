
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../globals.css';

export default function LaporanPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [laporan, setLaporan] = useState([]);
  const [username, setUsername] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    kategori: '',
    lokasi: '',
    deskripsi: '',
    foto: null,
  });

  // AMBIL LAPORAN DARI MYSQL
  useEffect(() => {
    let aktif = true;

    async function ambilLaporan() {
      const usernameLogin = localStorage.getItem('username') || '';
      const roleLogin = localStorage.getItem('role') || '';

      setUsername(usernameLogin);

      if (roleLogin !== 'guru' || !usernameLogin) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(
          `/api/laporan?username=${encodeURIComponent(usernameLogin)}`
        );

        const hasil = await response.json();

        if (!response.ok || !hasil.success) {
          throw new Error(
            hasil.message || 'Gagal mengambil data laporan.'
          );
        }

        if (aktif) {
          setLaporan(Array.isArray(hasil.data) ? hasil.data : []);
        }
      } catch (error) {
        console.error('Gagal mengambil laporan:', error);

        if (aktif) {
          alert('Gagal mengambil riwayat laporan dari database.');
          setLaporan([]);
        }
      } finally {
        if (aktif) {
          setIsChecking(false);
        }
      }
    }

    ambilLaporan();

    return () => {
      aktif = false;
    };
  }, []);

  // FILTER LAPORAN MILIK GURU YANG LOGIN
  const laporanSaya = laporan;

  const laporanFiltered =
    filterKategori === 'Semua'
      ? laporanSaya
      : laporanSaya.filter(
          (item) => item.kategori === filterKategori
        );

  // STATUS LAPORAN
  const statusTampilan = (item) => {
    if (item.statusKonfirmasiAdmin === 'Tidak Dikonfirmasi') {
      return 'Tidak Dikonfirmasi';
    }

    if (!item.statusKonfirmasiAdmin) {
      return 'Menunggu Konfirmasi';
    }

    if (
      item.statusVerifikasiAdmin === 'Menunggu Verifikasi' ||
      item.status === 'Menunggu Verifikasi Admin'
    ) {
      return 'Menunggu Verifikasi';
    }

    if (item.statusVerifikasiAdmin === 'Perlu Perbaikan') {
      return 'Perlu Perbaikan';
    }

    if (
      item.statusVerifikasiAdmin === 'Selesai' ||
      item.status === 'Selesai'
    ) {
      return 'Selesai';
    }

    return item.status || 'Dikirim';
  };

  // WARNA STATUS
  const warnaStatus = (status) => {
    if (
      status === 'Selesai' ||
      status === 'Dikonfirmasi'
    ) {
      return {
        background: '#dcfce7',
        color: '#166534',
      };
    }

    if (
      status === 'Tidak Dikonfirmasi' ||
      status === 'Perlu Perbaikan'
    ) {
      return {
        background: '#fee2e2',
        color: '#991b1b',
      };
    }

    if (
      status === 'Diproses' ||
      status === 'Siap Dikerjakan'
    ) {
      return {
        background: '#dbeafe',
        color: '#1d4ed8',
      };
    }

    return {
      background: '#fef3c7',
      color: '#92400e',
    };
  };

  // MENU NAVBAR
  const toggleMenu = () => {
    setIsMenuOpen((sebelumnya) => !sebelumnya);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('namaGuru');
    window.location.href = '/login';
  };

  // FORMAT WAKTU
  const formatWaktu = (waktu) => {
    if (!waktu) return '-';

    try {
      const tanggal = new Date(waktu);

      if (Number.isNaN(tanggal.getTime())) {
        return waktu;
      }

      return tanggal.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // KIRIM LAPORAN KE MYSQL
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!username) {
      alert('Username tidak ditemukan. Silakan login kembali.');
      return;
    }

    if (
      !formData.kategori ||
      !formData.lokasi.trim() ||
      !formData.deskripsi.trim()
    ) {
      alert('Mohon lengkapi semua informasi laporan.');
      return;
    }

    setIsSubmitting(true);

    try {
      let fotoData = null;

      if (formData.foto) {
        if (!formData.foto.type.startsWith('image/')) {
          alert('File harus berupa gambar.');
          return;
        }

        if (formData.foto.size > 5 * 1024 * 1024) {
          alert('Ukuran foto maksimal 5 MB.');
          return;
        }

        fotoData = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);
          reader.onerror = () =>
            reject(new Error('Foto gagal dibaca.'));

          reader.readAsDataURL(formData.foto);
        });
      }

      const response = await fetch('/api/laporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          kategori: formData.kategori,
          lokasi: formData.lokasi.trim(),
          deskripsi: formData.deskripsi.trim(),
          foto: fotoData,
        }),
      });

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(
          hasil.message || 'Laporan gagal dikirim.'
        );
      }

      // AMBIL ULANG RIWAYAT DARI MYSQL
      const responseLaporan = await fetch(
        `/api/laporan?username=${encodeURIComponent(username)}`
      );

      const hasilLaporan = await responseLaporan.json();

      if (!responseLaporan.ok || !hasilLaporan.success) {
        throw new Error(
          'Laporan tersimpan, tetapi riwayat gagal dimuat.'
        );
      }

      setLaporan(
        Array.isArray(hasilLaporan.data)
          ? hasilLaporan.data
          : []
      );

      setFormData({
        kategori: '',
        lokasi: '',
        deskripsi: '',
        foto: null,
      });

      const fileInput = document.getElementById('foto');

      if (fileInput) {
        fileInput.value = '';
      }

      alert('Laporan berhasil dikirim!');
    } catch (error) {
      console.error('Gagal mengirim laporan:', error);

      alert(
        error.message ||
          'Laporan gagal disimpan. Silakan coba kembali.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // CEK LOGIN
  if (isChecking) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#596579',
        }}
      >
        Memuat laporan...
      </main>
    );
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <Link
          href="/guru"
          className="brand"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="brand-logo-wrapper">
            <img
              src="/logo.jpg"
              alt="Logo Tri Ratna"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="brand-text">
            <strong>TRI RATNA</strong>
            <span>Sistem Informasi Sekolah</span>
          </div>
        </Link>

        <nav className={`nav-menu ${isMenuOpen ? 'show' : ''}`}>
          <Link
            href="/guru"
            onClick={() => setIsMenuOpen(false)}
          >
            Beranda
          </Link>

          <Link
            href="#"
            onClick={() => setIsMenuOpen(false)}
          >
            Jadwal
          </Link>

          <Link
            href="/laporan"
            className="active"
            onClick={() => setIsMenuOpen(false)}
          >
            Laporan
          </Link>

          <Link
            href="/guru/profil"
            onClick={() => setIsMenuOpen(false)}
          >
            Profil
          </Link>

          <button
            type="button"
            className="login-nav"
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          className="menu-button"
          onClick={toggleMenu}
          aria-label="Buka menu"
        >
          ☰
        </button>
      </header>

      <main>
        {/* HEADER LAPORAN */}
        <section className="report-header">
          <div className="mini-label">LAYANAN SEKOLAH</div>

          <h1>
            Sampaikan <span>laporan.</span>
          </h1>

          <p>
            Bantu menjaga lingkungan Sekolah Tri Ratna dengan
            menyampaikan permasalahan yang kamu temukan.
          </p>

          <div style={{ marginTop: '20px' }}>
            <img
              src="/gedung.jpg"
              alt="Gedung Sekolah Tri Ratna"
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          </div>
        </section>

        {/* FORM DAN INFORMASI */}
        <section className="report-section">
          <div className="form-card">
            <div className="form-title">
              <div className="form-icon">📢</div>

              <div>
                <h2>Buat Laporan</h2>
                <p>Isi informasi laporan dengan lengkap.</p>
              </div>
            </div>

            <form id="laporanForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="kategori">
                  Kategori Laporan
                </label>

                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kategori: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Pilih kategori laporan
                  </option>
                  <option value="Fasilitas">🔧 Fasilitas</option>
                  <option value="Kebersihan">🧹 Kebersihan</option>
                  <option value="Internet">🌐 Internet</option>
                  <option value="Ruang Kelas">🏫 Ruang Kelas</option>
                  <option value="Lainnya">📋 Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lokasi">Lokasi</label>

                <input
                  type="text"
                  id="lokasi"
                  placeholder="Contoh: Lab RPL, Lantai 2"
                  value={formData.lokasi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lokasi: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deskripsi">
                  Deskripsi Masalah
                </label>

                <textarea
                  id="deskripsi"
                  rows="6"
                  placeholder="Jelaskan permasalahan yang kamu temukan..."
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deskripsi: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="foto">
                  Foto Bukti <span>(Opsional)</span>
                </label>

                <label className="upload-box">
                  <input
                    type="file"
                    id="foto"
                    accept="image/png, image/jpeg"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        foto: e.target.files?.[0] || null,
                      })
                    }
                  />

                  <div className="upload-icon">📷</div>

                  <strong>
                    {formData.foto
                      ? formData.foto.name
                      : 'Tambahkan foto'}
                  </strong>

                  <small>JPG, JPEG atau PNG · Maksimal 5 MB</small>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary submit-button"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'wait' : 'pointer',
                }}
              >
                {isSubmitting
                  ? 'Mengirim...'
                  : 'Kirim Laporan'}
                {!isSubmitting && <span> →</span>}
              </button>
            </form>
          </div>

          {/* INFORMASI LAPORAN */}
          <aside className="report-info">
            <div className="info-card">
              <div className="info-icon">💡</div>

              <h3>Sebelum mengirim</h3>

              <p>
                Pastikan informasi yang diberikan sudah sesuai
                agar laporan lebih mudah ditindaklanjuti.
              </p>
            </div>

            <div className="info-card dark">
              <div className="info-icon">✓</div>

              <h3>Proses laporan</h3>

              <div className="process">
                <div className="process-item">
                  <span>01</span>
                  <div>
                    <strong>Konfirmasi Admin</strong>
                    <p>Admin memeriksa laporan yang masuk.</p>
                  </div>
                </div>

                <div className="process-line" />

                <div className="process-item">
                  <span>02</span>
                  <div>
                    <strong>Pengerjaan Operator</strong>
                    <p>
                      Operator menangani laporan yang disetujui.
                    </p>
                  </div>
                </div>

                <div className="process-line" />

                <div className="process-item">
                  <span>03</span>
                  <div>
                    <strong>Verifikasi Admin</strong>
                    <p>
                      Admin memeriksa hasil sebelum laporan selesai.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* RIWAYAT LAPORAN */}
        <section className="my-reports section">
          <div className="section-heading">
            <div>
              <div className="mini-label">RIWAYAT</div>
              <h2>Laporan saya</h2>
            </div>

            <div className="report-filter">
              <label htmlFor="filterKategori">
                Cari berdasarkan kategori
              </label>

              <select
                id="filterKategori"
                value={filterKategori}
                onChange={(e) =>
                  setFilterKategori(e.target.value)
                }
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Fasilitas">🔧 Fasilitas</option>
                <option value="Kebersihan">🧹 Kebersihan</option>
                <option value="Internet">🌐 Internet</option>
                <option value="Ruang Kelas">🏫 Ruang Kelas</option>
                <option value="Lainnya">📋 Lainnya</option>
              </select>
            </div>
          </div>

          <div
            style={{
              marginBottom: '20px',
              color: '#7a8393',
              fontSize: '13px',
            }}
          >
            Riwayat laporan untuk akun:{' '}
            <strong>{username}</strong>
          </div>

          <div id="daftarLaporan">
            {laporanSaya.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Belum ada laporan</h3>
                <p>
                  Laporan yang kamu kirim akan muncul di bagian ini.
                </p>
              </div>
            ) : laporanFiltered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Laporan tidak ditemukan</h3>
                <p>
                  Belum ada laporan dengan kategori{' '}
                  <strong>{filterKategori}</strong>.
                </p>
              </div>
            ) : (
              laporanFiltered.map((item) => {
                const status = statusTampilan(item);

                return (
                  <div className="laporan-item" key={item.id}>
                    <div className="laporan-top">
                      <span className="laporan-category">
                        {item.kategori}
                      </span>

                      <span
                        className="status"
                        style={{
                          ...warnaStatus(status),
                          display: 'inline-block',
                          padding: '6px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <h3>Laporan {item.kategori}</h3>

                    <p className="laporan-location">
                      📍 {item.lokasi}
                    </p>

                    <p>{item.deskripsi}</p>

                    {item.foto && (
                      <div style={{ marginTop: '12px' }}>
                        <img
                          src={item.foto}
                          alt={`Foto bukti laporan ${item.kategori}`}
                          style={{
                            display: 'block',
                            width: '100%',
                            maxWidth: '320px',
                            maxHeight: '220px',
                            objectFit: 'contain',
                            objectPosition: 'left center',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e8ebf0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.82rem',
                        color: '#596579',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      <span>
                        🕐 Dikirim:{' '}
                        {formatWaktu(item.tanggalKirim)}
                      </span>

                      {item.statusKonfirmasiAdmin && (
                        <span>
                          🛡️ Keputusan Admin:{' '}
                          {item.statusKonfirmasiAdmin}
                        </span>
                      )}

                      {item.catatanAdmin && (
                        <span style={{ color: '#dc2626' }}>
                          📝 Alasan Admin: {item.catatanAdmin}
                        </span>
                      )}

                      {item.catatanOperator && (
                        <span>
                          💬 Catatan Operator:{' '}
                          {item.catatanOperator}
                        </span>
                      )}

                      {item.statusVerifikasiAdmin && (
                        <span>
                          🔎 Verifikasi Admin:{' '}
                          {item.statusVerifikasiAdmin}
                        </span>
                      )}

                      {item.catatanVerifikasiAdmin && (
                        <span style={{ color: '#c2410c' }}>
                          🔧 Catatan perbaikan:{' '}
                          {item.catatanVerifikasiAdmin}
                        </span>
                      )}

                      {item.tanggalSelesai && (
                        <span>
                          ✅ Selesai:{' '}
                          {formatWaktu(item.tanggalSelesai)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <img
              src="/logo.jpg"
              alt="Logo Tri Ratna"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
              }}
            />

            <div>
              <strong>TRI RATNA</strong>
              <p>Sistem Informasi Sekolah</p>
            </div>
          </div>

          <p className="copyright">
            © 2026 Sekolah Tri Ratna. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
