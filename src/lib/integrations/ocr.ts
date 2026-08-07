// OCR integration stub (Phase 5b).
//
// TODO: integration — wire Google Document AI or Tesseract for the
// full-text PDF search that replaces searching Google Drive by filename.

export type OcrResult = {
  text: string;
  page_count: number;
  language?: string;
};

export async function ocrPdf(_file: File): Promise<OcrResult> {
  return { text: '', page_count: 0 };
}
