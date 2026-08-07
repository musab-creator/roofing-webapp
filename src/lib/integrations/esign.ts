// E-signature integration stub (Phase 3 / 5b).
//
// TODO: integration — pick vendor (Dropbox Sign, DocuSign, SignWell),
// wire webhook callbacks so the CRM moves the lead to "Contingency
// Signed" automatically.

export type SignatureRequest = {
  id: string;
  status: 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
  signing_url: string;
  signed_pdf_url?: string;
};

export async function requestSignature(
  _templateId: string,
  _signer: { name: string; email: string },
  _mergeFields: Record<string, string>
): Promise<SignatureRequest> {
  return {
    id: `stub-${Date.now()}`,
    status: 'sent',
    signing_url: 'about:blank'
  };
}
