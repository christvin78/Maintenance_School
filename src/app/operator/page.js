
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './style.css';

export default function OperatorPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [laporan, setLaporan] = useState([]);
    const [selectedLaporan, setSelectedLaporan] = useState(null);
    const [statusDetail, setStatusDetail] = useState('Siap Dikerjakan');
    const [catatan, setCatatan] = useState('');
    const [loading, setLoading] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);

    // NOTIFIKASI
    const [notifTerbuka, setNotifTerbuka] = useState(false);
    const [notifDibaca, setNotifDibaca] = useState([]);

    // AMBIL DATA LAPORAN DARI MYSQL
    const ambilData = useCallback(async () => {
        try {
            const response = await fetch('/api/laporan', {
                cache: 'no-store',
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal mengambil laporan.'
                );
            }

            const data = Array.isArray(hasil.data) ? hasil.data : [];

            setLaporan(data);

            // Perbarui detail jika laporan yang sama sedang dibuka.
            setSelectedLaporan((sebelumnya) => {
                if (!sebelumnya) return sebelumnya;

                return (
                    data.find(
                        (item) =>
                            String(item.id) === String(sebelumnya.id)
                    ) || sebelumnya
                );
            });
        } catch (error) {
            console.error('Gagal mengambil laporan:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // CEK LOGIN DAN MUAT DATA
    useEffect(() => {
        const role = localStorage.getItem('role');

        if (role !== 'operator' && role !== 'admin') {
            router.push('/login');
            return;
        }

        setUsername(localStorage.getItem('username') || 'Operator');

        try {
            const dibaca = JSON.parse(
                localStorage.getItem('operatorNotifikasiDibaca') || '[]'
            );

            setNotifDibaca(Array.isArray(dibaca) ? dibaca : []);
        } catch {
            setNotifDibaca([]);
        }

        ambilData();

        // Periksa perubahan data secara berkala.
        const interval = setInterval(ambilData, 5000);

        return () => clearInterval(interval);
    }, [router, ambilData]);

    // FORMAT TANGGAL
    const formatTanggal = (tanggal) => {
        if (!tanggal) return '-';

        const date = new Date(tanggal);

        if (Number.isNaN(date.getTime())) return '-';

        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // STATUS TAMPILAN
    const statusTampilan = (item) => {
        if (item.statusKonfirmasiAdmin === 'Tidak Dikonfirmasi') {
            return 'Tidak Dikonfirmasi';
        }

        if (item.statusKonfirmasiAdmin !== 'Dikonfirmasi') {
            return 'Menunggu Konfirmasi';
        }

        // Gunakan status utama agar laporan baru tidak salah dianggap
        // sedang menunggu verifikasi hanya karena nilai default database.
        if (item.status === 'Menunggu Verifikasi Admin') {
            return 'Menunggu Verifikasi Admin';
        }

        if (
            item.status === 'Selesai' ||
            item.statusVerifikasiAdmin === 'Selesai'
        ) {
            return 'Selesai';
        }

        if (item.status === 'Perlu Perbaikan') {
            return 'Perlu Perbaikan';
        }

        if (item.status === 'Diproses') {
            return 'Diproses';
        }

        return 'Siap Dikerjakan';
    };

    // DAFTAR NOTIFIKASI
    const daftarNotifikasi = laporan.flatMap((item) => {
        const hasil = [];
        const id = item.id;

        if (!id) return hasil;

        const status = statusTampilan(item);

        if (status === 'Siap Dikerjakan') {
            hasil.push({
                id: `${id}-siap-${item.waktuKonfirmasiAdmin || 'konfirmasi'}`,
                laporanId: id,
                judul: 'Laporan Siap Dikerjakan',
                pesan: `${item.kategori || 'Laporan'} • ${item.lokasi || '-'}`,
                waktu: item.waktuKonfirmasiAdmin || item.tanggalKirim,
                ikon: '📋',
                warna: '#2563eb',
            });
        }

        if (status === 'Perlu Perbaikan') {
            hasil.push({
                id: `${id}-perbaikan-${item.waktuVerifikasiAdmin || item.catatanVerifikasiAdmin || 'perbaikan'}`,
                laporanId: id,
                judul: 'Laporan Perlu Diperbaiki',
                pesan: item.catatanVerifikasiAdmin
                    ? `Catatan Admin: ${item.catatanVerifikasiAdmin}`
                    : `${item.kategori || 'Laporan'} perlu diperbaiki oleh Operator.`,
                waktu: item.waktuVerifikasiAdmin,
                ikon: '🔧',
                warna: '#d97706',
            });
        }

        if (
            status === 'Selesai' &&
            item.statusVerifikasiAdmin === 'Selesai'
        ) {
            hasil.push({
                id: `${id}-selesai-${item.waktuVerifikasiAdmin || item.tanggalSelesai || 'selesai'}`,
                laporanId: id,
                judul: 'Verifikasi Berhasil',
                pesan: `${item.kategori || 'Laporan'} telah disetujui dan dinyatakan selesai oleh Admin.`,
                waktu: item.waktuVerifikasiAdmin || item.tanggalSelesai,
                ikon: '✅',
                warna: '#16a34a',
            });
        }

        return hasil;
    });

    const notifikasiTerurut = [...daftarNotifikasi].sort(
        (a, b) =>
            new Date(b.waktu || 0).getTime() -
            new Date(a.waktu || 0).getTime()
    );

    const jumlahBelumDibaca = notifikasiTerurut.filter(
        (item) => !notifDibaca.includes(item.id)
    ).length;

    // SIMPAN STATUS NOTIFIKASI DI BROWSER
    const simpanNotifikasiDibaca = (daftarBaru) => {
        setNotifDibaca(daftarBaru);

        localStorage.setItem(
            'operatorNotifikasiDibaca',
            JSON.stringify(daftarBaru)
        );
    };

    const tandaiDibaca = (id) => {
        if (notifDibaca.includes(id)) return;

        simpanNotifikasiDibaca([...notifDibaca, id]);
    };

    const tandaiSemuaDibaca = () => {
        simpanNotifikasiDibaca([
            ...new Set([
                ...notifDibaca,
                ...notifikasiTerurut.map((item) => item.id),
            ]),
        ]);
    };

    // BUKA DETAIL DARI NOTIFIKASI
    const bukaNotifikasi = (notifikasi) => {
        tandaiDibaca(notifikasi.id);
        setNotifTerbuka(false);

        const item = laporan.find(
            (laporanItem) =>
                String(laporanItem.id) === String(notifikasi.laporanId)
        );

        if (item) bukaDetail(item);
    };

    // BUKA DETAIL LAPORAN
    const bukaDetail = (item) => {
        setSelectedLaporan(item);

        setStatusDetail(
            item.status === 'Diproses'
                ? 'Diproses'
                : 'Siap Dikerjakan'
        );

        setCatatan(item.catatanOperator || '');
    };

    const tutupDetail = () => {
        setSelectedLaporan(null);
        setStatusDetail('Siap Dikerjakan');
        setCatatan('');
    };

    // HAK AKSES PENGERJAAN
    const bolehDikerjakan = (item) => {
        return (
            item.statusKonfirmasiAdmin === 'Dikonfirmasi' &&
            item.status !== 'Menunggu Verifikasi Admin' &&
            item.status !== 'Selesai' &&
            item.statusVerifikasiAdmin !== 'Selesai'
        );
    };

    // PERBARUI LAPORAN MELALUI API MYSQL
    const simpanPerubahan = async (id, perubahan) => {
        const response = await fetch(`/api/laporan/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(perubahan),
        });

        const hasil = await response.json();

        if (!response.ok || !hasil.success) {
            throw new Error(
                hasil.message || 'Gagal memperbarui laporan.'
            );
        }

        await ambilData();
    };

    // SIMPAN STATUS PENGERJAAN
    const simpanDetail = async () => {
        if (!selectedLaporan || menyimpan) return;

        const itemSaatIni = laporan.find(
            (item) =>
                String(item.id) === String(selectedLaporan.id)
        );

        if (!itemSaatIni || !bolehDikerjakan(itemSaatIni)) {
            alert('Laporan ini belum bisa dikerjakan.');
            return;
        }

        if (statusDetail === 'Diproses' && !catatan.trim()) {
            alert('Isi catatan pengerjaan terlebih dahulu.');
            return;
        }

        setMenyimpan(true);

        try {
            await simpanPerubahan(selectedLaporan.id, {
                status: statusDetail,
                catatanOperator: catatan.trim(),
                tanggalSelesai: null,
            });

            alert('Perubahan laporan berhasil disimpan.');
        } catch (error) {
            console.error('Gagal menyimpan laporan:', error);
            alert(error.message || 'Gagal menyimpan laporan.');
        } finally {
            setMenyimpan(false);
        }
    };

    // MINTA VERIFIKASI ADMIN
    const mintaVerifikasi = async () => {
        if (!selectedLaporan || menyimpan) return;

        const itemSaatIni = laporan.find(
            (item) =>
                String(item.id) === String(selectedLaporan.id)
        );

        if (!itemSaatIni || !bolehDikerjakan(itemSaatIni)) {
            alert('Laporan ini tidak dapat dikirim untuk verifikasi.');
            return;
        }

        if (!catatan.trim()) {
            alert(
                'Isi catatan pengerjaan sebelum meminta verifikasi Admin.'
            );
            return;
        }

        setMenyimpan(true);

        try {
            await simpanPerubahan(selectedLaporan.id, {
                status: 'Menunggu Verifikasi Admin',
                statusVerifikasiAdmin: 'Menunggu Verifikasi',
                catatanOperator: catatan.trim(),
                waktuMintaVerifikasi: new Date().toISOString(),
                tanggalSelesai: null,
            });

            tutupDetail();
            alert('Laporan berhasil dikirim untuk verifikasi Admin.');
        } catch (error) {
            console.error('Gagal meminta verifikasi:', error);
            alert(error.message || 'Gagal meminta verifikasi Admin.');
        } finally {
            setMenyimpan(false);
        }
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        router.push('/login');
    };

    // STATISTIK
    const totalLaporan = laporan.length;

    const jumlahDikirim = laporan.filter(
        (item) => statusTampilan(item) === 'Siap Dikerjakan'
    ).length;

    const jumlahDiproses = laporan.filter(
        (item) => statusTampilan(item) === 'Diproses'
    ).length;

    const jumlahSelesai = laporan.filter(
        (item) => statusTampilan(item) === 'Selesai'
    ).length;

    return (
        <main className="operator-page">
            {/* HEADER */}
            <header className="operator-header">
                <div>
                    <p className="operator-header-label">OPERATOR PANEL</p>
                    <h1>Dashboard Operator</h1>
                    <p className="operator-header-description">
                        Kelola dan tindak lanjuti laporan sekolah.
                    </p>
                </div>

                <div className="operator-header-right">
                    {/* NOTIFIKASI */}
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setNotifTerbuka(!notifTerbuka)}
                            aria-label="Notifikasi Operator"
                            style={{
                                position: 'relative',
                                width: '44px',
                                height: '44px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                background: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            🔔

                            {jumlahBelumDibaca > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        minWidth: '20px',
                                        height: '20px',
                                        padding: '0 5px',
                                        borderRadius: '20px',
                                        background: '#ef4444',
                                        color: '#ffffff',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid #ffffff',
                                    }}
                                >
                                    {jumlahBelumDibaca > 99
                                        ? '99+'
                                        : jumlahBelumDibaca}
                                </span>
                            )}
                        </button>

                        {notifTerbuka && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '54px',
                                    right: 0,
                                    width: 'min(360px, 85vw)',
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    color: '#1e293b',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                    }}
                                >
                                    <div>
                                        <strong style={{ fontSize: '16px' }}>
                                            Notifikasi
                                        </strong>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#64748b',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {jumlahBelumDibaca} belum dibaca
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={tandaiSemuaDibaca}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#2563eb',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Tandai Semua Dibaca
                                    </button>
                                </div>

                                <div
                                    style={{
                                        maxHeight: '350px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {notifikasiTerurut.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '28px 16px',
                                                textAlign: 'center',
                                                color: '#64748b',
                                            }}
                                        >
                                            <div style={{ fontSize: '28px' }}>
                                                📭
                                            </div>
                                            <p style={{ marginBottom: 0 }}>
                                                Belum ada notifikasi.
                                            </p>
                                        </div>
                                    ) : (
                                        notifikasiTerurut.map((item) => {
                                            const sudahDibaca =
                                                notifDibaca.includes(item.id);

                                            return (
                                                <button
                                                    type="button"
                                                    key={item.id}
                                                    onClick={() =>
                                                        bukaNotifikasi(item)
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '12px',
                                                        textAlign: 'left',
                                                        padding: '14px 16px',
                                                        border: 'none',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: sudahDibaca
                                                            ? '#ffffff'
                                                            : '#eff6ff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            flexShrink: 0,
                                                            borderRadius: '10px',
                                                            background: `${item.warna}18`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '19px',
                                                        }}
                                                    >
                                                        {item.ikon}
                                                    </span>

                                                    <span style={{ flex: 1 }}>
                                                        <strong
                                                            style={{
                                                                display: 'block',
                                                                fontSize: '13px',
                                                                color: '#1e293b',
                                                                marginBottom: '4px',
                                                            }}
                                                        >
                                                            {item.judul}
                                                        </strong>

                                                        <span
                                                            style={{
                                                                display: 'block',
                                                                fontSize: '12px',
                                                                lineHeight: '1.5',
                                                                color: '#64748b',
                                                                overflowWrap: 'anywhere',
                                                            }}
                                                        >
                                                            {item.pesan}
                                                        </span>

                                                        <span
                                                            style={{
                                                                display: 'block',
                                                                fontSize: '11px',
                                                                color: '#94a3b8',
                                                                marginTop: '6px',
                                                            }}
                                                        >
                                                            {formatTanggal(item.waktu)}
                                                        </span>
                                                    </span>

                                                    {!sudahDibaca && (
                                                        <span
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                background: '#2563eb',
                                                                marginTop: '5px',
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setNotifTerbuka(false)}
                                    style={{
                                        width: '100%',
                                        padding: '13px',
                                        border: 'none',
                                        borderTop: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        color: '#475569',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    Tutup Notifikasi
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="operator-user">
                        <div className="operator-avatar">👤</div>
                        <div>
                            <strong>{username}</strong>
                            <span>Operator</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="operator-logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>
                </div>
            </header>

            <section className="operator-content">
                {/* STATISTIK */}
                <div className="operator-stats">
                    <div className="operator-stat-card">
                        <div className="operator-stat-icon blue">📋</div>
                        <div>
                            <span>Total Laporan</span>
                            <strong>{totalLaporan}</strong>
                        </div>
                    </div>

                    <div className="operator-stat-card">
                        <div className="operator-stat-icon orange">⏳</div>
                        <div>
                            <span>Siap Dikerjakan</span>
                            <strong>{jumlahDikirim}</strong>
                        </div>
                    </div>

                    <div className="operator-stat-card">
                        <div className="operator-stat-icon purple">🔄</div>
                        <div>
                            <span>Diproses</span>
                            <strong>{jumlahDiproses}</strong>
                        </div>
                    </div>

                    <div className="operator-stat-card">
                        <div className="operator-stat-icon green">✓</div>
                        <div>
                            <span>Selesai</span>
                            <strong>{jumlahSelesai}</strong>
                        </div>
                    </div>
                </div>

                {/* JUDUL DATA */}
                <div className="operator-section-header">
                    <div>
                        <p>MANAJEMEN LAPORAN</p>
                        <h2>Data Laporan</h2>
                        <span>
                            Laporan yang telah dikonfirmasi Admin dapat langsung dikerjakan.
                        </span>
                    </div>
                </div>

                {/* TABEL */}
                <div className="operator-table-card">
                    {loading ? (
                        <div className="operator-empty">
                            <h3>Memuat laporan...</h3>
                        </div>
                    ) : laporan.length === 0 ? (
                        <div className="operator-empty">
                            <div className="operator-empty-icon">📭</div>
                            <h3>Belum Ada Laporan</h3>
                            <p>Belum ada laporan yang masuk ke sistem.</p>
                        </div>
                    ) : (
                        <div className="operator-table-wrapper">
                            <table className="operator-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Pelapor</th>
                                        <th>Kategori</th>
                                        <th>Lokasi</th>
                                        <th>Waktu</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {laporan.map((item, index) => {
                                        const status = statusTampilan(item);

                                        return (
                                            <tr key={item.id || index}>
                                                <td>
                                                    <span className="table-number">
                                                        {index + 1}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="reporter">
                                                        <div className="reporter-avatar">
                                                            👤
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                {item.nama ||
                                                                    item.pelapor ||
                                                                    'Pengguna'}
                                                            </strong>
                                                            <span>Pelapor</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="category-badge">
                                                        {item.kategori || 'Lainnya'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="location-text">
                                                        <span>📍</span>
                                                        <span>{item.lokasi || '-'}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="date-text">
                                                        {formatTanggal(
                                                            item.tanggalKirim ||
                                                                item.tanggal
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`operator-status status-${status
                                                            .toLowerCase()
                                                            .replace(/\s/g, '-')}`}
                                                    >
                                                        <span className="status-dot" />
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="detail-button"
                                                        onClick={() => bukaDetail(item)}
                                                    >
                                                        Lihat Detail <span>→</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* POPUP DETAIL */}
            {selectedLaporan && (
                <div className="detail-overlay" onClick={tutupDetail}>
                    <div
                        className="detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="detail-modal-header">
                            <div>
                                <p>DETAIL LAPORAN</p>
                                <h2>{selectedLaporan.kategori || 'Laporan'}</h2>
                            </div>

                            <button
                                type="button"
                                className="detail-close"
                                onClick={tutupDetail}
                            >
                                ×
                            </button>
                        </div>

                        <div className="detail-modal-body">
                            {/* KEPUTUSAN ADMIN */}
                            <div className="detail-description">
                                <label>Keputusan Admin</label>
                                <div>
                                    <strong>
                                        {selectedLaporan.statusKonfirmasiAdmin ||
                                            'Menunggu Konfirmasi'}
                                    </strong>

                                    {selectedLaporan.catatanAdmin && (
                                        <p>
                                            Alasan Admin: {selectedLaporan.catatanAdmin}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* INFORMASI LAPORAN */}
                            <div className="detail-info-grid">
                                <div className="detail-info">
                                    <span>Pelapor</span>
                                    <strong>
                                        {selectedLaporan.nama ||
                                            selectedLaporan.pelapor ||
                                            'Pengguna'}
                                    </strong>
                                </div>

                                <div className="detail-info">
                                    <span>Kategori</span>
                                    <strong>
                                        {selectedLaporan.kategori || 'Lainnya'}
                                    </strong>
                                </div>

                                <div className="detail-info">
                                    <span>Lokasi</span>
                                    <strong>{selectedLaporan.lokasi || '-'}</strong>
                                </div>

                                <div className="detail-info">
                                    <span>Waktu Laporan</span>
                                    <strong>
                                        {formatTanggal(
                                            selectedLaporan.tanggalKirim ||
                                                selectedLaporan.tanggal
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {/* DESKRIPSI */}
                            <div className="detail-description">
                                <label>Deskripsi Masalah</label>
                                <div>
                                    {selectedLaporan.deskripsi ||
                                        'Tidak ada deskripsi.'}
                                </div>
                            </div>

                            {/* FOTO BUKTI */}
                            {selectedLaporan.foto && (
                                <div className="detail-attachment">
                                    <label>Foto Bukti</label>
                                    <img
                                        src={selectedLaporan.foto}
                                        alt="Foto bukti laporan"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            maxHeight: '260px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </div>
                            )}

                            {/* CATATAN OPERATOR */}
                            {selectedLaporan.catatanOperator && (
                                <div className="detail-description">
                                    <label>Catatan Operator</label>
                                    <div>{selectedLaporan.catatanOperator}</div>
                                </div>
                            )}

                            {/* CATATAN PERBAIKAN ADMIN */}
                            {selectedLaporan.status === 'Perlu Perbaikan' && (
                                <div className="detail-description">
                                    <label>Catatan Perbaikan dari Admin</label>
                                    <div>
                                        {selectedLaporan.catatanVerifikasiAdmin ||
                                            'Silakan periksa kembali pekerjaan.'}
                                    </div>
                                </div>
                            )}

                            {/* FORM PENANGANAN */}
                            {selectedLaporan.statusKonfirmasiAdmin !==
                            'Dikonfirmasi' ? (
                                <div className="detail-finished">
                                    Laporan belum dikonfirmasi Admin. Operator
                                    belum dapat memulai pengerjaan.
                                </div>
                            ) : selectedLaporan.status ===
                                  'Menunggu Verifikasi Admin' ||
                              selectedLaporan.status === 'Selesai' ||
                              selectedLaporan.statusVerifikasiAdmin ===
                                  'Selesai' ? (
                                <div className="detail-finished">
                                    {selectedLaporan.status === 'Selesai' ||
                                    selectedLaporan.statusVerifikasiAdmin ===
                                        'Selesai'
                                        ? 'Laporan telah dinyatakan selesai oleh Admin.'
                                        : 'Laporan sedang menunggu verifikasi Admin.'}
                                </div>
                            ) : (
                                <>
                                    <div className="detail-status-section">
                                        <label>Status Penanganan</label>

                                        <div className="detail-status-buttons">
                                            <button
                                                type="button"
                                                className={`detail-status-btn sent ${
                                                    statusDetail === 'Siap Dikerjakan'
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setStatusDetail('Siap Dikerjakan')
                                                }
                                            >
                                                Siap Dikerjakan
                                            </button>

                                            <button
                                                type="button"
                                                className={`detail-status-btn process ${
                                                    statusDetail === 'Diproses'
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setStatusDetail('Diproses')
                                                }
                                            >
                                                Diproses
                                            </button>
                                        </div>
                                    </div>

                                    <div className="detail-note-section">
                                        <label htmlFor="catatanOperator">
                                            Catatan Pengerjaan
                                        </label>

                                        <p>
                                            Jelaskan perkembangan atau tindakan
                                            yang telah dilakukan.
                                        </p>

                                        <textarea
                                            id="catatanOperator"
                                            rows="4"
                                            value={catatan}
                                            onChange={(e) =>
                                                setCatatan(e.target.value)
                                            }
                                            placeholder="Contoh: AC sedang diperiksa oleh teknisi."
                                        />
                                    </div>

                                    <div className="detail-note-section">
                                        <label>Jika Pekerjaan Sudah Selesai</label>
                                        <p>
                                            Isi catatan pengerjaan, lalu kirim
                                            laporan untuk diperiksa Admin.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* TOMBOL POPUP */}
                        <div className="detail-modal-footer">
                            <button
                                type="button"
                                className="detail-cancel-button"
                                onClick={tutupDetail}
                            >
                                Tutup
                            </button>

                            {bolehDikerjakan(selectedLaporan) && (
                                <>
                                    <button
                                        type="button"
                                        className="detail-save-button"
                                        onClick={simpanDetail}
                                        disabled={menyimpan}
                                    >
                                        {menyimpan
                                            ? 'Menyimpan...'
                                            : 'Simpan Status'}
                                    </button>

                                    <button
                                        type="button"
                                        className="detail-save-button"
                                        onClick={mintaVerifikasi}
                                        disabled={menyimpan}
                                    >
                                        {menyimpan
                                            ? 'Mengirim...'
                                            : 'Minta Verifikasi Admin'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
