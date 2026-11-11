
import db from "../../../../lib/db";
import bcrypt from "bcryptjs";

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
        {
          success: false,
          message: "Username dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT id, nama, username, password, role, status
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username.trim()]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Username atau password salah, atau akun nonaktif.",
        },
        { status: 401 }
      );
    }

    const akun = rows[0];

    if (akun.status !== "Aktif") {
      return Response.json(
        {
          success: false,
          message: "Username atau password salah, atau akun nonaktif.",
        },
        { status: 401 }
      );
    }

    const passwordCocok = await bcrypt.compare(
      password,
      akun.password
    );

    if (!passwordCocok) {
      return Response.json(
        {
          success: false,
          message: "Username atau password salah, atau akun nonaktif.",
        },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: akun.id,
        nama: akun.nama,
        username: akun.username,
        role: akun.role,
      },
    });
  } catch (error) {
    console.error("Login gagal:", error);

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server saat login.",
      },
      { status: 500 }
    );
  }
}
