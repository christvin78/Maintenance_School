
import db from "../../../../lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS koneksi");

    return Response.json({
      success: true,
      message: "Koneksi MySQL berhasil!",
      data: rows,
    });
  } catch (error) {
    console.error("Tes MySQL gagal:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
