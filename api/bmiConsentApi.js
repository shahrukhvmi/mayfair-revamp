import Fetcher from "@/library/Fetcher";

export const BMIGpRecordsORBPostCosent = async (data) => {
  return Fetcher.post("order/consent", data);
};

export default { BMIGpRecordsORBPostCosent };
