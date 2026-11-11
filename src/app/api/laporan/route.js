
import db from "../../../../lib/db";

function formatLaporan(row) {
  let foto = null;

  if (row.foto) {
    foto = Buffer.isBuffer(row.foto)
      ? row.foto.toString("utf8")
      : row.foto;
  }

  return {
    id: row.id,
    userId: row.user_id,
    nama: row.nama_pelapor,
    usernamePemilik: row.username_pemilik || row.nama_pelapor,
    kategori: row.kategori,
    lokasi: row.lokasi,
    deskripsi: row.deskripsi,
    foto,
    status: row.status,
    statusKonfirmasiAdmin: row.status_konfirmasi_admin,
    catatanAdmin: row.catatan_admin || "",
    waktuKonfirmasiAdmin: row.waktu_konfirmasi_admin,
    catatanOperator: row.catatan_operator || "",
    waktuMintaVerifikasi: row.waktu_minta_verifikasi,
    statusVerifikasiAdmin: row.status_verifikasi_admin,
    catatanVerifikasiAdmin: row.catatan_verifikasi_admin || "",
    waktuVerifikasiAdmin: row.waktu_verifikasi_admin,
    tanggalKirim: row.tanggal_kirim,
    tanggalSelesai: row.tanggal_selesai,
  };
}

// GET: Ambil semua laporan atau laporan milik satu Guru
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    let rows;

    if (username) {
      [rows] = await db.query(
        `SELECT l.*, u.username AS username_pemilik
         FROM laporan l
         LEFT JOIN users u ON l.user_id = u.id
         WHERE u.username = ? OR
               (l.user_id IS NULL AND l.nama_pelapor = ?)
         ORDER BY l.id DESC`,
        [username, username]
      );
    } else {
      [rows] = await db.query(
        `SELECT l.*, u.username AS username_pemilik
         FROM laporan l
         LEFT JOIN users u ON l.user_id = u.id
         ORDER BY l.id DESC`
      );
    }

    return Response.json({
      success: true,
      data: rows.map(formatLaporan),
    });
  } catch (error) {
    console.error("Gagal mengambil laporan:", error);

    return Response.json(
      { success: false, message: "Gagal mengambil data laporan." },
      { status: 500 }
    );
  }
}

// POST: Simpan laporan baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, kategori, lokasi, deskripsi, foto } = body;

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof kategori !== "string" ||
      !kategori.trim() ||
      typeof lokasi !== "string" ||
      !lokasi.trim() ||
      typeof deskripsi !== "string" ||
      !deskripsi.trim()
    ) {
      return Response.json(
        { success: false, message: "Semua informasi wajib diisi." },
        { status: 400 }
      );
    }

    let fotoBuffer = null;

    if (foto) {
      if (
        typeof foto !== "string" ||
        !/^data:image\/(png|jpeg);base64,/.test(foto)
      ) {
        return Response.json(
          { success: false, message: "Format foto harus JPG, JPEG, atau PNG." },
          { status: 400 }
        );
      }

      const base64 = foto.split(",")[1];
      fotoBuffer = Buffer.from(base64, "base64");

      if (fotoBuffer.length > 5 * 1024 * 1024) {
        return Response.json(
          { success: false, message: "Ukuran foto maksimal 5 MB." },
          { status: 400 }
        );
      }

      // Simpan data URL supaya format gambar tetap dapat ditampilkan.
      fotoBuffer = Buffer.from(foto, "utf8");
    }

    const [users] = await db.query(
      `SELECT id, nama, username
       FROM users
       WHERE username = ? AND role = 'guru' AND status = 'Aktif'
       LIMIT 1`,
      [username.trim()]
    );

    if (users.length === 0) {
      return Response.json(
        { success: false, message: "Akun Guru tidak ditemukan atau tidak aktif." },
        { status: 404 }
      );
    }

    const user = users[0];

    const [result] = await db.query(
      `INSERT INTO laporan
       (user_id, nama_pelapor, kategori, lokasi, deskripsi, foto, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Dikirim')`,
      [
        user.id,
        user.username,
        kategori.trim(),
        lokasi.trim(),
        deskripsi.trim(),
        fotoBuffer,
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Laporan berhasil dikirim!",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menyimpan laporan:", error);

    return Response.json(
      { success: false, message: "Laporan gagal disimpan." },
      { status: 500 }
    );
  }
}
