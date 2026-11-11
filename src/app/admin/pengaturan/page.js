/* ========================================
   ADMIN - PENGATURAN
======================================== */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

export default function PengaturanPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        setUsername(name || 'Admin');
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        router.push('/login');
    };

    return (
        <main className="settings-page">

            <header className="settings-header">

                <div>
                    <h1>
                        Pengaturan
                    </h1>

                    <p>
                        Kelola pengaturan sistem sebagai admin.
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            <section className="settings-content">

                <div className="settings-top">

                    <div>
                        <h2>
                            Pengaturan Sistem
                        </h2>

                        <p>
                            Selamat datang, {username}. Atur kebutuhan
                            sistem melalui menu yang tersedia.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="back-button"
                    >
                        ← Kembali ke Dashboard
                    </Link>

                </div>


                <div className="settings-grid">

                    {/* ========================================
                        PROFIL ADMIN
                    ======================================== */}

                    <div className="settings-card">

                        <div className="settings-icon">
                            👤
                        </div>

                        <div>
                            <h3>
                                Profil Admin
                            </h3>

                            <p>
                                Mengatur informasi akun dan profil
                                administrator sistem.
                            </p>
                        </div>

                        <Link
                            href="/admin/pengaturan/profil"
                            className="settings-card-button"
                        >
                            Kelola Profil
                        </Link>

                    </div>


                    {/* ========================================
                        PENGATURAN LAPORAN
                    ======================================== */}

                    <div className="settings-card">

                        <div className="settings-icon">
                            📋
                        </div>

                        <div>
                            <h3>
                                Pengaturan Laporan
                            </h3>

                            <p>
                                Mengatur kebutuhan dan pengelolaan
                                laporan yang masuk.
                            </p>
                        </div>

                        <Link
                            href="/admin/pengaturan/laporan"
                            className="settings-card-button"
                        >
                            Atur Laporan
                        </Link>

                    </div>


                    {/* ========================================
                        PENGATURAN SISTEM
                    ======================================== */}

                    <div className="settings-card">

                        <div className="settings-icon">
                            ⚙️
                        </div>

                        <div>
                            <h3>
                                Pengaturan Sistem
                            </h3>

                            <p>
                                Mengatur konfigurasi dasar sistem
                                informasi sekolah.
                            </p>
                        </div>

                        <Link
                            href="/admin/pengaturan/system"
                            className="settings-card-button"
                        >
                            Atur Sistem
                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
}