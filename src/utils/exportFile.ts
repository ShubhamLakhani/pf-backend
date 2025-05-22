import { Response } from 'express';
import { parse } from 'json2csv'; // For CSV export
import PDFDocument from 'pdfkit'; // For PDF export


/**
 * Allowed file types for export.
 */
export type FileType = 'csv' | 'pdf';

/**
 * Generate the CSV or PDF file based on fileType.
 */
const generateExportFile = async (data: any[], fileType: FileType, res: Response) => {
  try {
    if (fileType === 'csv') {
      // CSV Export
      const csv = parse(data); // Convert the data into CSV format
      res.header('Content-Type', 'text/csv');
      res.attachment('data.csv'); // Specify the filename
      return res.send(csv); // Send the CSV file directly
    } else if (fileType === 'pdf') {
      // PDF Export
      const doc = new PDFDocument();

      // Collect the PDF as a buffer stream
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers)); // Push the chunks of PDF data to buffers array
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers); // Concatenate the PDF chunks
        res.header('Content-Type', 'application/pdf');
        res.attachment('data.pdf');
        res.send(pdfData); // Send the generated PDF to the client
      });

      // Create PDF content
      doc.fontSize(18).text('Booking List', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Booking ID | Pet Name | Service Name | User Name | Start Date | End Date');
      doc.moveDown();

      // Add each row to the PDF document
      data.forEach((item) => {
        doc.text(
          `${item._id} | ${item.petName} | ${item.serviceName} | ${item.userName} | ${item.startDateTime} | ${item.endDateTime}`
        );
      });

      doc.end(); // End the document and finalize the content
    } else {
      throw new Error('Invalid file type. Use "csv" or "pdf".');
    }
  } catch (error) {
    console.error('Error generating export file:', error);
    res.status(500).send('Error exporting file'); // Send an error response if something goes wrong
  }
};

export { generateExportFile };
