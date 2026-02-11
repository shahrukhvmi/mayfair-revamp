import Fetcher from "@/library/Fetcher";

export const PostPrescriptionEvidence = async (order_id) => {
  return Fetcher.post("postPrescriptionEvidence", order_id);
};

export const GetPrescriptionEvidence = async () => {
  return Fetcher.get(`getPrescriptionEvidence`);
};

export default { PostPrescriptionEvidence, GetPrescriptionEvidence };
