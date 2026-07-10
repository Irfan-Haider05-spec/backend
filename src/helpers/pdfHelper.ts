import PDFDocument from "pdfkit";

const pdfDoc = async (pigeons: any[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 20, size: "A4", layout: "portrait" });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Pigeon List", { align: "center" });
    doc.moveDown(1);

    // Table Headers
    const headers = [
      "Ring No",
      "Name",
      "Country",
      "BirthYear",
      "Short Info",
      "Breeder",
      "Color",
      "Pattern",
      "Father Rating",
      "Mother Rating",
      "Gender",
      "Status",
      "Location",
      "Racing Rating",
      "Notes",
      "Results",
      "Father Ring",
      "Mother Ring"
    ];

    const colWidths = [55, 60, 60, 50, 70, 60, 50, 50, 60, 60, 55, 55, 55, 60, 60, 55, 65, 65];

    let startX = doc.x;
    let y = doc.y;

    // --- Header Row ---
    let x = startX;
    headers.forEach((h, i) => {
      doc.font("Helvetica-Bold").fontSize(8).text(h, x, y, { width: colWidths[i], align: "left" });
      x += colWidths[i];
    });

    y += 15;

    // --- Data Rows ---
    pigeons.forEach((p) => {
      const row = [
        p.ringNumber,
        p.name,
        p.country,
        p.birthYear,
        p.shortInfo,
        p.breeder,
        p.color,
        p.pattern,
        p.fatherRating,
        p.motherRating,
        p.gender,
        p.status,
        p.location,
        p.racingRating,
        p.notes,
        p.results,
        p.fatherRingId?.ringNumber || p.fatherRingId || "",
        p.motherRingId?.ringNumber || p.motherRingId || ""
      ];

      let x = startX;
      row.forEach((val, i) => {
        doc.font("Helvetica").fontSize(8).text(val?.toString() || "", x, y, { width: colWidths[i], align: "left" });
        x += colWidths[i];
      });

      y += 15;

      // --- Page break handling ---
      if (y > 750) {
        doc.addPage();
        y = doc.y;
      }
    });

    doc.end();
  });
};

export default pdfDoc;
