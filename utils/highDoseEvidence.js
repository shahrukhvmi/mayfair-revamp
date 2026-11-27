import {
  deletePendingDosageDocument,
  uploadPendingDosageDocument,
} from "@/api/HighDoseEvidenceApi";

// Evidence of previous treatment for a high dose. It is uploaded as soon as
// the patient confirms the dose (dosage page), and the cart item keeps only
// the returned `upload_token`. Checkout sends the items, token included, with
// order/consultationMayfair; there is no separate upload at checkout.

// Uploads the file for this cart item. Resolves with the upload_token.
export const uploadHighDoseEvidence = async (itemId, file) => {
  const formData = new FormData();
  formData.append("item_id", itemId);
  formData.append("evidence", file, file.name);

  const res = await uploadPendingDosageDocument(formData);
  const token = res?.data?.pending_evidence?.upload_token;
  if (!token) throw new Error("Evidence upload returned no upload_token");
  return token;
};

// Removes a pending upload when its dose leaves the cart completely. A failure
// does not block the removal (the backend also expires pending uploads).
export const releaseHighDoseEvidence = (uploadToken) => {
  if (!uploadToken) return;
  deletePendingDosageDocument(uploadToken).catch((err) => {
    console.error("Pending dosage document could not be removed", err);
  });
};

// A high dose in the cart is complete only once it was confirmed and its
// evidence was uploaded.
export const hasHighDoseEvidence = (dose) =>
  Boolean(dose?.consentGiven && dose?.upload_token);
