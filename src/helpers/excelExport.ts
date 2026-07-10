import ExcelJS from "exceljs";

/* ===========================
   Types
=========================== */

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelOptions {
  sheetName: string;
  columns: ExcelColumn[];
  rows: Record<string, any>[];
  fileName?: string; // optional
}

/* ===========================
   Helper Function
=========================== */

export const generateExcelBuffer = async (
  options: ExcelOptions
): Promise<Buffer> => {
  const { sheetName, columns, rows } = options;

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "The Pigeon Hub";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  /* ---------- Columns ---------- */
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  /* ---------- Rows ---------- */
  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  /* ---------- Header Styling ---------- */
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  /* ---------- Data Row Styling ---------- */
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  /* ---------- Auto Filter ---------- */
  worksheet.autoFilter = {
    from: "A1",
    to: `${String.fromCharCode(64 + columns.length)}1`,
  };

  /* ---------- Generate Buffer ---------- */
  const arrayBuffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(arrayBuffer as ArrayBuffer);
};
