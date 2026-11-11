'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                setError(
                    hasil.message ||
                    'Username atau password salah, atau akun nonaktif.'
                );
                return;
            }

            const akun = hasil.user;

            // Simpan informasi akun yang berhasil login
            localStorage.setItem('role', akun.role);
            localStorage.setItem('username', akun.username);

            if (akun.role === 'guru') {
                localStorage.setItem(
                    'namaGuru',
                    akun.nama || akun.username
                );

                localStorage.setItem('userId', String(akun.id));

                router.push('/guru');
                return;
            }

            if (akun.role === 'operator') {
                localStorage.setItem('userId', String(akun.id));
                router.push('/operator');
                return;
            }

            if (akun.role === 'admin') {
                localStorage.setItem('userId', String(akun.id));
                router.push('/admin');
                return;
            }

            setError('Role akun tidak dikenali.');
        } catch (error) {
            console.error('Login gagal:', error);
            setError(
                'Tidak dapat terhubung ke server. Periksa API login.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Login</h1>
                    <p>Sistem Informasi Sekolah Tri Ratna</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Memeriksa...' : 'Login'}
                    </button>
                </form>

                <div className="login-info">
                    <p>Informasi Login</p>
                    <small>
                        Admin: gunakan akun yang tersimpan di database
                    </small>
                    <small>
                        Guru: gunakan akun aktif yang dibuat Admin
                    </small>
                    <small>
                        Operator: gunakan akun aktif yang tersimpan di database
                    </small>
                </div>
            </div>
        </main>
    );
}