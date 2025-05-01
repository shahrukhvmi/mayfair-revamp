import Fetcher from "@/library/Fetcher";

export const userConsultationApi = async (data) => {
  return Fetcher.get("/test");
};

export default { userConsultationApi };
