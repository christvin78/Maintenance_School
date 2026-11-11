// src/app/admin/pengaturan/profil/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

export default function ProfilAdminPage() {
    const router = useRouter();

    const [nama, setNama] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameLama, setUsernameLama] = useState('');
    const [pesan, setPesan] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const usernameLogin =
            localStorage.getItem('username');

        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        const dataAdmin =
            localStorage.getItem('dataAdmin');

        if (dataAdmin) {
            try {
                const adminList = JSON.parse(dataAdmin);

                const adminDitemukan =
                    adminList.find(
                        (item) =>
                            item.username === usernameLogin
                    );

                if (adminDitemukan) {
                    setNama(
                        adminDitemukan.nama ||
                        adminDitemukan.username
                    );

                    setUsername(
                        adminDitemukan.username
                    );

                    setPassword(
                        adminDitemukan.password
                    );

                    setUsernameLama(
                        adminDitemukan.username
                    );

                    return;
                }
            } catch (error) {
                console.error(
                    'Gagal membaca data admin:',
                    error
                );
            }
        }

        /*
         * Akun admin bawaan
         */
        if (usernameLogin === 'admin') {
            setNama('Admin');
            setUsername('admin');
            setPassword('admin123');
            setUsernameLama('admin');
        } else if (usernameLogin === 'pipin') {
            setNama('Pipin');
            setUsername('pipin');
            setPassword('pipin123');
            setUsernameLama('pipin');
        } else {
            setNama(usernameLogin || 'Admin');
            setUsername(usernameLogin || 'admin');
            setPassword('');
            setUsernameLama(usernameLogin || 'admin');
        }
    }, [router]);

    const handleSubmit = (e) => {
        e.preventDefault();

        setPesan('');

        if (!nama.trim()) {
            alert('Nama admin harus diisi.');
            return;
        }

        if (!username.trim()) {
            alert('Username harus diisi.');
            return;
        }

        if (!password.trim()) {
            alert('Password harus diisi.');
            return;
        }

        let dataAdmin = [];

        const dataTersimpan =
            localStorage.getItem('dataAdmin');

        if (dataTersimpan) {
            try {
                dataAdmin = JSON.parse(dataTersimpan);
            } catch (error) {
                console.error(
                    'Gagal membaca data admin:',
                    error
                );
            }
        }

        /*
         * Jika dataAdmin belum tersedia,
         * buat akun admin bawaan.
         */
        if (dataAdmin.length === 0) {
            dataAdmin = [
                {
                    id: 1,
                    nama: 'Admin',
                    username: 'admin',
                    password: 'admin123',
                    status: 'Aktif'
                },
                {
                    id: 2,
                    nama: 'Pipin',
                    username: 'pipin',
                    password: 'pipin123',
                    status: 'Aktif'
                }
            ];
        }

        const adminIndex =
            dataAdmin.findIndex(
                (item) =>
                    item.username === usernameLama
            );

        if (adminIndex === -1) {
            alert('Data admin tidak ditemukan.');
            return;
        }

        /*
         * Cek username agar tidak sama
         * dengan admin lainnya.
         */
        const usernameDipakai =
            dataAdmin.some(
                (item, index) =>
                    item.username === username.trim() &&
                    index !== adminIndex
            );

        if (usernameDipakai) {
            alert(
                'Username tersebut sudah digunakan admin lain.'
            );
            return;
        }

        /*
         * Update data admin
         */
        dataAdmin[adminIndex] = {
            ...dataAdmin[adminIndex],
            nama: nama.trim(),
            username: username.trim(),
            password: password.trim()
        };

        localStorage.setItem(
            'dataAdmin',
            JSON.stringify(dataAdmin)
        );

        /*
         * Update username yang sedang login
         */
        localStorage.setItem(
            'username',
            username.trim()
        );

        setNama(nama.trim());
        setUsername(username.trim());
        setPassword(password.trim());
        setUsernameLama(username.trim());

        setPesan(
            'Profil berhasil diperbarui.'
        );

        setTimeout(() => {
            setPesan('');
        }, 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        router.push('/login');
    };

    return (
        <main className="profile-page">

            {/* =========================
                HEADER
            ========================== */}

            <header className="profile-header">

                <div>
                    <h1>
                        Profil Admin
                    </h1>

                    <p>
                        Kelola informasi akun administrator.
                    </p>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            {/* =========================
                CONTENT
            ========================== */}

            <section className="profile-content">

                <div className="profile-top">

                    <div>
                        <h2>
                            Pengaturan Profil
                        </h2>

                        <p>
                            Ubah informasi akun admin sesuai
                            kebutuhan.
                        </p>
                    </div>

                    <Link
                        href="/admin/pengaturan"
                        className="back-button"
                    >
                        ← Kembali ke Pengaturan
                    </Link>

                </div>


                {/* =========================
                    PROFILE CARD
                ========================== */}

                <div className="profile-card">

                    {/* Avatar */}

                    <div className="profile-avatar">
                        👤
                    </div>


                    {/* Informasi akun */}

                    <div className="profile-account">

                        <h3>
                            {nama || 'Admin'}
                        </h3>

                        <span>
                            Administrator
                        </span>

                    </div>


                    {/* Form */}

                    <form
                        className="profile-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Nama */}

                        <div className="profile-form-group">

                            <label>
                                Nama Admin
                            </label>

                            <input
                                type="text"
                                value={nama}
                                placeholder="Masukkan nama admin"
                                onChange={(e) =>
                                    setNama(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* Username */}

                        <div className="profile-form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                placeholder="Masukkan username"
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* Password */}

                        <div className="profile-form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                placeholder="Masukkan password"
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* Pesan berhasil */}

                        {pesan && (
                            <div className="profile-success">
                                ✓ {pesan}
                            </div>
                        )}


                        {/* Button */}

                        <div className="profile-actions">

                            <Link
                                href="/admin/pengaturan"
                                className="profile-cancel"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                className="profile-save"
                            >
                                Simpan Perubahan
                            </button>

                        </div>

                    </form>

                </div>

            </section>

        </main>
    );
}