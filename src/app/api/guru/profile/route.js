import db from "../../../../../lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// GET: Mengambil profil guru
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json(
        { success: false, message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT
        g.id,
        g.nama,
        g.username,
        g.tanggal_dibuat,
        g.foto_profil,
        g.foto_profil_mime,
        a.nama AS nama_pembuat
      FROM users g
      LEFT JOIN users a ON g.dibuat_oleh = a.id
      WHERE g.username = ? AND g.role = 'guru'
      LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return Response.json(
        { success: false, message: "Profil guru tidak ditemukan." },
        { status: 404 }
      );
    }

    const guru = rows[0];

    return Response.json({
      success: true,
      data: {
        id: guru.id,
        nama: guru.nama,
        username: guru.username,
        tanggal_dibuat: guru.tanggal_dibuat,
        foto_profil: guru.foto_profil
          ? `data:${guru.foto_profil_mime || "image/jpeg"};base64,${Buffer.from(
              guru.foto_profil
            ).toString("base64")}`
          : null,
        nama_pembuat: guru.nama_pembuat || null,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil profil:", error);

    return Response.json(
      { success: false, message: "Gagal mengambil profil guru." },
      { status: 500 }
    );
  }
}

// PUT: Mengubah profil atau password guru
export async function PUT(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // GANTI PASSWORD
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const {
        action,
        username,
        passwordLama,
        passwordBaru,
        konfirmasiPassword,
      } = body;

      if (
        action !== "gantiPassword" ||
        !username ||
        !passwordLama ||
        !passwordBaru ||
        !konfirmasiPassword
      ) {
        return Response.json(
          { success: false, message: "Semua kolom password wajib diisi." },
          { status: 400 }
        );
      }

      if (passwordBaru.length < 8) {
        return Response.json(
          { success: false, message: "Password baru minimal 8 karakter." },
          { status: 400 }
        );
      }

      if (passwordBaru !== konfirmasiPassword) {
        return Response.json(
          { success: false, message: "Konfirmasi password tidak cocok." },
          { status: 400 }
        );
      }

      const [rows] = await db.query(
        `SELECT id, password
         FROM users
         WHERE username = ? AND role = 'guru'
         LIMIT 1`,
        [username]
      );

      if (!rows.length) {
        return Response.json(
          { success: false, message: "Akun guru tidak ditemukan." },
          { status: 404 }
        );
      }

      const cocok = await bcrypt.compare(
        passwordLama,
        rows[0].password
      );

      if (!cocok) {
        return Response.json(
          { success: false, message: "Password lama salah." },
          { status: 400 }
        );
      }

      const hashBaru = await bcrypt.hash(passwordBaru, 10);

      await db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashBaru, rows[0].id]
      );

      return Response.json({
        success: true,
        message: "Password berhasil diubah.",
      });
    }

    // GANTI NAMA DAN FOTO PROFIL
    const formData = await request.formData();
    const username = formData.get("username");
    const nama = formData.get("nama");
    const foto = formData.get("foto");

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof nama !== "string" ||
      !nama.trim()
    ) {
      return Response.json(
        { success: false, message: "Nama wajib diisi." },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT id FROM users
       WHERE username = ? AND role = 'guru'
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return Response.json(
        { success: false, message: "Akun guru tidak ditemukan." },
        { status: 404 }
      );
    }

    const id = rows[0].id;

    if (foto && typeof foto !== "string" && foto.size > 0) {
      if (!foto.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "File harus berupa gambar." },
          { status: 400 }
        );
      }

      if (foto.size > 3 * 1024 * 1024) {
        return Response.json(
          { success: false, message: "Ukuran foto maksimal 3 MB." },
          { status: 400 }
        );
      }

      const bufferFoto = Buffer.from(await foto.arrayBuffer());

      await db.query(
        `UPDATE users
         SET nama = ?, foto_profil = ?, foto_profil_mime = ?
         WHERE id = ?`,
        [nama.trim(), bufferFoto, foto.type, id]
      );
    } else {
      await db.query(
        "UPDATE users SET nama = ? WHERE id = ?",
        [nama.trim(), id]
      );
    }

    return Response.json({
      success: true,
      message: "Profil berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);

    return Response.json(
      { success: false, message: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}