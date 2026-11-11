
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './style.css';

export default function GuruProfilePage() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [pesan, setPesan] = useState('');
  const [jenisPesan, setJenisPesan] = useState('');

  const [nama, setNama] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');

  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  useEffect(() => {
    ambilProfil();
  }, []);

  async function ambilProfil() {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (role !== 'guru' || !username) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(
        `/api/guru/profile?username=${encodeURIComponent(username)}`,
        { cache: 'no-store' }
      );

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        setPesan(hasil.message || 'Gagal mengambil profil.');
        setJenisPesan('error');
        return;
      }

      setProfil(hasil.data);
      setNama(hasil.data.nama || '');
      setPreviewFoto(hasil.data.foto_profil || '');
    } catch (error) {
      console.error(error);
      setPesan('Tidak dapat terhubung ke server.');
      setJenisPesan('error');
    } finally {
      setLoading(false);
    }
  }

  function pilihFoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPesan('File harus berupa gambar.');
      setJenisPesan('error');
      event.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setPesan('Ukuran foto maksimal 3 MB.');
      setJenisPesan('error');
      event.target.value = '';
      return;
    }

    if (previewFoto.startsWith('blob:')) {
      URL.revokeObjectURL(previewFoto);
    }

    setFoto(file);
    setPreviewFoto(URL.createObjectURL(file));
    setPesan('');
  }

  async function simpanProfil(event) {
    event.preventDefault();

    const username = localStorage.getItem('username');

    if (!nama.trim()) {
      setPesan('Nama tidak boleh kosong.');
      setJenisPesan('error');
      return;
    }

    setMenyimpan(true);
    setPesan('');

    try {
      const formData = new FormData();

      formData.append('username', username);
      formData.append('nama', nama.trim());

      if (foto) {
        formData.append('foto', foto);
      }

      const response = await fetch('/api/guru/profile', {
        method: 'PUT',
        body: formData,
      });

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || 'Gagal menyimpan profil.');
      }

      setFoto(null);
      setPesan('Profil berhasil diperbarui!');
      setJenisPesan('success');

      await ambilProfil();
    } catch (error) {
      setPesan(error.message || 'Gagal menyimpan profil.');
      setJenisPesan('error');
    } finally {
      setMenyimpan(false);
    }
  }

  async function gantiPassword(event) {
    event.preventDefault();

    const username = localStorage.getItem('username');

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      setPesan('Semua kolom password wajib diisi.');
      setJenisPesan('error');
      return;
    }

    if (passwordBaru.length < 8) {
      setPesan('Password baru minimal 8 karakter.');
      setJenisPesan('error');
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPesan('Konfirmasi password baru tidak cocok.');
      setJenisPesan('error');
      return;
    }

    setMenyimpan(true);
    setPesan('');

    try {
      const response = await fetch('/api/guru/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'gantiPassword',
          username,
          passwordLama,
          passwordBaru,
          konfirmasiPassword,
        }),
      });

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(
          hasil.message || 'Gagal mengganti password.'
        );
      }

      setPasswordLama('');
      setPasswordBaru('');
      setKonfirmasiPassword('');
      setShowModal(false);

      setPesan('Password berhasil diubah!');
      setJenisPesan('success');
    } catch (error) {
      setPesan(error.message || 'Gagal mengganti password.');
      setJenisPesan('error');
    } finally {
      setMenyimpan(false);
    }
  }

  function tutupModal() {
    if (menyimpan) return;

    setShowModal(false);
    setPasswordLama('');
    setPasswordBaru('');
    setKonfirmasiPassword('');
  }

  function formatTanggal(tanggal) {
    if (!tanggal) return 'Belum tersedia';

    const nilai = new Date(tanggal);

    if (Number.isNaN(nilai.getTime())) {
      return 'Belum tersedia';
    }

    return nilai.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="guru-profile-loading">
        Memuat profil...
      </div>
    );
  }

  return (
    <main className="guru-profile-page">
      <header className="guru-profile-header">
        <div>
          <h1>Profil Guru</h1>
          <p>Kelola informasi dan keamanan akun kamu.</p>
        </div>

        <Link href="/guru" className="guru-profile-back">
          Kembali ke Dashboard
        </Link>
      </header>

      {pesan && (
        <div
          className={`guru-profile-message ${
            jenisPesan === 'success' ? 'success' : ''
          }`}
          role="status"
        >
          {pesan}
        </div>
      )}

      {profil && (
        <>
          {/* INFORMASI PROFIL */}
          <form
            className="guru-profile-card guru-profile-edit"
            onSubmit={simpanProfil}
          >
            <h2>Informasi Profil</h2>

            <div className="guru-profile-edit-header">
              <div className="guru-profile-avatar">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto profil guru"
                  />
                ) : (
                  <span>
                    {nama?.charAt(0)?.toUpperCase() || 'G'}
                  </span>
                )}
              </div>

              <div className="guru-profile-photo-control">
                <label htmlFor="fotoProfil">
                  Foto Profil
                </label>

                <input
                  id="fotoProfil"
                  type="file"
                  accept="image/*"
                  onChange={pilihFoto}
                />

                <small>Format gambar, maksimal 3 MB.</small>
              </div>
            </div>

            <div className="guru-profile-field">
              <label htmlFor="namaGuru">Nama Lengkap</label>

              <input
                id="namaGuru"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="guru-profile-field">
              <label htmlFor="usernameGuru">Username</label>

              <input
                id="usernameGuru"
                type="text"
                value={profil.username}
                readOnly
              />
            </div>

            <button
              className="guru-profile-save"
              type="submit"
              disabled={menyimpan}
            >
              {menyimpan
                ? 'Menyimpan...'
                : 'Simpan Perubahan Profil'}
            </button>
          </form>

          {/* INFORMASI AKUN */}
          <section className="guru-profile-card guru-profile-details">
            <h2>Informasi Akun</h2>

            <div className="guru-profile-detail">
              <span>Tanggal Akun Dibuat</span>
              <strong>
                {formatTanggal(profil.tanggal_dibuat)}
              </strong>
            </div>

            <div className="guru-profile-detail">
              <span>Ditambahkan Oleh</span>
              <strong>
                {profil.nama_pembuat || 'Belum tersedia'}
              </strong>
            </div>
          </section>

          {/* KEAMANAN AKUN */}
          <section className="guru-profile-card guru-profile-password">
            <h2>Keamanan Akun</h2>

            <p className="guru-profile-note">
              Jaga keamanan akun dengan mengganti password
              secara berkala.
            </p>

            <button
              className="guru-profile-save"
              type="button"
              onClick={() => {
                setPesan('');
                setShowModal(true);
              }}
            >
              Ganti Password
            </button>
          </section>
        </>
      )}

      {/* MODAL GANTI PASSWORD */}
      {showModal && (
        <div
          className="guru-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              tutupModal();
            }
          }}
        >
          <section
            className="guru-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guru-modal-title"
          >
            <header className="guru-modal-header">
              <div>
                <h2 id="guru-modal-title">
                  Ganti Password
                </h2>

                <p>
                  Masukkan password lama dan buat password
                  baru untuk akun kamu.
                </p>
              </div>

              <button
                type="button"
                className="guru-modal-close"
                onClick={tutupModal}
                disabled={menyimpan}
                aria-label="Tutup modal"
              >
                ×
              </button>
            </header>

            <form onSubmit={gantiPassword}>
              <div className="guru-profile-field">
                <label htmlFor="passwordLama">
                  Password Lama
                </label>

                <input
                  id="passwordLama"
                  type="password"
                  autoComplete="current-password"
                  value={passwordLama}
                  onChange={(e) =>
                    setPasswordLama(e.target.value)
                  }
                  required
                />
              </div>

              <div className="guru-profile-field">
                <label htmlFor="passwordBaru">
                  Password Baru
                </label>

                <input
                  id="passwordBaru"
                  type="password"
                  autoComplete="new-password"
                  value={passwordBaru}
                  onChange={(e) =>
                    setPasswordBaru(e.target.value)
                  }
                  minLength={8}
                  required
                />

                <small>Minimal 8 karakter.</small>
              </div>

              <div className="guru-profile-field">
                <label htmlFor="konfirmasiPassword">
                  Konfirmasi Password Baru
                </label>

                <input
                  id="konfirmasiPassword"
                  type="password"
                  autoComplete="new-password"
                  value={konfirmasiPassword}
                  onChange={(e) =>
                    setKonfirmasiPassword(e.target.value)
                  }
                  minLength={8}
                  required
                />
              </div>

              <div className="guru-modal-actions">
                <button
                  type="button"
                  className="guru-modal-cancel"
                  onClick={tutupModal}
                  disabled={menyimpan}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="guru-profile-save"
                  disabled={menyimpan}
                >
                  {menyimpan
                    ? 'Memproses...'
                    : 'Simpan Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
