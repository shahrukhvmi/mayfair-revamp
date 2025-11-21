import Fetcher from "@/library/Fetcher";

export const GetUserOrderApi = async (data) => {
  return Fetcher.get("/GetUserOrder");
};

export default GetUserOrderApi;
