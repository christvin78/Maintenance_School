
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [laporan, setLaporan] = useState([]);
    const [notifTerbuka, setNotifTerbuka] = useState(false);
    const [notifDibaca, setNotifDibaca] = useState([]);

    const [bulanDipilih, setBulanDipilih] = useState(
        new Date().getMonth()
    );

    const [tahunDipilih, setTahunDipilih] = useState(
        new Date().getFullYear()
    );

    const namaBulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const kategoriDefault = [
        'Fasilitas',
        'Kebersihan',
        'Internet',
        'Ruang Kelas',
        'Keamanan',
        'Lainnya',
    ];

    // ========================================
    // AMBIL DATA LAPORAN DARI MYSQL
    // AUTO-REFRESH SETIAP 5 DETIK
    // ========================================

    useEffect(() => {
        let aktif = true;

        const ambilData = async () => {
            try {
                const response = await fetch('/api/laporan', {
                    cache: 'no-store',
                });

                const hasil = await response.json();

                if (!response.ok || !hasil.success) {
                    throw new Error(
                        hasil.message || 'Gagal mengambil data laporan.'
                    );
                }

                if (aktif) {
                    setLaporan(
                        Array.isArray(hasil.data) ? hasil.data : []
                    );
                }
            } catch (error) {
                console.error('Gagal mengambil laporan:', error);
            }
        };

        const ambilNotifikasiDibaca = () => {
            try {
                const data = JSON.parse(
                    localStorage.getItem('adminNotifikasiDibaca') || '[]'
                );

                if (aktif) {
                    setNotifDibaca(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Gagal membaca notifikasi:', error);
            }
        };

        ambilData();
        ambilNotifikasiDibaca();

        const interval = window.setInterval(() => {
            ambilData();
            ambilNotifikasiDibaca();
        }, 5000);

        return () => {
            aktif = false;
            window.clearInterval(interval);
        };
    }, []);

    // ========================================
    // AMBIL TANGGAL LAPORAN
    // ========================================

    const ambilTanggal = (item) => {
        if (item.tanggalKirim) {
            const tanggalBaru = new Date(item.tanggalKirim);

            if (!isNaN(tanggalBaru.getTime())) {
                return tanggalBaru;
            }
        }

        if (item.tanggal) {
            if (
                typeof item.tanggal === 'string' &&
                item.tanggal.includes('/')
            ) {
                const bagian = item.tanggal.split('/');

                if (bagian.length === 3) {
                    const hari = parseInt(bagian[0]);
                    const bulan = parseInt(bagian[1]) - 1;
                    const tahun = parseInt(bagian[2]);

                    const tanggalLama = new Date(
                        tahun,
                        bulan,
                        hari
                    );

                    if (!isNaN(tanggalLama.getTime())) {
                        return tanggalLama;
                    }
                }
            }

            const tanggalBaru = new Date(item.tanggal);

            if (!isNaN(tanggalBaru.getTime())) {
                return tanggalBaru;
            }
        }

        return null;
    };

    // ========================================
    // KATEGORI
    // ========================================

    const semuaKategori = [
        ...kategoriDefault,
        ...laporan
            .map((item) => item.kategori)
            .filter(Boolean),
    ];

    const kategori = [...new Set(semuaKategori)];

    // ========================================
    // HITUNG STATISTIK
    // ========================================

    const hitungStatistik = () => {
        const hasil = {};

        kategori.forEach((item) => {
            hasil[item] = 0;
        });

        laporan.forEach((item) => {
            const tanggal = ambilTanggal(item);

            if (!tanggal) {
                return;
            }

            const bulanLaporan = tanggal.getMonth();
            const tahunLaporan = tanggal.getFullYear();

            if (
                bulanLaporan !== bulanDipilih ||
                tahunLaporan !== tahunDipilih
            ) {
                return;
            }

            const namaKategori = item.kategori || 'Lainnya';

            if (hasil[namaKategori] === undefined) {
                hasil[namaKategori] = 0;
            }

            hasil[namaKategori]++;
        });

        return hasil;
    };

    const statistik = hitungStatistik();

    const totalLaporan = Object.values(statistik).reduce(
        (total, jumlah) => total + jumlah,
        0
    );

    // ========================================
    // DATA LINE CHART
    // ========================================

    const chartData = kategori.map((item) => ({
        kategori: item,
        jumlah: statistik[item] || 0,
    }));

    const jumlahTerbesar = Math.max(
        ...chartData.map((item) => item.jumlah),
        1
    );

    // ========================================
    // POSISI LINE CHART
    // ========================================

    const chartWidth = 900;
    const chartHeight = 320;

    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 30;
    const paddingBottom = 65;

    const chartAreaWidth =
        chartWidth - paddingLeft - paddingRight;

    const chartAreaHeight =
        chartHeight - paddingTop - paddingBottom;

    const getX = (index) => {
        if (chartData.length === 1) {
            return paddingLeft + chartAreaWidth / 2;
        }

        return (
            paddingLeft +
            (index / (chartData.length - 1)) *
                chartAreaWidth
        );
    };

    const getY = (jumlah) => {
        return (
            paddingTop +
            chartAreaHeight -
            (jumlah / jumlahTerbesar) * chartAreaHeight
        );
    };

    const titikChart = chartData.map((item, index) => ({
        x: getX(index),
        y: getY(item.jumlah),
        jumlah: item.jumlah,
        kategori: item.kategori,
    }));

    const garisChart = titikChart
        .map((item) => `${item.x},${item.y}`)
        .join(' ');

    // ========================================
    // SKALA Y
    // ========================================

    const jumlahSkala = Math.max(jumlahTerbesar, 5);

    const skalaY = [
        0,
        Math.ceil(jumlahSkala * 0.25),
        Math.ceil(jumlahSkala * 0.5),
        Math.ceil(jumlahSkala * 0.75),
        jumlahSkala,
    ];

    // ========================================
    // TAHUN
    // ========================================

    const tahunSekarang = new Date().getFullYear();

    const daftarTahun = [
        tahunSekarang - 2,
        tahunSekarang - 1,
        tahunSekarang,
    ];

    // ========================================
    // NOTIFIKASI ADMIN
    // ========================================

    const daftarNotifikasi = laporan.flatMap((item) => {
        const hasil = [];

        // Laporan baru dari Guru.
        if (!item.statusKonfirmasiAdmin) {
            hasil.push({
                id: `${item.id}-laporan-baru`,
                judul: 'Laporan baru dari Guru',
                pesan: `${item.kategori || 'Lainnya'} di ${
                    item.lokasi || 'Lokasi tidak diketahui'
                }`,
                waktu: item.tanggalKirim || item.tanggal,
                tipe: 'laporan',
            });
        }

        // Operator meminta verifikasi.
        if (
            item.status === 'Menunggu Verifikasi Admin' ||
            item.waktuMintaVerifikasi
        ) {
            hasil.push({
                id: `${item.id}-verifikasi`,
                judul: 'Permintaan verifikasi',
                pesan: `Operator meminta verifikasi: ${
                    item.kategori || 'Laporan'
                } di ${
                    item.lokasi || 'Lokasi tidak diketahui'
                }`,
                waktu:
                    item.waktuMintaVerifikasi ||
                    item.tanggalSelesai,
                tipe: 'verifikasi',
            });
        }

        return hasil;
    });

    const jumlahBelumDibaca = daftarNotifikasi.filter(
        (item) => !notifDibaca.includes(item.id)
    ).length;

    // ========================================
    // TANDAI NOTIFIKASI DIBACA
    // ========================================

    const tandaiDibaca = (id) => {
        const terbaru = [
            ...new Set([...notifDibaca, id]),
        ];

        setNotifDibaca(terbaru);

        localStorage.setItem(
            'adminNotifikasiDibaca',
            JSON.stringify(terbaru)
        );
    };

    const tandaiSemuaDibaca = () => {
        const semuaId = daftarNotifikasi.map(
            (item) => item.id
        );

        setNotifDibaca(semuaId);

        localStorage.setItem(
            'adminNotifikasiDibaca',
            JSON.stringify(semuaId)
        );
    };

    // ========================================
    // TAMPILAN
    // ========================================

    return (
        <div className="admin-dashboard">
            {/* HEADER */}
            <header
                className="admin-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    position: 'relative',
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <p className="admin-header-label">
                        ADMINISTRATOR
                    </p>

                    <h1>Dashboard</h1>

                    <p className="admin-header-description">
                        Kelola sistem pelaporan Sekolah Tri Ratna
                        melalui dashboard ini.
                    </p>
                </div>

                {/* TOMBOL NOTIFIKASI */}
                <div style={{ position: 'relative' }}>
                    <button
                        type="button"
                        onClick={() =>
                            setNotifTerbuka(!notifTerbuka)
                        }
                        aria-label="Buka notifikasi"
                        style={{
                            position: 'relative',
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '23px',
                        }}
                    >
                        🔔

                        {jumlahBelumDibaca > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    minWidth: '21px',
                                    height: '21px',
                                    padding: '0 5px',
                                    borderRadius: '20px',
                                    background: '#dc2626',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {jumlahBelumDibaca > 99
                                    ? '99+'
                                    : jumlahBelumDibaca}
                            </span>
                        )}
                    </button>

                    {/* PANEL NOTIFIKASI */}
                    {notifTerbuka && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '58px',
                                right: 0,
                                width: 'min(360px, calc(100vw - 40px))',
                                maxHeight: '420px',
                                overflowY: 'auto',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                boxShadow:
                                    '0 12px 35px rgba(0,0,0,0.14)',
                                zIndex: 1000,
                                color: '#1e293b',
                            }}
                        >
                            <div
                                style={{
                                    padding: '16px',
                                    borderBottom:
                                        '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <strong>Notifikasi</strong>

                                <button
                                    type="button"
                                    onClick={tandaiSemuaDibaca}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#2563eb',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    Tandai dibaca
                                </button>
                            </div>

                            {daftarNotifikasi.length === 0 ? (
                                <div
                                    style={{
                                        padding: '28px 16px',
                                        textAlign: 'center',
                                        color: '#64748b',
                                    }}
                                >
                                    <div style={{ fontSize: '28px' }}>
                                        🔕
                                    </div>

                                    <p style={{ marginBottom: 0 }}>
                                        Belum ada notifikasi.
                                    </p>
                                </div>
                            ) : (
                                daftarNotifikasi.map((item) => {
                                    const sudahDibaca =
                                        notifDibaca.includes(item.id);

                                    return (
                                        <Link
                                            key={item.id}
                                            href="/admin/laporan"
                                            onClick={() => {
                                                tandaiDibaca(item.id);
                                                setNotifTerbuka(false);
                                            }}
                                            style={{
                                                display: 'block',
                                                padding: '14px 16px',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                background: sudahDibaca
                                                    ? '#ffffff'
                                                    : '#eff6ff',
                                                borderBottom:
                                                    '1px solid #f1f5f9',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '10px',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '21px',
                                                    }}
                                                >
                                                    {item.tipe === 'laporan'
                                                        ? '📋'
                                                        : '✅'}
                                                </span>

                                                <div style={{ flex: 1 }}>
                                                    <strong
                                                        style={{
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {item.judul}
                                                    </strong>

                                                    <p
                                                        style={{
                                                            margin: '5px 0',
                                                            fontSize: '12px',
                                                            lineHeight: 1.5,
                                                            color: '#475569',
                                                        }}
                                                    >
                                                        {item.pesan}
                                                    </p>

                                                    <small
                                                        style={{
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        {item.waktu
                                                            ? new Date(
                                                                  item.waktu
                                                              ).toLocaleString(
                                                                  'id-ID'
                                                              )
                                                            : 'Waktu tidak tersedia'}
                                                    </small>

                                                    {!sudahDibaca && (
                                                        <div
                                                            style={{
                                                                marginTop: '5px',
                                                                fontSize: '11px',
                                                                color: '#2563eb',
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            Belum dibaca
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}

                            <div style={{ padding: '12px 16px' }}>
                                <Link
                                    href="/admin/laporan"
                                    onClick={() =>
                                        setNotifTerbuka(false)
                                    }
                                    style={{
                                        color: '#2563eb',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Buka pengelolaan laporan →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* CONTENT */}
            <div className="admin-content">
                {/* STATISTIK */}
                <div className="dashboard-statistik">
                    {/* HEADER STATISTIK */}
                    <div className="dashboard-statistik-header">
                        <div>
                            <p className="dashboard-statistik-label">
                                ANALISIS DATA
                            </p>

                            <h2>Statistik Laporan</h2>

                            <p>
                                Jumlah laporan berdasarkan kategori
                                pada periode yang dipilih.
                            </p>
                        </div>

                        {/* FILTER */}
                        <div className="dashboard-statistik-filter">
                            <select
                                value={bulanDipilih}
                                onChange={(e) =>
                                    setBulanDipilih(
                                        Number(e.target.value)
                                    )
                                }
                            >
                                {namaBulan.map((bulan, index) => (
                                    <option
                                        key={bulan}
                                        value={index}
                                    >
                                        {bulan}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tahunDipilih}
                                onChange={(e) =>
                                    setTahunDipilih(
                                        Number(e.target.value)
                                    )
                                }
                            >
                                {daftarTahun.map((tahun) => (
                                    <option
                                        key={tahun}
                                        value={tahun}
                                    >
                                        {tahun}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* TOTAL LAPORAN */}
                    <div className="dashboard-statistik-total">
                        <span>Total Laporan</span>

                        <strong>{totalLaporan}</strong>

                        <small>
                            {namaBulan[bulanDipilih]} {tahunDipilih}
                        </small>
                    </div>

                    {/* LINE CHART */}
                    <div className="dashboard-chart-card">
                        <div className="dashboard-chart-title">
                            <div>
                                <h3>
                                    Laporan Berdasarkan Kategori
                                </h3>

                                <p>
                                    {namaBulan[bulanDipilih]}{' '}
                                    {tahunDipilih}
                                </p>
                            </div>
                        </div>

                        <div className="line-chart-wrapper">
                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                className="line-chart"
                                preserveAspectRatio="none"
                            >
                                {/* GARIS GRID */}
                                {skalaY.map((nilai, index) => {
                                    const y = getY(nilai);

                                    return (
                                        <g key={index}>
                                            <line
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={
                                                    chartWidth -
                                                    paddingRight
                                                }
                                                y2={y}
                                                className="chart-grid-line"
                                            />

                                            <text
                                                x={paddingLeft - 12}
                                                y={y + 4}
                                                textAnchor="end"
                                                className="chart-y-label"
                                            >
                                                {nilai}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* GARIS UTAMA */}
                                <line
                                    x1={paddingLeft}
                                    y1={paddingTop + chartAreaHeight}
                                    x2={chartWidth - paddingRight}
                                    y2={paddingTop + chartAreaHeight}
                                    className="chart-axis-line"
                                />

                                {/* LINE */}
                                <polyline
                                    points={garisChart}
                                    fill="none"
                                    className="chart-line"
                                />

                                {/* TITIK */}
                                {titikChart.map((item, index) => (
                                    <g key={index}>
                                        <circle
                                            cx={item.x}
                                            cy={item.y}
                                            r="6"
                                            className="chart-point-outer"
                                        />

                                        <circle
                                            cx={item.x}
                                            cy={item.y}
                                            r="3"
                                            className="chart-point-inner"
                                        />

                                        {/* NILAI */}
                                        <text
                                            x={item.x}
                                            y={item.y - 13}
                                            textAnchor="middle"
                                            className="chart-value-label"
                                        >
                                            {item.jumlah}
                                        </text>

                                        {/* KATEGORI */}
                                        <text
                                            x={item.x}
                                            y={chartHeight - 25}
                                            textAnchor="middle"
                                            className="chart-x-label"
                                        >
                                            {item.kategori}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* INFO STATISTIK */}
                    <div className="dashboard-statistik-info">
                        <div className="dashboard-statistik-info-icon">
                            📊
                        </div>

                        <div>
                            <h3>Informasi Statistik</h3>

                            <p>
                                Statistik menampilkan jumlah laporan
                                berdasarkan kategori pada bulan dan
                                tahun yang dipilih.
                            </p>
                        </div>
                    </div>
                </div>

                {/* INFO SISTEM */}
                <div className="admin-info-card">
                    <div className="admin-info-icon">💡</div>

                    <div>
                        <h3>Sistem Pelaporan Sekolah</h3>

                        <p>
                            Dashboard admin digunakan untuk memantau
                            dan mengelola laporan mengenai fasilitas,
                            kebersihan, keamanan, dan kebutuhan
                            lainnya di lingkungan Sekolah Tri Ratna.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
