// src/app/admin/layout.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import './style.css';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const [username, setUsername] = useState('');

    // ========================================
    // CEK LOGIN
    // ========================================

    useEffect(() => {
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        setUsername(name || 'Admin');
    }, [router]);

    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        router.push('/login');
    };

    // ========================================
    // MENU AKTIF
    // ========================================

    const menuAktif = (path) => {
        if (path === '/admin') {
            return pathname === '/admin';
        }

        return pathname.startsWith(path);
    };

    return (
        <main className="admin-page">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                {/* LOGO */}

                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        TR
                    </div>

                    <div>
                        <h2>Tri Ratna</h2>
                        <span>Admin Panel</span>
                    </div>
                </div>

                {/* MENU */}

                <nav className="sidebar-menu">

                    <p className="sidebar-menu-title">
                        MENU UTAMA
                    </p>

                    {/* DASHBOARD */}

                    <Link
                        href="/admin"
                        className={`sidebar-link ${
                            menuAktif('/admin') ? 'active' : ''
                        }`}
                    >
                        <span className="sidebar-link-icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>

                    {/* DATA LAPORAN */}

                    <Link
                        href="/admin/laporan"
                        className={`sidebar-link ${
                            menuAktif('/admin/laporan') ? 'active' : ''
                        }`}
                    >
                        <span className="sidebar-link-icon">📋</span>
                        <span>Data Laporan</span>
                    </Link>

                    {/* DATA OPERATOR */}

                    <Link
                        href="/admin/operator"
                        className={`sidebar-link ${
                            menuAktif('/admin/operator') ? 'active' : ''
                        }`}
                    >
                        <span className="sidebar-link-icon">👨‍💼</span>
                        <span>Data Operator</span>
                    </Link>

                    {/* DATA GURU */}

                    <Link
                        href="/admin/guru"
                        className={`sidebar-link ${
                            menuAktif('/admin/guru') ? 'active' : ''
                        }`}
                    >
                        <span className="sidebar-link-icon">👨‍🏫</span>
                        <span>Data Guru</span>
                    </Link>

                    {/* PENGATURAN */}

                    <p className="sidebar-menu-title sidebar-menu-settings">
                        PENGATURAN
                    </p>

                    <Link
                        href="/admin/pengaturan"
                        className={`sidebar-link ${
                            menuAktif('/admin/pengaturan') ? 'active' : ''
                        }`}
                    >
                        <span className="sidebar-link-icon">⚙️</span>
                        <span>Pengaturan</span>
                    </Link>

                </nav>

                {/* USER + LOGOUT */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="sidebar-user-avatar">
                            👤
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{username}</strong>
                            <span>Administrator</span>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* AREA KONTEN */}

            <section className="admin-main">
                {children}
            </section>

        </main>
    );
}