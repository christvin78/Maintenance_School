
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './style.css';

export default function GuruPage() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // CEK LOGIN GURU
  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role !== 'guru') {
      router.replace('/login');
      return;
    }

    setIsChecking(false);
  }, [router]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('namaGuru');
    localStorage.removeItem('userId');

    router.replace('/login');
  };

  // MENU MOBILE
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // LOADING
  if (isChecking) {
    return (
      <div className="guru-loading">
        <div className="loading-spinner"></div>
        <p>Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <Link
          href="/guru"
          className="brand"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="brand-logo-wrapper">
            <img
              src="/logo.jpg"
              alt="Logo Tri Ratna"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="brand-text">
            <strong>TRI RATNA</strong>
            <span>Sistem Informasi Sekolah</span>
          </div>
        </Link>

        <nav className={`nav-menu ${isMenuOpen ? 'show' : ''}`}>
          <Link
            href="/guru"
            className="active"
            onClick={() => setIsMenuOpen(false)}
          >
            Beranda
          </Link>

          <Link
            href="#"
            onClick={() => setIsMenuOpen(false)}
          >
            Jadwal
          </Link>

          <Link
            href="/laporan"
            onClick={() => setIsMenuOpen(false)}
          >
            Laporan
          </Link>

          <Link
            href="/guru/profile"
            onClick={() => setIsMenuOpen(false)}
          >
            Profil
          </Link>

          <button
            type="button"
            className="login-nav"
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          className="menu-button"
          onClick={toggleMenu}
          aria-label="Buka menu"
        >
          ☰
        </button>
      </header>

      {/* HERO */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label">
              SISTEM INFORMASI SEKOLAH
            </div>

            <h1>
              Sekolah Lebih
              <span>Terhubung.</span>
            </h1>

            <p>
              Akses informasi sekolah dengan lebih mudah
              melalui satu platform digital untuk siswa,
              guru, dan seluruh warga Sekolah Tri Ratna.
            </p>

            <div className="hero-buttons">
              <Link href="#" className="btn btn-primary">
                Lihat Jadwal
                <span>→</span>
              </Link>

              <Link
                href="/laporan"
                className="btn btn-secondary"
              >
                Buat Laporan
              </Link>
            </div>
          </div>

          {/* FOTO SEKOLAH */}
          <div className="hero-image">
            <div
              className="image-wrapper"
              style={{
                overflow: 'hidden',
                borderRadius: '16px',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src="/gedung.jpg"
                alt="Gedung Sekolah Tri Ratna"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  maxHeight: '400px',
                }}
              />
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="stats">
          <div className="stat-item">
            <strong>01</strong>
            <span>Sistem Terintegrasi</span>
          </div>

          <div className="stat-item">
            <strong>24/7</strong>
            <span>Akses Informasi</span>
          </div>

          <div className="stat-item">
            <strong>3</strong>
            <span>Jenis Pengguna</span>
          </div>
        </section>

        {/* FITUR UTAMA */}
        <section className="services section">
          <div className="section-heading">
            <div>
              <div className="mini-label">FITUR UTAMA</div>
              <h2>Semua dalam satu tempat.</h2>
            </div>

            <p>
              Berbagai fitur untuk membantu aktivitas
              warga Sekolah Tri Ratna.
            </p>
          </div>

          <div className="service-grid">
            {/* JADWAL */}
            <Link href="#" className="service-card">
              <div className="service-icon blue">📅</div>
              <div className="service-number">01</div>

              <h3>Jadwal Pelajaran</h3>

              <p>
                Melihat jadwal pelajaran berdasarkan
                kelas dan informasi lainnya.
              </p>

              <span className="service-link">
                Lihat jadwal →
              </span>
            </Link>

            {/* LAPORAN */}
            <Link
              href="/laporan"
              className="service-card featured"
            >
              <div className="service-icon orange">📢</div>
              <div className="service-number">02</div>

              <h3>Laporan Sekolah</h3>

              <p>
                Sampaikan laporan mengenai masalah
                yang ditemukan di lingkungan sekolah.
              </p>

              <span className="service-link">
                Buat laporan →
              </span>
            </Link>

            {/* PROFIL SEKOLAH */}
            <Link href="#" className="service-card">
              <div className="service-icon green">🏫</div>
              <div className="service-number">03</div>

              <h3>Profil Sekolah</h3>

              <p>
                Informasi mengenai Sekolah Tri Ratna
                dan lingkungan sekolah.
              </p>

              <span className="service-link">
                Lihat profil →
              </span>
            </Link>
          </div>
        </section>

        {/* AJAKAN MEMBUAT LAPORAN */}
        <section className="report-cta section">
          <div className="report-cta-content">
            <div className="mini-label">LAPORAN SEKOLAH</div>

            <h2>
              Menemukan masalah
              <br />
              di lingkungan sekolah?
            </h2>

            <p>
              Sampaikan laporan kepada pihak pengelola
              agar dapat segera ditindaklanjuti.
            </p>

            <Link href="/laporan" className="btn btn-white">
              Buat Laporan
              <span>→</span>
            </Link>
          </div>

          <div className="report-decoration">
            <div className="decoration-circle circle-one"></div>
            <div className="decoration-circle circle-two"></div>
            <div className="report-icon">📢</div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <img
              src="/logo.jpg"
              alt="Logo Tri Ratna"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
              }}
            />

            <div>
              <strong>TRI RATNA</strong>
              <p>Sistem Informasi Sekolah</p>
            </div>
          </div>

          <p className="copyright">
            © 2026 Sekolah Tri Ratna. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
