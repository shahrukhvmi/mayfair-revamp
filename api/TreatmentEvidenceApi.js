import Fetcher from "@/library/Fetcher";

export const TreatmentEvidenceUpload = async (data) => {
  return Fetcher.post("TreatmentEvidenceForOrderProcess", data);
};

export const GetTreatmentEvidence = async () => {
  return Fetcher.get(`getTreatmentEvidenceForOrderProcess`);
};

export default { TreatmentEvidenceUpload, GetTreatmentEvidence };
