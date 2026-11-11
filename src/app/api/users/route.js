
import db from "../../../../lib/db";
import bcrypt from "bcryptjs";

// GET: Mengambil semua data akun
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        nama,
        username,
        role,
        status,
        tanggal_dibuat,
        foto_profil,
        dibuat_oleh
       FROM users
       ORDER BY id DESC`
    );

    return Response.json({
      success: true,
      message: "Data akun berhasil diambil!",
      totalAkun: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Gagal mengambil data akun:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data akun.",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan akun baru
export async function POST(request) {
  try {
    const body = await request.json();

    const { nama, username, password, role, status, dibuatOleh } = body;

    if (
      typeof nama !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      !nama.trim() ||
      !username.trim() ||
      !password
    ) {
      return Response.json(
        {
          success: false,
          message: "Nama, username, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!["admin", "operator", "guru"].includes(role)) {
      return Response.json(
        {
          success: false,
          message: "Role tidak valid.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    // Validasi status
    const statusAkun = status || "Aktif";

    if (!["Aktif", "Nonaktif"].includes(statusAkun)) {
      return Response.json(
        {
          success: false,
          message: "Status akun tidak valid.",
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan ID admin yang membuat akun
    const idPembuat =
      Number.isInteger(Number(dibuatOleh)) &&
      Number(dibuatOleh) > 0
        ? Number(dibuatOleh)
        : null;

    const [result] = await db.query(
      `INSERT INTO users
        (nama, username, password, role, status, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nama.trim(),
        username.trim(),
        passwordHash,
        role,
        statusAkun,
        idPembuat,
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Akun berhasil ditambahkan!",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan akun:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        {
          success: false,
          message: "Username sudah digunakan.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menambahkan akun.",
      },
      { status: 500 }
    );
  }
}
