'use client';

import { useEffect, useState } from 'react';
import './style.css';

export default function AdminGuruPage() {
  const [akunGuru, setAkunGuru] = useState([]);
  const [form, setForm] = useState({
    id: '',
    nama: '',
    username: '',
    password: '',
    status: 'Aktif',
  });

  const [modeEdit, setModeEdit] = useState(false);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [pencarian, setPencarian] = useState('');
  const [loading, setLoading] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  // AMBIL DATA GURU
  async function ambilData() {
    try {
      setLoading(true);

      const response = await fetch('/api/users');
      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || 'Gagal mengambil data akun.');
      }

      setAkunGuru(
        (hasil.data || []).filter((akun) => akun.role === 'guru')
      );
    } catch (error) {
      alert(error.message || 'Gagal mengambil data akun Guru.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ambilData();
  }, []);

  // RESET FORM
  function resetForm() {
    setForm({
      id: '',
      nama: '',
      username: '',
      password: '',
      status: 'Aktif',
    });

    setModeEdit(false);
  }

  // BUKA MODAL TAMBAH
  function bukaModalTambah() {
    resetForm();
    setModalTerbuka(true);
  }

  // TUTUP MODAL
  function tutupModal() {
    if (sedangMenyimpan) return;

    setModalTerbuka(false);
    resetForm();
  }

  // TAMBAH DAN EDIT AKUN
  async function handleSubmit(e) {
    e.preventDefault();

    const nama = form.nama.trim();
    const username = form.username.trim();
    const password = form.password;

    if (!nama || !username || (!modeEdit && !password)) {
      alert('Nama, username, dan password wajib diisi.');
      return;
    }

    if (password && password.length < 8) {
      alert('Password minimal 8 karakter.');
      return;
    }

    setSedangMenyimpan(true);

    try {
      const response = await fetch(
        modeEdit ? `/api/users/${form.id}` : '/api/users',
        {
          method: modeEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nama,
            username,
            ...(password ? { password } : {}),
            status: form.status,
            role: 'guru',
          }),
        }
      );

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || 'Gagal menyimpan akun.');
      }

      await ambilData();

      setModalTerbuka(false);
      resetForm();

      alert(
        modeEdit
          ? 'Akun Guru berhasil diperbarui.'
          : 'Akun Guru berhasil ditambahkan.'
      );
    } catch (error) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan akun.');
    } finally {
      setSedangMenyimpan(false);
    }
  }

  // BUKA MODAL EDIT
  function editAkun(akun) {
    setForm({
      id: String(akun.id),
      nama: akun.nama || '',
      username: akun.username || '',
      password: '',
      status: akun.status || 'Aktif',
    });

    setModeEdit(true);
    setModalTerbuka(true);
  }

  // UBAH STATUS
  async function ubahStatus(akun) {
    const statusBaru =
      akun.status === 'Aktif' ? 'Nonaktif' : 'Aktif';

    if (!confirm(`Ubah status akun ${akun.username} menjadi ${statusBaru}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${akun.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: akun.nama,
          username: akun.username,
          status: statusBaru,
        }),
      });

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || 'Gagal mengubah status akun.');
      }

      await ambilData();
    } catch (error) {
      alert(error.message || 'Gagal mengubah status akun.');
    }
  }

  // HAPUS AKUN
  async function hapusAkun(akun) {
    if (!confirm(`Yakin ingin menghapus akun ${akun.username}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${akun.id}`, {
        method: 'DELETE',
      });

      const hasil = await response.json();

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || 'Gagal menghapus akun.');
      }

      if (String(form.id) === String(akun.id)) {
        resetForm();
        setModalTerbuka(false);
      }

      await ambilData();
      alert('Akun Guru berhasil dihapus.');
    } catch (error) {
      alert(error.message || 'Gagal menghapus akun Guru.');
    }
  }

  // PENCARIAN
  const daftarGuru = akunGuru.filter((akun) => {
    const kata = pencarian.toLowerCase();

    return (
      (akun.nama || '').toLowerCase().includes(kata) ||
      (akun.username || '').toLowerCase().includes(kata)
    );
  });

  return (
    <main className="admin-guru-page">

      {/* HEADER */}

      <header className="admin-guru-header">
        <div>
          <p className="admin-guru-eyebrow">ADMINISTRATION</p>
          <h1>Kelola Akun Guru</h1>
          <p>Tambah dan atur akun Guru Sekolah Tri Ratna.</p>
        </div>

        <button
          type="button"
          className="guru-primary-button"
          onClick={bukaModalTambah}
        >
          + Tambah Guru
        </button>
      </header>

      {/* STATISTIK */}

      <section className="guru-stats">
        <div className="guru-stat-card">
          <span>Total Akun</span>
          <strong>{akunGuru.length}</strong>
        </div>

        <div className="guru-stat-card">
          <span>Akun Aktif</span>
          <strong>
            {akunGuru.filter((akun) => akun.status === 'Aktif').length}
          </strong>
        </div>

        <div className="guru-stat-card">
          <span>Akun Nonaktif</span>
          <strong>
            {akunGuru.filter((akun) => akun.status !== 'Aktif').length}
          </strong>
        </div>
      </section>

      {/* DAFTAR GURU */}

      <section className="guru-panel">
        <div className="guru-list-heading">
          <div>
            <h2>Daftar Akun Guru</h2>
            <p>Kelola akun yang sudah dibuat.</p>
          </div>

          <input
            className="guru-search"
            type="search"
            placeholder="Cari nama atau username..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
          />
        </div>

        <div className="guru-table-wrapper">
          <table className="guru-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Guru</th>
                <th>Username</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="guru-empty">
                    Memuat data akun Guru...
                  </td>
                </tr>
              ) : daftarGuru.length > 0 ? (
                daftarGuru.map((akun, index) => (
                  <tr key={akun.id}>
                    <td>{index + 1}</td>
                    <td>{akun.nama}</td>
                    <td>{akun.username}</td>
                    <td>
                      <span
                        className={`guru-status ${
                          akun.status === 'Aktif' ? 'aktif' : 'nonaktif'
                        }`}
                      >
                        {akun.status || 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="guru-action-buttons">
                        <button
                          type="button"
                          className="guru-edit-button"
                          onClick={() => editAkun(akun)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="guru-toggle-button"
                          onClick={() => ubahStatus(akun)}
                        >
                          {akun.status === 'Aktif'
                            ? 'Nonaktifkan'
                            : 'Aktifkan'}
                        </button>

                        <button
                          type="button"
                          className="guru-delete-button"
                          onClick={() => hapusAkun(akun)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="guru-empty">
                    {pencarian
                      ? 'Data Guru tidak ditemukan.'
                      : 'Belum ada akun Guru. Klik Tambah Guru untuk membuat akun.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL TAMBAH / EDIT */}

      {modalTerbuka && (
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
            <div className="guru-modal-header">
              <div>
                <p className="admin-guru-eyebrow">
                  MANAJEMEN AKUN
                </p>

                <h2 id="guru-modal-title">
                  {modeEdit ? 'Edit Akun Guru' : 'Tambah Akun Guru'}
                </h2>

                <p>
                  {modeEdit
                    ? 'Perbarui informasi akun Guru.'
                    : 'Isi informasi untuk membuat akun Guru baru.'}
                </p>
              </div>

              <button
                type="button"
                className="guru-modal-close"
                onClick={tutupModal}
                disabled={sedangMenyimpan}
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            <form className="guru-form" onSubmit={handleSubmit}>
              <div className="guru-form-grid">
                <label>
                  Nama Guru
                  <input
                    type="text"
                    placeholder="Masukkan nama Guru"
                    value={form.nama}
                    onChange={(e) =>
                      setForm({ ...form, nama: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Username
                  <input
                    type="text"
                    placeholder="Buat username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  {modeEdit ? 'Password Baru (opsional)' : 'Password'}
                  <input
                    type="password"
                    placeholder={
                      modeEdit
                        ? 'Kosongkan jika tidak diubah'
                        : 'Buat password minimal 8 karakter'
                    }
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required={!modeEdit}
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  Status Akun
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </label>
              </div>

              <div className="guru-form-actions">
                <button
                  type="button"
                  className="guru-secondary-button"
                  onClick={tutupModal}
                  disabled={sedangMenyimpan}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="guru-primary-button"
                  disabled={sedangMenyimpan}
                >
                  {sedangMenyimpan
                    ? 'Menyimpan...'
                    : modeEdit
                      ? 'Simpan Perubahan'
                      : '+ Tambah Akun'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

    </main>
  );
}