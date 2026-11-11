
import db from "../../../../lib/db";
import bcrypt from "bcryptjs";

// GET: Mengambil semua akun Operator
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, nama, username, role, status, tanggal_dibuat
       FROM users
       WHERE role = 'operator'
       ORDER BY id DESC`
    );

    return Response.json({
      success: true,
      data: rows,
      totalAkun: rows.length,
    });
  } catch (error) {
    console.error("Gagal mengambil Operator:", error);

    return Response.json(
      { success: false, message: "Gagal mengambil data Operator." },
      { status: 500 }
    );
  }
}

// POST: Menambahkan akun Operator
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return Response.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (nama, username, password, role, status)
       VALUES (?, ?, ?, 'operator', 'Aktif')`,
      [username.trim(), username.trim(), passwordHash]
    );

    return Response.json(
      {
        success: true,
        message: "Akun Operator berhasil ditambahkan.",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan Operator:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Gagal menambahkan Operator." },
      { status: 500 }
    );
  }
}
