// const PDFDocument = require("pdfkit");

// function generateInvoicePDF({
//   invoiceNumber,
//   date,
//   buyerName,
//   vendorName,
//   listingTitle,
//   askingPrice,
//   commission,
//   displayPrice,
// }) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 50 });
//     const chunks = [];

//     doc.on("data", (chunk) => chunks.push(chunk));
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//     doc.on("error", reject);

//     doc.fontSize(20).text("C2C Vehicles — Invoice", { align: "center" });
//     doc.moveDown();

//     doc.fontSize(11);
//     doc.text(`Invoice Number: ${invoiceNumber}`);
//     doc.text(`Date: ${date}`);
//     doc.moveDown();

//     doc.text(`Buyer: ${buyerName}`);
//     doc.text(`Vendor: ${vendorName}`);
//     doc.moveDown();

//     doc.text(`Vehicle: ${listingTitle}`);
//     doc.moveDown();

//     doc.text(`Asking Price: $${(askingPrice / 100).toFixed(2)}`);
//     doc.text(`Platform Commission: $${(commission / 100).toFixed(2)}`);
//     doc.text(`Total Paid by Buyer: $${(displayPrice / 100).toFixed(2)}`);
//     doc.moveDown();

//     doc.fontSize(9).fillColor("gray").text(
//       "This is a system-generated invoice for a peer-to-peer vehicle transaction.",
//       { align: "center" }
//     );

//     doc.end();
//   });
// }

// module.exports = { generateInvoicePDF };


//new version of invoice pdf generator
const PDFDocument = require("pdfkit");

function generateInvoicePDF({
  invoiceNumber,
  date,
  buyerName,
  vendorName,
  listingTitle,
  askingPrice,
  commission,
  displayPrice,
  email,
  phone,
  address,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const green = "#7AA33D";

    // =====================================================
    // HEADER
    // =====================================================

    doc
      .fontSize(18)
      .fillColor(green)
      .text("C2C VEHICLES", 40, 40);

    doc
      .fontSize(32)
      .fillColor(green)
      .text("INVOICE", 360, 35);

    doc
      .fontSize(10)
      .fillColor("black")
      .text("Company Address", 40, 70)
      .text("City, State, Zip", 40, 84)
      .text("Phone Number", 40, 98)
      .text("support@c2cvehicles.com", 40, 112);

    doc
      .fontSize(11)
      .text(`Invoice No : ${invoiceNumber}`, 360, 90)
      .text(`Date : ${date}`, 360, 108);

    // =====================================================
    // BILL TO / SELLER
    // =====================================================

    let y = 155;

    doc.rect(40, y, 250, 22).fill(green);
    doc.rect(305, y, 250, 22).fill(green);

    doc
      .fillColor("white")
      .fontSize(11)
      .text("BILL TO", 50, y + 5);

    doc.text("SELLER", 315, y + 5);

    y += 25;

    doc.fillColor("black");

    doc.rect(40, y, 250, 90).stroke();
    doc.rect(305, y, 250, 90).stroke();

    doc
      .fontSize(10)
      .text(`Buyer : ${buyerName}`, 50, y + 10)
      .text(`Phone:${phone}`, 50, y + 28)
      // .text("Phone : -", 50, y + 46)
      .text(`Email:${email}`, 50, y + 64);

    doc
      .text(`Vendor : ${vendorName}`, 315, y + 10)
      .text(`Address:${address}`, 315, y + 28)
      .text(`Phone:${phone}`, 315, y + 46)
      .text(`Email:${email}`, 315, y + 64);

    // =====================================================
    // TABLE HEADER
    // =====================================================

    y += 120;

    const tableX = 40;

    doc.rect(tableX, y, 515, 24).fill(green);

    doc
      .fillColor("white")
      .fontSize(11)
      .text("QTY", 50, y + 7)
      .text("DESCRIPTION", 110, y + 7)
      .text("UNIT COST", 350, y + 7)
      .text("TOTAL", 470, y + 7);

    // =====================================================
    // TABLE ROW
    // =====================================================

    y += 24;

    doc.fillColor("black");

    doc.rect(tableX, y, 515, 40).stroke();

    doc.text("1", 55, y + 12);

    doc.text(listingTitle, 110, y + 12, {
      width: 220,
    });

    doc.text(`$${(askingPrice / 100).toFixed(2)}`, 350, y + 12);

    doc.text(`$${(askingPrice / 100).toFixed(2)}`, 470, y + 12);

    // Vertical Lines

    doc.moveTo(90, y).lineTo(90, y + 40).stroke();

    doc.moveTo(340, y).lineTo(340, y + 40).stroke();

    doc.moveTo(455, y).lineTo(455, y + 40).stroke();

    // =====================================================
    // PAYMENT SUMMARY
    // =====================================================

    y += 70;

    const summaryX = 340;

    doc
      .fontSize(11)
      .text("Subtotal", summaryX, y)
      .text(`$${(askingPrice / 100).toFixed(2)}`, 470, y);

    y += 22;

    doc
      .text("Platform Fee", summaryX, y)
      .text(`$${(commission / 100).toFixed(2)}`, 470, y);

    y += 22;

    doc
      .text("Tax", summaryX, y)
      .text("$0.00", 470, y);

    y += 22;

    doc.moveTo(summaryX, y).lineTo(540, y).stroke();

    y += 10;

    doc
      .font("Helvetica-Bold")
      .text("TOTAL", summaryX, y)
      .text(`$${(displayPrice / 100).toFixed(2)}`, 470, y);

    doc.font("Helvetica");

    // =====================================================
    // THANK YOU
    // =====================================================

    y += 80;

    doc
      .fontSize(24)
      .fillColor(green)
      .text("Thank You!", 40, y);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "This invoice was automatically generated after a successful vehicle purchase.",
        40,
        y + 35
      );

    // =====================================================
    // FOOTER
    // =====================================================

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(
        "C2C Vehicles • support@c2cvehicles.com • www.c2cvehicles.com",
        40,
        pageWidth > 500 ? 770 : 760,
        {
          align: "center",
        }
      );

    doc.end();
  });
}

module.exports = { generateInvoicePDF };