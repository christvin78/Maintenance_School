/* ========================================
   ADMIN - PENGATURAN LAPORAN
======================================== */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

export default function PengaturanLaporanPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [laporan, setLaporan] = useState([]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const savedUsername = localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        setUsername(savedUsername || 'Admin');

        const dataLaporan =
            JSON.parse(
                localStorage.getItem('laporanSekolah') || '[]'
            );

        setLaporan(dataLaporan);
    }, [router]);


    /* ========================================
       HAPUS SATU LAPORAN
    ======================================== */

    const hapusLaporan = (id) => {
        const konfirmasi = window.confirm(
            'Apakah kamu yakin ingin menghapus laporan ini?'
        );

        if (!konfirmasi) {
            return;
        }

        const laporanUpdated = laporan.filter(
            (item) => item.id !== id
        );

        setLaporan(laporanUpdated);

        localStorage.setItem(
            'laporanSekolah',
            JSON.stringify(laporanUpdated)
        );
    };


    /* ========================================
       HAPUS SEMUA LAPORAN
    ======================================== */

    const hapusSemuaLaporan = () => {
        if (laporan.length === 0) {
            alert('Tidak ada laporan yang dapat dihapus.');
            return;
        }

        const konfirmasi = window.confirm(
            'Apakah kamu yakin ingin menghapus SEMUA laporan? Data yang sudah dihapus tidak dapat dikembalikan.'
        );

        if (!konfirmasi) {
            return;
        }

        setLaporan([]);

        localStorage.setItem(
            'laporanSekolah',
            JSON.stringify([])
        );
    };


    /* ========================================
       FORMAT TANGGAL
    ======================================== */

    const formatTanggal = (tanggal) => {
        if (!tanggal) {
            return '-';
        }

        try {
            const date = new Date(tanggal);

            if (isNaN(date.getTime())) {
                return tanggal;
            }

            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return tanggal;
        }
    };


    /* ========================================
       LOGOUT
    ======================================== */

    const logout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        router.push('/login');
    };


    return (
        <div className="pengaturan-laporan-page">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="pengaturan-laporan-header">

                <div>
                    <div className="breadcrumb">
                        <Link href="/admin">
                            Dashboard
                        </Link>

                        <span>/</span>

                        <Link href="/admin/pengaturan">
                            Pengaturan
                        </Link>

                        <span>/</span>

                        <span>Pengaturan Laporan</span>
                    </div>

                    <h1>Pengaturan Laporan</h1>

                    <p>
                        Kelola data laporan yang tersimpan di
                        sistem sekolah.
                    </p>
                </div>

                <div className="admin-user-box">
                    <div className="admin-avatar">
                        {username
                            ? username.charAt(0).toUpperCase()
                            : 'A'}
                    </div>

                    <div className="admin-user-info">
                        <strong>{username || 'Admin'}</strong>
                        <span>Administrator</span>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="logout-button"
                    >
                        Keluar
                    </button>
                </div>

            </div>


            {/* ========================================
                INFO
            ======================================== */}

            <div className="laporan-setting-info">

                <div className="info-icon">
                    ⚙
                </div>

                <div>
                    <h3>Pengelolaan Data Laporan</h3>

                    <p>
                        Gunakan halaman ini untuk mengelola
                        laporan yang tersimpan dalam sistem.
                        Penghapusan laporan akan langsung
                        memperbarui data laporan.
                    </p>
                </div>

            </div>


            {/* ========================================
                STATISTIK
            ======================================== */}

            <div className="laporan-setting-stats">

                <div className="setting-stat-card">

                    <div className="setting-stat-icon blue">
                        📋
                    </div>

                    <div>
                        <span>Total Laporan</span>

                        <strong>
                            {laporan.length}
                        </strong>
                    </div>

                </div>


                <div className="setting-stat-card">

                    <div className="setting-stat-icon gray">
                        📤
                    </div>

                    <div>
                        <span>Dikirim</span>

                        <strong>
                            {
                                laporan.filter(
                                    (item) =>
                                        !item.status ||
                                        item.status === 'Dikirim'
                                ).length
                            }
                        </strong>
                    </div>

                </div>


                <div className="setting-stat-card">

                    <div className="setting-stat-icon orange">
                        🔄
                    </div>

                    <div>
                        <span>Diproses</span>

                        <strong>
                            {
                                laporan.filter(
                                    (item) =>
                                        item.status === 'Diproses'
                                ).length
                            }
                        </strong>
                    </div>

                </div>


                <div className="setting-stat-card">

                    <div className="setting-stat-icon green">
                        ✓
                    </div>

                    <div>
                        <span>Selesai</span>

                        <strong>
                            {
                                laporan.filter(
                                    (item) =>
                                        item.status === 'Selesai'
                                ).length
                            }
                        </strong>
                    </div>

                </div>

            </div>


            {/* ========================================
                DATA LAPORAN
            ======================================== */}

            <div className="laporan-setting-card">

                <div className="setting-card-header">

                    <div>
                        <h2>Kelola Data Laporan</h2>

                        <p>
                            Pilih laporan yang ingin dihapus.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="delete-all-button"
                        onClick={hapusSemuaLaporan}
                    >
                        🗑 Hapus Semua
                    </button>

                </div>


                {laporan.length === 0 ? (

                    <div className="empty-laporan-setting">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>Tidak Ada Laporan</h3>

                        <p>
                            Belum terdapat data laporan
                            yang tersimpan dalam sistem.
                        </p>

                    </div>

                ) : (

                    <div className="laporan-setting-list">

                        {laporan.map((item, index) => (

                            <div
                                className="laporan-setting-item"
                                key={item.id || index}
                            >

                                <div className="laporan-number">
                                    {index + 1}
                                </div>


                                <div className="laporan-setting-content">

                                    <div className="laporan-setting-top">

                                        <div>

                                            <h3>
                                                {item.kategori ||
                                                    'Laporan'}
                                            </h3>

                                            <span className="laporan-location">
                                                📍 {item.lokasi || '-'}
                                            </span>

                                        </div>


                                        <span
                                            className={`setting-status ${
                                                item.status === 'Selesai'
                                                    ? 'setting-status-selesai'
                                                    : item.status === 'Diproses'
                                                    ? 'setting-status-diproses'
                                                    : 'setting-status-dikirim'
                                            }`}
                                        >
                                            {item.status || 'Dikirim'}
                                        </span>

                                    </div>


                                    <p className="laporan-description">
                                        {item.deskripsi ||
                                            'Tidak ada deskripsi laporan.'}
                                    </p>


                                    <div className="laporan-meta">

                                        <span>
                                            👤{' '}
                                            {item.nama ||
                                                item.pelapor ||
                                                item.username ||
                                                'Anonim'}
                                        </span>

                                        <span>
                                            📅{' '}
                                            {formatTanggal(
                                                item.tanggalKirim ||
                                                item.tanggal
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <div className="laporan-setting-action">

                                    <button
                                        type="button"
                                        className="delete-report-button"
                                        onClick={() =>
                                            hapusLaporan(item.id)
                                        }
                                    >
                                        🗑 Hapus
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}