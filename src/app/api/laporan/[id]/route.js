
import db from "../../../../../lib/db";

const kolomDiizinkan = {
  status: ["Dikirim", "Siap Dikerjakan", "Diproses",
    "Menunggu Verifikasi Admin", "Perlu Perbaikan", "Selesai"],
  statusKonfirmasiAdmin: ["Dikonfirmasi", "Tidak Dikonfirmasi"],
  catatanAdmin: null,
  waktuKonfirmasiAdmin: null,
  catatanOperator: null,
  waktuMintaVerifikasi: null,
  statusVerifikasiAdmin: [
    "Menunggu Verifikasi",
    "Perlu Perbaikan",
    "Selesai",
  ],
  catatanVerifikasiAdmin: null,
  waktuVerifikasiAdmin: null,
  tanggalSelesai: null,
};

const namaKolom = {
  status: "status",
  statusKonfirmasiAdmin: "status_konfirmasi_admin",
  catatanAdmin: "catatan_admin",
  waktuKonfirmasiAdmin: "waktu_konfirmasi_admin",
  catatanOperator: "catatan_operator",
  waktuMintaVerifikasi: "waktu_minta_verifikasi",
  statusVerifikasiAdmin: "status_verifikasi_admin",
  catatanVerifikasiAdmin: "catatan_verifikasi_admin",
  waktuVerifikasiAdmin: "waktu_verifikasi_admin",
  tanggalSelesai: "tanggal_selesai",
};

function formatTanggal(value) {
  if (value === null || value === "") return null;

  const tanggal = new Date(value);

  if (Number.isNaN(tanggal.getTime())) {
    throw new Error("Format tanggal tidak valid.");
  }

  return tanggal.toISOString().slice(0, 19).replace("T", " ");
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const idLaporan = Number(id);

    if (!Number.isInteger(idLaporan) || idLaporan <= 0) {
      return Response.json(
        { success: false, message: "ID laporan tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const perubahan = [];

    for (const [key, value] of Object.entries(body)) {
      if (!Object.prototype.hasOwnProperty.call(namaKolom, key)) {
        continue;
      }

      const pilihan = kolomDiizinkan[key];

      if (pilihan && !pilihan.includes(value)) {
        return Response.json(
          { success: false, message: `Nilai ${key} tidak valid.` },
          { status: 400 }
        );
      }

      let nilai = value;

      if (key.startsWith("waktu") || key.startsWith("tanggal")) {
        try {
          nilai = formatTanggal(value);
        } catch {
          return Response.json(
            { success: false, message: `Format ${key} tidak valid.` },
            { status: 400 }
          );
        }
      }

      if (
        (key === "catatanAdmin" ||
          key === "catatanOperator" ||
          key === "catatanVerifikasiAdmin") &&
        nilai !== null &&
        typeof nilai !== "string"
      ) {
        return Response.json(
          { success: false, message: `${key} harus berupa teks.` },
          { status: 400 }
        );
      }

      perubahan.push({
        kolom: namaKolom[key],
        nilai,
      });
    }

    if (perubahan.length === 0) {
      return Response.json(
        { success: false, message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const [cek] = await db.query(
      "SELECT id FROM laporan WHERE id = ?",
      [idLaporan]
    );

    if (cek.length === 0) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    const setSQL = perubahan.map((item) => `\`${item.kolom}\` = ?`).join(", ");
    const nilaiSQL = perubahan.map((item) => item.nilai);

    await db.query(
      `UPDATE laporan SET ${setSQL} WHERE id = ?`,
      [...nilaiSQL, idLaporan]
    );

    return Response.json({
      success: true,
      message: "Laporan berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui laporan:", error);

    return Response.json(
      { success: false, message: "Gagal memperbarui laporan." },
      { status: 500 }
    );
  }
}
