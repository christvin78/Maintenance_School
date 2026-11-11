'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css';

export default function AdminLaporanPage() {
    const router = useRouter();

    const [laporan, setLaporan] = useState([]);
    const [laporanDipilih, setLaporanDipilih] = useState(null);
    const [alasan, setAlasan] = useState('');
    const [pesan, setPesan] = useState('');
    const [loading, setLoading] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);

    // PENCARIAN DAN FILTER
    const [pencarian, setPencarian] = useState('');
    const [filterKategori, setFilterKategori] = useState('Semua');

    // AMBIL DATA LAPORAN DARI MYSQL
    const ambilLaporan = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/laporan', {
                cache: 'no-store',
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal mengambil data laporan.'
                );
            }

            setLaporan(Array.isArray(hasil.data) ? hasil.data : []);
        } catch (error) {
            console.error('Gagal membaca laporan:', error);
            setPesan(error.message || 'Gagal mengambil data laporan.');
        } finally {
            setLoading(false);
        }
    };

    // CEK LOGIN ADMIN
    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            router.replace('/login');
            return;
        }

        ambilLaporan();
    }, [router]);

    // SIMPAN PERUBAHAN KE MYSQL
    const simpanLaporan = async (id, perubahan) => {
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
                hasil.message || 'Gagal menyimpan perubahan laporan.'
            );
        }

        await ambilLaporan();
    };

    // BUKA POPUP
    const bukaAction = (item) => {
        setLaporanDipilih(item);
        setAlasan('');
        setPesan('');
    };

    // TUTUP POPUP
    const tutupAction = () => {
        if (menyimpan) return;

        setLaporanDipilih(null);
        setAlasan('');
        setPesan('');
    };

    // UPDATE LAPORAN
    const updateLaporan = async (perubahan) => {
        if (!laporanDipilih) return;

        try {
            setMenyimpan(true);
            setPesan('');

            await simpanLaporan(laporanDipilih.id, perubahan);

            setLaporanDipilih(null);
            setAlasan('');
            setPesan('');
        } catch (error) {
            console.error('Gagal memperbarui laporan:', error);
            setPesan(
                error.message || 'Gagal menyimpan perubahan laporan.'
            );
        } finally {
            setMenyimpan(false);
        }
    };

    // KONFIRMASI LAPORAN BARU
    const konfirmasiLaporan = () => {
        if (!laporanDipilih) return;

        updateLaporan({
            statusKonfirmasiAdmin: 'Dikonfirmasi',
            status: 'Siap Dikerjakan',
            catatanAdmin: '',
            waktuKonfirmasiAdmin: new Date().toISOString(),
        });
    };

    // TOLAK LAPORAN BARU
    const tolakLaporan = () => {
        if (!alasan.trim()) {
            setPesan('Alasan penolakan wajib diisi.');
            return;
        }

        updateLaporan({
            statusKonfirmasiAdmin: 'Tidak Dikonfirmasi',
            catatanAdmin: alasan.trim(),
            waktuKonfirmasiAdmin: new Date().toISOString(),
        });
    };

    // SETUJUI HASIL KERJA OPERATOR
    const setujuiHasil = () => {
        if (!laporanDipilih) return;

        updateLaporan({
            status: 'Selesai',
            statusVerifikasiAdmin: 'Selesai',
            catatanVerifikasiAdmin: '',
            tanggalSelesai: new Date().toISOString(),
            waktuVerifikasiAdmin: new Date().toISOString(),
        });
    };

    // KEMBALIKAN LAPORAN UNTUK DIPERBAIKI
    const kembalikanOperator = () => {
        if (!alasan.trim()) {
            setPesan('Alasan perbaikan wajib diisi.');
            return;
        }

        updateLaporan({
            status: 'Perlu Perbaikan',
            statusVerifikasiAdmin: 'Perlu Perbaikan',
            catatanVerifikasiAdmin: alasan.trim(),
            tanggalSelesai: null,
            waktuVerifikasiAdmin: new Date().toISOString(),
        });
    };

    // AMBIL FOTO LAPORAN
    const ambilFoto = (item) =>
        item.foto ||
        item.fotoUrl ||
        item.fotoLaporan ||
        item.gambar ||
        item.image ||
        '';

    // STATUS KONFIRMASI
    const statusKonfirmasi = (item) =>
        item.statusKonfirmasiAdmin || 'Menunggu Konfirmasi';

    // STATUS MENUNGGU VERIFIKASI
    const menungguVerifikasi = (item) =>
        item.status === 'Menunggu Verifikasi Admin';

    // WARNA STATUS
    const warnaStatus = (status) => {
        if (status === 'Dikonfirmasi' || status === 'Selesai') {
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

        return {
            background: '#fef3c7',
            color: '#92400e',
        };
    };

    // DAFTAR KATEGORI OTOMATIS DARI DATABASE
    const kategoriTersedia = [
        'Semua',
        ...new Set(
            laporan
                .map((item) => item.kategori)
                .filter(Boolean)
        ),
    ];

    // FILTER DAN PENCARIAN LAPORAN
    const laporanTersaring = laporan.filter((item) => {
        const kataKunci = pencarian.toLowerCase().trim();

        const cocokPencarian = [
            item.nama,
            item.pelapor,
            item.kategori,
            item.lokasi,
            item.deskripsi,
            item.status,
            item.statusKonfirmasiAdmin,
        ].some((nilai) =>
            String(nilai || '').toLowerCase().includes(kataKunci)
        );

        const cocokKategori =
            filterKategori === 'Semua' ||
            item.kategori === filterKategori;

        return cocokPencarian && cocokKategori;
    });

    // STYLE DETAIL POPUP
    const judulDetail = {
        margin: '0 0 6px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#667085',
    };

    const isiDetail = {
        margin: 0,
        fontSize: '12px',
        color: '#344054',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
    };

    const tombol = {
        padding: '11px 15px',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
    };

    return (
        <main
            className="admin-dashboard"
            style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                overflowX: 'hidden',
            }}
        >
            {/* HEADER */}
            <header className="admin-header">
                <div>
                    <p className="admin-header-label">
                        DATA LAPORAN
                    </p>

                    <h1>Laporan Sekolah</h1>

                    <p className="admin-header-description">
                        Konfirmasi laporan dan verifikasi hasil pengerjaan operator.
                    </p>
                </div>
            </header>

            {/* KONTEN */}
            <section
                className="admin-content"
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                }}
            >
                {/* JUDUL DAN TOTAL */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '15px',
                        flexWrap: 'wrap',
                        marginBottom: '25px',
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <h2
                            style={{
                                margin: '0 0 6px',
                                fontSize: '19px',
                                fontWeight: '800',
                                color: '#263244',
                            }}
                        >
                            Seluruh Laporan
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                fontSize: '10px',
                                color: '#8991a1',
                            }}
                        >
                            Periksa laporan masuk dan hasil pengerjaan operator.
                        </p>
                    </div>

                    <div
                        style={{
                            flex: '0 1 130px',
                            padding: '14px 12px',
                            borderRadius: '12px',
                            background: '#edf3ff',
                            border: '1px solid #dbe7ff',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                        }}
                    >
                        <span
                            style={{
                                display: 'block',
                                fontSize: '9px',
                                color: '#71809a',
                                marginBottom: '4px',
                            }}
                        >
                            Total Laporan
                        </span>

                        <strong
                            style={{
                                display: 'block',
                                fontSize: '22px',
                                color: '#2563eb',
                            }}
                        >
                            {laporan.length}
                        </strong>
                    </div>
                </div>

                {/* PENCARIAN DAN FILTER */}
                <div className="admin-laporan-filter">
                    <div className="admin-laporan-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Cari nama, kategori, lokasi, atau laporan..."
                            value={pencarian}
                            onChange={(e) =>
                                setPencarian(e.target.value)
                            }
                        />

                        {pencarian && (
                            <button
                                type="button"
                                onClick={() => setPencarian('')}
                                aria-label="Hapus pencarian"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <select
                        value={filterKategori}
                        onChange={(e) =>
                            setFilterKategori(e.target.value)
                        }
                        aria-label="Filter kategori laporan"
                    >
                        {kategoriTersedia.map((kategori) => (
                            <option
                                key={kategori}
                                value={kategori}
                            >
                                {kategori === 'Semua'
                                    ? 'Semua Kategori'
                                    : kategori}
                            </option>
                        ))}
                    </select>
                </div>

                {/* JUMLAH HASIL FILTER */}
                <p className="admin-laporan-jumlah">
                    Menampilkan{' '}
                    <strong>{laporanTersaring.length}</strong> dari{' '}
                    <strong>{laporan.length}</strong> laporan
                </p>

                {/* TABEL LAPORAN */}
                <div
                    className="laporan-table"
                    style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        overflowX: 'auto',
                        boxSizing: 'border-box',
                        background: '#fff',
                        border: '1px solid #e4e8ef',
                        borderRadius: '15px',
                        boxShadow: '0 8px 25px rgba(31, 41, 55, 0.035)',
                    }}
                >
                    <table
                        style={{
                            width: '100%',
                            minWidth: '700px',
                            tableLayout: 'fixed',
                            borderCollapse: 'collapse',
                        }}
                    >
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '24%' }} />
                            <col style={{ width: '19%' }} />
                            <col style={{ width: '14%' }} />
                        </colgroup>

                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pelapor</th>
                                <th>Kategori</th>
                                <th>Lokasi</th>
                                <th>Laporan</th>
                                <th>Status Admin</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        style={{
                                            textAlign: 'center',
                                            padding: '30px 5px',
                                        }}
                                    >
                                        Memuat data laporan...
                                    </td>
                                </tr>
                            ) : laporanTersaring.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        style={{
                                            textAlign: 'center',
                                            padding: '30px 5px',
                                            color: '#8991a1',
                                            fontSize: '11px',
                                        }}
                                    >
                                        {laporan.length === 0
                                            ? pesan || 'Belum ada laporan yang masuk.'
                                            : 'Laporan yang sesuai tidak ditemukan.'}
                                    </td>
                                </tr>
                            ) : (
                                laporanTersaring.map((item, index) => {
                                    const status = statusKonfirmasi(item);

                                    const statusTampilan =
                                        menungguVerifikasi(item)
                                            ? 'Menunggu Verifikasi'
                                            : item.statusVerifikasiAdmin === 'Perlu Perbaikan'
                                                ? 'Perlu Perbaikan'
                                                : item.statusVerifikasiAdmin === 'Selesai'
                                                    ? 'Selesai'
                                                    : status;

                                    return (
                                        <tr key={item.id || index}>
                                            <td>{index + 1}</td>

                                            <td>
                                                {item.nama || item.pelapor || 'Pengguna'}
                                            </td>

                                            <td>{item.kategori || '-'}</td>

                                            <td>{item.lokasi || '-'}</td>

                                            <td>{item.deskripsi || '-'}</td>

                                            <td>
                                                <span
                                                    style={{
                                                        ...warnaStatus(statusTampilan),
                                                        display: 'inline-block',
                                                        maxWidth: '100%',
                                                        padding: '6px 5px',
                                                        borderRadius: '10px',
                                                        fontSize: '9px',
                                                        fontWeight: '700',
                                                        whiteSpace: 'normal',
                                                        overflowWrap: 'anywhere',
                                                        boxSizing: 'border-box',
                                                    }}
                                                >
                                                    {statusTampilan}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => bukaAction(item)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        padding: '8px 4px',
                                                        border: 'none',
                                                        borderRadius: '7px',
                                                        background: '#2563eb',
                                                        color: '#fff',
                                                        fontSize: '10px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        overflowWrap: 'anywhere',
                                                        boxSizing: 'border-box',
                                                    }}
                                                >
                                                    Action
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* POPUP ADMIN */}
            {laporanDipilih && (
                <div
                    onClick={tutupAction}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '620px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '24px',
                            boxSizing: 'border-box',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* HEADER POPUP */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '15px',
                                marginBottom: '20px',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: '0 0 6px',
                                        color: '#1d2939',
                                        fontSize: '20px',
                                    }}
                                >
                                    Pemeriksaan Laporan
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#667085',
                                        fontSize: '12px',
                                    }}
                                >
                                    Periksa laporan dan tindak lanjut pengerjaan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={tutupAction}
                                aria-label="Tutup popup"
                                disabled={menyimpan}
                                style={{
                                    border: 'none',
                                    background: '#f2f4f7',
                                    borderRadius: '8px',
                                    width: '34px',
                                    height: '34px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* FOTO */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={judulDetail}>
                                Foto Bukti Laporan
                            </h3>

                            {ambilFoto(laporanDipilih) ? (
                                <img
                                    src={ambilFoto(laporanDipilih)}
                                    alt="Foto bukti laporan"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        maxHeight: '280px',
                                        objectFit: 'contain',
                                        background: '#f8fafc',
                                        border: '1px solid #e4e7ec',
                                        borderRadius: '10px',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            ) : (
                                <p style={isiDetail}>
                                    Belum ada foto bukti.
                                </p>
                            )}
                        </div>

                        {/* DETAIL LAPORAN */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '14px',
                                marginBottom: '20px',
                            }}
                        >
                            <div>
                                <h3 style={judulDetail}>Nama Pelapor</h3>
                                <p style={isiDetail}>
                                    {laporanDipilih.nama ||
                                        laporanDipilih.pelapor ||
                                        'Pengguna'}
                                </p>
                            </div>

                            <div>
                                <h3 style={judulDetail}>Kategori</h3>
                                <p style={isiDetail}>
                                    {laporanDipilih.kategori || '-'}
                                </p>
                            </div>

                            <div>
                                <h3 style={judulDetail}>Lokasi</h3>
                                <p style={isiDetail}>
                                    {laporanDipilih.lokasi || '-'}
                                </p>
                            </div>

                            <div>
                                <h3 style={judulDetail}>Status Pengerjaan</h3>
                                <p style={isiDetail}>
                                    {laporanDipilih.status || 'Dikirim'}
                                </p>
                            </div>
                        </div>

                        {/* DESKRIPSI */}
                        <h3 style={judulDetail}>Deskripsi Laporan</h3>

                        <p
                            style={{
                                ...isiDetail,
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                lineHeight: 1.6,
                                marginBottom: '18px',
                            }}
                        >
                            {laporanDipilih.deskripsi ||
                                'Tidak ada deskripsi laporan.'}
                        </p>

                        {/* KEPUTUSAN ADMIN */}
                        <div
                            style={{
                                padding: '12px',
                                marginBottom: '18px',
                                borderRadius: '9px',
                                background: '#f8fafc',
                                border: '1px solid #eaecf0',
                            }}
                        >
                            <strong
                                style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    color: '#344054',
                                    marginBottom: '5px',
                                }}
                            >
                                Konfirmasi Laporan
                            </strong>

                            <p style={isiDetail}>
                                {statusKonfirmasi(laporanDipilih)}
                            </p>

                            {laporanDipilih.catatanAdmin && (
                                <p
                                    style={{
                                        ...isiDetail,
                                        marginTop: '8px',
                                        color: '#b42318',
                                    }}
                                >
                                    Alasan penolakan: {laporanDipilih.catatanAdmin}
                                </p>
                            )}
                        </div>

                        {/* CATATAN OPERATOR */}
                        {laporanDipilih.catatanOperator && (
                            <div
                                style={{
                                    padding: '12px',
                                    marginBottom: '18px',
                                    borderRadius: '9px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                }}
                            >
                                <strong
                                    style={{
                                        display: 'block',
                                        fontSize: '11px',
                                        color: '#1d4ed8',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Catatan Pengerjaan Operator
                                </strong>

                                <p style={isiDetail}>
                                    {laporanDipilih.catatanOperator}
                                </p>
                            </div>
                        )}

                        {/* CATATAN PERBAIKAN */}
                        {laporanDipilih.catatanVerifikasiAdmin && (
                            <div
                                style={{
                                    padding: '12px',
                                    marginBottom: '18px',
                                    borderRadius: '9px',
                                    background: '#fff7ed',
                                    border: '1px solid #fed7aa',
                                }}
                            >
                                <strong
                                    style={{
                                        display: 'block',
                                        fontSize: '11px',
                                        color: '#c2410c',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Catatan Perbaikan Admin
                                </strong>

                                <p style={isiDetail}>
                                    {laporanDipilih.catatanVerifikasiAdmin}
                                </p>
                            </div>
                        )}

                        {/* LAPORAN BARU: KONFIRMASI ATAU TOLAK */}
                        {!laporanDipilih.statusKonfirmasiAdmin && (
                            <div style={{ marginBottom: '18px' }}>
                                <label
                                    htmlFor="alasan-admin"
                                    style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#344054',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                    }}
                                >
                                    Alasan jika laporan ditolak
                                </label>

                                <textarea
                                    id="alasan-admin"
                                    value={alasan}
                                    onChange={(e) => {
                                        setAlasan(e.target.value);
                                        setPesan('');
                                    }}
                                    rows={3}
                                    placeholder="Jelaskan alasan jika laporan tidak dapat dikonfirmasi..."
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '11px',
                                        border: '1px solid #d0d5dd',
                                        borderRadius: '8px',
                                        fontFamily: 'inherit',
                                        fontSize: '12px',
                                        resize: 'vertical',
                                    }}
                                />

                                {pesan && (
                                    <p
                                        style={{
                                            color: '#dc2626',
                                            fontSize: '11px',
                                        }}
                                    >
                                        {pesan}
                                    </p>
                                )}

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                        justifyContent: 'flex-end',
                                        marginTop: '12px',
                                    }}
                                >
                                    <button
                                        type="button"
                                        disabled={menyimpan}
                                        onClick={tolakLaporan}
                                        style={{
                                            ...tombol,
                                            background: '#dc2626',
                                            opacity: menyimpan ? 0.6 : 1,
                                        }}
                                    >
                                        {menyimpan
                                            ? 'Menyimpan...'
                                            : 'Tidak Dikonfirmasi'}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={menyimpan}
                                        onClick={konfirmasiLaporan}
                                        style={{
                                            ...tombol,
                                            background: '#16a34a',
                                            opacity: menyimpan ? 0.6 : 1,
                                        }}
                                    >
                                        {menyimpan
                                            ? 'Menyimpan...'
                                            : '✓ Konfirmasi Laporan'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* HASIL KERJA MENUNGGU VERIFIKASI */}
                        {laporanDipilih.statusKonfirmasiAdmin === 'Dikonfirmasi' &&
                            menungguVerifikasi(laporanDipilih) && (
                                <div style={{ marginBottom: '10px' }}>
                                    <div
                                        style={{
                                            padding: '12px',
                                            marginBottom: '15px',
                                            borderRadius: '9px',
                                            background: '#fffbeb',
                                            border: '1px solid #fde68a',
                                        }}
                                    >
                                        <strong
                                            style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                color: '#92400e',
                                                marginBottom: '5px',
                                            }}
                                        >
                                            Hasil Pengerjaan Menunggu Verifikasi
                                        </strong>

                                        <p
                                            style={{
                                                ...isiDetail,
                                                color: '#92400e',
                                            }}
                                        >
                                            Periksa hasil kerja Operator sebelum menyelesaikan laporan.
                                        </p>
                                    </div>

                                    <label
                                        htmlFor="alasan-perbaikan"
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#344054',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                        }}
                                    >
                                        Catatan jika hasil perlu diperbaiki
                                    </label>

                                    <textarea
                                        id="alasan-perbaikan"
                                        value={alasan}
                                        onChange={(e) => {
                                            setAlasan(e.target.value);
                                            setPesan('');
                                        }}
                                        rows={3}
                                        placeholder="Contoh: AC masih belum dingin, mohon diperiksa kembali..."
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '11px',
                                            border: '1px solid #d0d5dd',
                                            borderRadius: '8px',
                                            fontFamily: 'inherit',
                                            fontSize: '12px',
                                            resize: 'vertical',
                                        }}
                                    />

                                    {pesan && (
                                        <p
                                            style={{
                                                color: '#dc2626',
                                                fontSize: '11px',
                                            }}
                                        >
                                            {pesan}
                                        </p>
                                    )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                            justifyContent: 'flex-end',
                                            marginTop: '12px',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            disabled={menyimpan}
                                            onClick={kembalikanOperator}
                                            style={{
                                                ...tombol,
                                                background: '#dc2626',
                                                opacity: menyimpan ? 0.6 : 1,
                                            }}
                                        >
                                            {menyimpan
                                                ? 'Menyimpan...'
                                                : 'Kembalikan ke Operator'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={menyimpan}
                                            onClick={setujuiHasil}
                                            style={{
                                                ...tombol,
                                                background: '#16a34a',
                                                opacity: menyimpan ? 0.6 : 1,
                                            }}
                                        >
                                            {menyimpan
                                                ? 'Menyimpan...'
                                                : '✓ Setujui Hasil'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        {/* STATUS JIKA SUDAH DIPROSES ADMIN */}
                        {laporanDipilih.statusKonfirmasiAdmin === 'Dikonfirmasi' &&
                            !menungguVerifikasi(laporanDipilih) && (
                                <div
                                    style={{
                                        padding: '12px',
                                        borderRadius: '9px',
                                        background: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                    }}
                                >
                                    <strong
                                        style={{
                                            display: 'block',
                                            fontSize: '11px',
                                            color: '#166534',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        Status Tindak Lanjut
                                    </strong>

                                    <p
                                        style={{
                                            ...isiDetail,
                                            color: '#166534',
                                        }}
                                    >
                                        {laporanDipilih.statusVerifikasiAdmin === 'Selesai'
                                            ? 'Hasil pengerjaan telah disetujui. Laporan selesai.'
                                            : laporanDipilih.statusVerifikasiAdmin === 'Perlu Perbaikan'
                                                ? 'Laporan telah dikembalikan kepada Operator untuk diperbaiki.'
                                                : 'Laporan sudah dikonfirmasi dan menunggu pengerjaan Operator.'}
                                    </p>
                                </div>
                            )}

                        {/* LAPORAN DITOLAK */}
                        {laporanDipilih.statusKonfirmasiAdmin === 'Tidak Dikonfirmasi' && (
                            <div
                                style={{
                                    padding: '12px',
                                    borderRadius: '9px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                }}
                            >
                                <p
                                    style={{
                                        ...isiDetail,
                                        color: '#991b1b',
                                    }}
                                >
                                    Laporan ini ditolak dan tidak diteruskan kepada Operator.
                                </p>
                            </div>
                        )}

                        {/* PESAN ERROR */}
                        {pesan && (
                            <p
                                style={{
                                    color: '#dc2626',
                                    fontSize: '12px',
                                    marginTop: '12px',
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {pesan}
                            </p>
                        )}

                        {/* TOMBOL TUTUP */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '18px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={tutupAction}
                                disabled={menyimpan}
                                style={{
                                    ...tombol,
                                    background: '#667085',
                                    opacity: menyimpan ? 0.6 : 1,
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}