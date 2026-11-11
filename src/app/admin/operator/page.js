'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css';

export default function DataOperatorPage() {
    const router = useRouter();

    const [operator, setOperator] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [editId, setEditId] = useState(null);
    const [namaAdmin, setNamaAdmin] = useState('');
    const [loading, setLoading] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);

    // CEK LOGIN ADMIN
    useEffect(() => {
        const role = localStorage.getItem('role');
        const usernameAdmin = localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        setNamaAdmin(usernameAdmin || 'Admin');
        ambilOperator();
    }, [router]);

    // AMBIL DATA OPERATOR
    async function ambilOperator() {
        try {
            setLoading(true);

            const response = await fetch('/api/operators');
            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal mengambil data Operator.'
                );
            }

            setOperator(hasil.data || []);
        } catch (error) {
            alert(error.message || 'Gagal mengambil data Operator.');
        } finally {
            setLoading(false);
        }
    }

    // RESET FORM
    function resetForm() {
        setUsername('');
        setPassword('');
        setEditId(null);
    }

    // BUKA MODAL TAMBAH
    function handleTambah() {
        resetForm();
        setShowForm(true);
    }

    // TUTUP MODAL
    function tutupModal() {
        if (menyimpan) return;

        setShowForm(false);
        resetForm();
    }

    // TAMBAH ATAU EDIT OPERATOR
    async function handleSubmit(e) {
        e.preventDefault();

        const usernameBersih = username.trim();
        const sedangEdit = editId !== null;

        if (!usernameBersih || (!sedangEdit && !password)) {
            alert('Username dan password wajib diisi.');
            return;
        }

        if (password && password.length < 8) {
            alert('Password minimal 8 karakter.');
            return;
        }

        setMenyimpan(true);

        try {
            const response = await fetch(
                sedangEdit
                    ? `/api/operators/${editId}`
                    : '/api/operators',
                {
                    method: sedangEdit ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: usernameBersih,
                        ...(password ? { password } : {}),
                        status: sedangEdit
                            ? operator.find(
                                (item) =>
                                    String(item.id) === String(editId)
                            )?.status || 'Aktif'
                            : 'Aktif',
                    }),
                }
            );

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal menyimpan akun Operator.'
                );
            }

            await ambilOperator();

            setShowForm(false);
            resetForm();

            alert(
                sedangEdit
                    ? 'Akun Operator berhasil diperbarui.'
                    : 'Akun Operator berhasil ditambahkan.'
            );
        } catch (error) {
            alert(error.message || 'Terjadi kesalahan.');
        } finally {
            setMenyimpan(false);
        }
    }

    // BUKA MODAL EDIT
    function handleEdit(item) {
        setEditId(item.id);
        setUsername(item.username || '');
        setPassword('');
        setShowForm(true);
    }

    // UBAH STATUS OPERATOR
    async function handleToggleStatus(item) {
        const statusBaru =
            item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';

        if (
            !confirm(
                `Ubah status ${item.username} menjadi ${statusBaru}?`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/operators/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: item.username,
                    status: statusBaru,
                }),
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal mengubah status.'
                );
            }

            await ambilOperator();
        } catch (error) {
            alert(error.message || 'Gagal mengubah status Operator.');
        }
    }

    // HAPUS OPERATOR
    async function handleDelete(id) {
        if (operator.length === 1) {
            alert('Minimal harus ada satu operator.');
            return;
        }

        if (!confirm('Apakah Anda yakin ingin menghapus operator ini?')) {
            return;
        }

        try {
            const response = await fetch(`/api/operators/${id}`, {
                method: 'DELETE',
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal menghapus Operator.'
                );
            }

            if (String(editId) === String(id)) {
                setShowForm(false);
                resetForm();
            }

            await ambilOperator();
            alert('Akun Operator berhasil dihapus.');
        } catch (error) {
            alert(error.message || 'Gagal menghapus Operator.');
        }
    }

    return (
        <main className="admin-dashboard">

            {/* HEADER */}

            <header className="admin-header">
                <div>
                    <p className="admin-header-label">
                        MANAJEMEN AKUN
                    </p>

                    <h1>Data Operator</h1>

                    <p className="admin-header-description">
                        Kelola akun operator yang dapat mengakses
                        dan menangani laporan sekolah.
                    </p>
                </div>
            </header>

            {/* KONTEN */}

            <section className="admin-content">

                <div className="operator-top">
                    <div>
                        <h2>Daftar Operator</h2>

                        <p>
                            Admin dapat menambah, mengubah,
                            dan menghapus akun operator.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-action-button"
                        onClick={handleTambah}
                    >
                        + Tambah Operator
                    </button>
                </div>

                {/* TABEL OPERATOR */}

                <div className="operator-table">
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Admin</th>
                                <th>Username Operator</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="operator-empty"
                                    >
                                        Memuat data Operator...
                                    </td>
                                </tr>
                            ) : operator.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="operator-empty"
                                    >
                                        Belum ada operator.
                                    </td>
                                </tr>
                            ) : (
                                operator.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>

                                        <td className="operator-admin-name">
                                            {namaAdmin || 'Admin'}
                                        </td>

                                        <td>{item.username}</td>

                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    item.status === 'Aktif'
                                                        ? 'status-selesai'
                                                        : 'status-nonaktif'
                                                }`}
                                            >
                                                {item.status || 'Nonaktif'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="operator-actions">
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleToggleStatus(item)
                                                    }
                                                >
                                                    {item.status === 'Aktif'
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </section>

            {/* MODAL TAMBAH / EDIT */}

            {showForm && (
                <div
                    className="operator-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            tutupModal();
                        }
                    }}
                >
                    <section
                        className="operator-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="operator-modal-title"
                    >

                        {/* HEADER MODAL */}

                        <div className="operator-modal-header">
                            <div>
                                <p className="admin-header-label">
                                    MANAJEMEN AKUN
                                </p>

                                <h2 id="operator-modal-title">
                                    {editId
                                        ? 'Edit Operator'
                                        : 'Tambah Operator'}
                                </h2>

                                <p>
                                    {editId
                                        ? 'Perbarui informasi akun operator.'
                                        : 'Buat akun operator baru untuk mengelola laporan sekolah.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="operator-modal-close"
                                onClick={tutupModal}
                                disabled={menyimpan}
                                aria-label="Tutup modal"
                            >
                                ×
                            </button>
                        </div>

                        {/* FORM MODAL */}

                        <form
                            className="operator-modal-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">
                                <label>Nama Admin</label>

                                <input
                                    type="text"
                                    value={namaAdmin}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Username Operator</label>

                                <input
                                    type="text"
                                    placeholder="Masukkan username operator"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    {editId
                                        ? 'Password Baru (opsional)'
                                        : 'Password Operator'}
                                </label>

                                <input
                                    type="password"
                                    placeholder={
                                        editId
                                            ? 'Kosongkan jika tidak diubah'
                                            : 'Minimal 8 karakter'
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required={!editId}
                                    minLength={8}
                                    autoComplete="new-password"
                                />

                                {editId && (
                                    <small className="operator-password-hint">
                                        Biarkan kosong jika password lama
                                        tidak ingin diubah.
                                    </small>
                                )}
                            </div>

                            {/* TOMBOL MODAL */}

                            <div className="operator-modal-actions">
                                <button
                                    type="button"
                                    className="dashboard-secondary-button"
                                    onClick={tutupModal}
                                    disabled={menyimpan}
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="dashboard-action-button"
                                    disabled={menyimpan}
                                >
                                    {menyimpan
                                        ? 'Menyimpan...'
                                        : editId
                                            ? 'Simpan Perubahan'
                                            : '+ Tambah Operator'}
                                </button>
                            </div>

                        </form>
                    </section>
                </div>
            )}

        </main>
    );
}