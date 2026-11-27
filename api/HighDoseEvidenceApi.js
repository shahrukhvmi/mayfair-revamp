import Fetcher from "@/library/Fetcher";

// High dose evidence is uploaded on the dosage page, before an order exists.
// The returned upload_token is kept on the cart item and goes to
// order/consultationMayfair with the items.

// POST /api/order/dosage-document/pending — FormData: item_id, evidence
// Response: { status, pending_evidence: { upload_token, item_id, name,
// mime_type, size, expires_at }, message }
export const uploadPendingDosageDocument = async (data) => {
  return Fetcher.post("order/dosage-document/pending", data);
};

// DELETE /api/order/dosage-document/pending/{upload_token}
// Called when the patient removes the dose completely.
export const deletePendingDosageDocument = async (uploadToken) => {
  return Fetcher.delete(
    `order/dosage-document/pending/${encodeURIComponent(uploadToken)}`,
  );
};

export default { uploadPendingDosageDocument, deletePendingDosageDocument };
