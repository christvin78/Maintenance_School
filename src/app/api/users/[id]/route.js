
import db from "../../../../../lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, username, password, status } = body;

    if (
      typeof nama !== "string" ||
      typeof username !== "string" ||
      !nama.trim() ||
      !username.trim()
    ) {
      return Response.json(
        { success: false, message: "Nama dan username wajib diisi." },
        { status: 400 }
      );
    }

    if (!["Aktif", "Nonaktif"].includes(status)) {
      return Response.json(
        { success: false, message: "Status akun tidak valid." },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
      return Response.json(
        { success: false, message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const [akun] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'guru'",
      [id]
    );

    if (akun.length === 0) {
      return Response.json(
        { success: false, message: "Akun Guru tidak ditemukan." },
        { status: 404 }
      );
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users
         SET nama = ?, username = ?, password = ?, status = ?
         WHERE id = ? AND role = 'guru'`,
        [nama.trim(), username.trim(), passwordHash, status, id]
      );
    } else {
      await db.query(
        `UPDATE users
         SET nama = ?, username = ?, status = ?
         WHERE id = ? AND role = 'guru'`,
        [nama.trim(), username.trim(), status, id]
      );
    }

    return Response.json({
      success: true,
      message: "Akun Guru berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui akun Guru:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Gagal memperbarui akun Guru." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.query(
      "DELETE FROM users WHERE id = ? AND role = 'guru'",
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, message: "Akun Guru tidak ditemukan." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Akun Guru berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus akun Guru:", error);

    return Response.json(
      { success: false, message: "Gagal menghapus akun Guru." },
      { status: 500 }
    );
  }
}
