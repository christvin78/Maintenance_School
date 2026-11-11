
import db from "../../../../../lib/db";
import bcrypt from "bcryptjs";

// PUT: Edit akun Operator
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, password, status } = body;

    if (
      typeof username !== "string" ||
      !username.trim() ||
      !["Aktif", "Nonaktif"].includes(status)
    ) {
      return Response.json(
        { success: false, message: "Data akun tidak valid." },
        { status: 400 }
      );
    }

    if (
      password !== undefined &&
      password !== "" &&
      (typeof password !== "string" || password.length < 8)
    ) {
      return Response.json(
        { success: false, message: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    const [akun] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'operator'",
      [id]
    );

    if (akun.length === 0) {
      return Response.json(
        { success: false, message: "Akun Operator tidak ditemukan." },
        { status: 404 }
      );
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users
         SET nama = ?, username = ?, password = ?, status = ?
         WHERE id = ? AND role = 'operator'`,
        [username.trim(), username.trim(), passwordHash, status, id]
      );
    } else {
      await db.query(
        `UPDATE users
         SET nama = ?, username = ?, status = ?
         WHERE id = ? AND role = 'operator'`,
        [username.trim(), username.trim(), status, id]
      );
    }

    return Response.json({
      success: true,
      message: "Akun Operator berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal mengedit Operator:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Gagal mengedit Operator." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus akun Operator
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.query(
      "DELETE FROM users WHERE id = ? AND role = 'operator'",
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, message: "Akun Operator tidak ditemukan." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Akun Operator berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus Operator:", error);

    return Response.json(
      { success: false, message: "Gagal menghapus Operator." },
      { status: 500 }
    );
  }
}
