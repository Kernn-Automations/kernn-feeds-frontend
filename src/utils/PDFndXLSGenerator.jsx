import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx"; // <-- THIS is important
import { saveAs } from "file-saver";
export const handleExportPDF = (columns, data, title) => {
  if (data.length > 0) {
    console.log(data);
    const doc = new jsPDF();

    doc.text(title, 10, 10);

    autoTable(doc, {
      headStyles: {
        fillColor: [0, 49, 118], // Blue
        //  Header background
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Black text
        fontSize: 10,
      },
      head: [columns], // Header row
      body: data.map((row) => columns.map((col) => row[col])),
      startY: 20,
    });

    doc.save(`${title}.pdf`);
  }
};

export const handleExportExcel = (columns, data, title) => {
  if (data.length > 0) {
    console.log(data);
    const worksheetData = [
      columns,
      ...data.map((row) => columns.map((col) => row[col])),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, `${title}.xlsx`);
  }
};
