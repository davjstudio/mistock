import {exportCsv, exportMovementsCsv} from './api.js?v=1.5';
export function generalCsv(products, movements) {
  return '\ufeffINVENTARIO\r\n' + exportCsv(products).replace(/^\ufeff/, '') +
    '\r\n\r\nMOVIMIENTOS\r\n' + exportMovementsCsv(movements).replace(/^\ufeff/, '');
}

// Standard PDF text with a WinAnsi font, pagination and byte-accurate cross references.
export function reportPdf(products, movements, generated = new Date()) {
  const lines = ['MISTOCK - REPORTE GENERAL', 'Generado: ' + generated.toLocaleString('es-PE'),
    'Productos: ' + products.length + ' | Movimientos: ' + movements.length, '', 'INVENTARIO'];
  products.forEach(p => lines.push(p.code + ' | ' + p.name + ' | ' + p.category,
    'Stock: ' + p.stock + ' | Mínimo: ' + p.minStock + ' | Precio S/ ' + p.price.toFixed(2), p.description || ''));
  lines.push('', 'MOVIMIENTOS');
  [...movements].sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach(m => lines.push(
    (m.date ? new Date(m.date).toLocaleString('es-PE') : 'Sin fecha') + ' | ' + m.productName,
    (m.type === 'out' ? 'Salida' : 'Entrada') + ' | Cantidad: ' + m.quantity, m.note || ''));
  const wrapped = lines.flatMap(text => {
    const clean = String(text).replace(/[\r\n\t]+/g, ' ');
    const rows = [];
    let remainder = clean;
    while (remainder.length > 52) {
      const space = remainder.lastIndexOf(' ', 52);
      const cut = space > 20 ? space : 52;
      rows.push(remainder.slice(0, cut));
      remainder = remainder.slice(cut).trimStart();
    }
    rows.push(remainder);
    return rows;
  });
  const escape = text => String(text).replace(/[^\x20-\x7e\xa0-\xff]/g, '?').replace(/([\\()])/g, '\\$1');
  const pages = [];
  for (let index = 0; index < wrapped.length; index += 44) pages.push(wrapped.slice(index, index + 44));
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'];
  const refs = [];
  for (const [index, rows] of pages.entries()) {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    refs.push(pageId + ' 0 R');
    const body = 'BT /F1 10 Tf 0.04 0.12 0.42 rg 42 792 Td 16 TL\n' +
      rows.map(row => '(' + escape(row) + ') Tj T*').join('\n') +
      '\nET\nBT /F1 9 Tf 42 32 Td (MiStock | Página ' + (index + 1) + ' de ' + pages.length + ') Tj ET';
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + contentId + ' 0 R >>');
    objects.push('<< /Length ' + body.length + ' >>\nstream\n' + body + '\nendstream');
  }
  objects[1] = '<< /Type /Pages /Count ' + pages.length + ' /Kids [' + refs.join(' ') + '] >>';
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n';
  });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + offsets.length + '\n0000000000 65535 f \n' +
    offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('') +
    'trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  return Uint8Array.from(pdf, character => character.charCodeAt(0));
}
