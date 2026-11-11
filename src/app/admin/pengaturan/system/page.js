/* ========================================
   ADMIN - PENGATURAN SISTEM
======================================== */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

export default function PengaturanSystemPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [namaSekolah, setNamaSekolah] = useState(
        'Sekolah Tri Ratna'
    );

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        setUsername(name || 'Admin');

        const savedNamaSekolah =
            localStorage.getItem('namaSekolah');

        if (savedNamaSekolah) {
            setNamaSekolah(savedNamaSekolah);
        }
    }, [router]);


    /* ========================================
       SIMPAN PENGATURAN
    ======================================== */

    const simpanPengaturan = () => {
        localStorage.setItem(
            'namaSekolah',
            namaSekolah
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    };


    /* ========================================
       RESET LAPORAN
    ======================================== */

    const resetLaporan = () => {
        const konfirmasi = window.confirm(
            'Apakah kamu yakin ingin menghapus semua data laporan? Data yang sudah dihapus tidak dapat dikembalikan.'
        );

        if (!konfirmasi) {
            return;
        }

        localStorage.setItem(
            'laporanSekolah',
            JSON.stringify([])
        );

        alert(
            'Semua data laporan berhasil dihapus.'
        );
    };


    /* ========================================
       RESET DATA OPERATOR
    ======================================== */

    const resetOperator = () => {
        const konfirmasi = window.confirm(
            'Apakah kamu yakin ingin menghapus semua data operator?'
        );

        if (!konfirmasi) {
            return;
        }

        localStorage.setItem(
            'dataOperator',
            JSON.stringify([])
        );

        alert(
            'Semua data operator berhasil dihapus.'
        );
    };


    /* ========================================
       RESET DATA SISTEM
    ======================================== */

    const resetSemuaData = () => {
        const konfirmasi = window.confirm(
            'PERINGATAN: Semua data laporan dan operator akan dihapus. Apakah kamu benar-benar yakin?'
        );

        if (!konfirmasi) {
            return;
        }

        localStorage.setItem(
            'laporanSekolah',
            JSON.stringify([])
        );

        localStorage.setItem(
            'dataOperator',
            JSON.stringify([])
        );

        alert(
            'Data sistem berhasil direset.'
        );
    };


    /* ========================================
       LOGOUT
    ======================================== */

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        router.push('/login');
    };


    return (
        <main className="system-settings-page">

            {/* ========================================
                HEADER
            ======================================== */}

            <header className="system-settings-header">

                <div>

                    <div className="system-breadcrumb">

                        <Link href="/admin">
                            Dashboard
                        </Link>

                        <span>/</span>

                        <Link href="/admin/pengaturan">
                            Pengaturan
                        </Link>

                        <span>/</span>

                        <span>Pengaturan Sistem</span>

                    </div>

                    <h1>
                        Pengaturan Sistem
                    </h1>

                    <p>
                        Kelola konfigurasi dasar sistem
                        informasi Sekolah Tri Ratna.
                    </p>

                </div>


                <div className="system-admin-box">

                    <div className="system-avatar">
                        {username
                            ? username.charAt(0).toUpperCase()
                            : 'A'}
                    </div>

                    <div className="system-admin-info">

                        <strong>
                            {username || 'Admin'}
                        </strong>

                        <span>
                            Administrator
                        </span>

                    </div>

                    <button
                        type="button"
                        className="system-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ========================================
                TOP BAR
            ======================================== */}

            <section className="system-top-section">

                <div>

                    <h2>
                        Konfigurasi Sistem
                    </h2>

                    <p>
                        Atur informasi dasar dan data yang
                        digunakan oleh sistem.
                    </p>

                </div>

                <Link
                    href="/admin/pengaturan"
                    className="system-back-button"
                >
                    ← Kembali
                </Link>

            </section>


            {/* ========================================
                INFORMASI SISTEM
            ======================================== */}

            <section className="system-card">

                <div className="system-card-header">

                    <div className="system-card-icon blue">
                        ℹ️
                    </div>

                    <div>

                        <h3>
                            Informasi Sistem
                        </h3>

                        <p>
                            Informasi dasar aplikasi.
                        </p>

                    </div>

                </div>


                <div className="system-info-grid">

                    <div className="system-info-item">

                        <span>
                            Nama Sistem
                        </span>

                        <strong>
                            Sistem Informasi Sekolah Tri Ratna
                        </strong>

                    </div>


                    <div className="system-info-item">

                        <span>
                            Versi Sistem
                        </span>

                        <strong>
                            1.0.0
                        </strong>

                    </div>


                    <div className="system-info-item">

                        <span>
                            Status Sistem
                        </span>

                        <strong className="system-active">
                            ● Aktif
                        </strong>

                    </div>


                    <div className="system-info-item">

                        <span>
                            Hak Akses
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                </div>

            </section>


            {/* ========================================
                TAMPILAN SISTEM
            ======================================== */}

            <section className="system-card">

                <div className="system-card-header">

                    <div className="system-card-icon purple">
                        🎨
                    </div>

                    <div>

                        <h3>
                            Pengaturan Tampilan
                        </h3>

                        <p>
                            Atur informasi yang ditampilkan
                            pada sistem.
                        </p>

                    </div>

                </div>


                <div className="system-form">

                    <div className="system-form-group">

                        <label>
                            Nama Sekolah
                        </label>

                        <input
                            type="text"
                            value={namaSekolah}
                            onChange={(e) =>
                                setNamaSekolah(
                                    e.target.value
                                )
                            }
                            placeholder="Masukkan nama sekolah"
                        />

                        <small>
                            Nama ini dapat digunakan sebagai
                            identitas sekolah pada sistem.
                        </small>

                    </div>


                    <button
                        type="button"
                        className="save-system-button"
                        onClick={simpanPengaturan}
                    >
                        Simpan Pengaturan
                    </button>


                    {saved && (
                        <div className="system-success">
                            ✓ Pengaturan berhasil disimpan.
                        </div>
                    )}

                </div>

            </section>


            {/* ========================================
                ZONA DATA
            ======================================== */}

            <section className="system-card danger-card">

                <div className="system-card-header">

                    <div className="system-card-icon red">
                        ⚠️
                    </div>

                    <div>

                        <h3>
                            Zona Pengelolaan Data
                        </h3>

                        <p>
                            Gunakan fitur ini dengan hati-hati
                            karena data yang dihapus tidak dapat
                            dikembalikan.
                        </p>

                    </div>

                </div>


                <div className="danger-list">

                    {/* RESET LAPORAN */}

                    <div className="danger-item">

                        <div>

                            <strong>
                                Reset Data Laporan
                            </strong>

                            <p>
                                Menghapus seluruh laporan
                                yang tersimpan dalam sistem.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={resetLaporan}
                            className="danger-button"
                        >
                            Hapus Laporan
                        </button>

                    </div>


                    {/* RESET OPERATOR */}

                    <div className="danger-item">

                        <div>

                            <strong>
                                Reset Data Operator
                            </strong>

                            <p>
                                Menghapus seluruh akun operator
                                yang tersimpan dalam sistem.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={resetOperator}
                            className="danger-button"
                        >
                            Hapus Operator
                        </button>

                    </div>


                    {/* RESET SEMUA */}

                    <div className="danger-item danger-all">

                        <div>

                            <strong>
                                Reset Semua Data
                            </strong>

                            <p>
                                Menghapus data laporan dan
                                data operator dari sistem.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={resetSemuaData}
                            className="danger-button danger-button-all"
                        >
                            Reset Sistem
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}