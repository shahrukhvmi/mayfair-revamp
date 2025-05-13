// /api/getVariationsApi.js
import Fetcher from "@/library/Fetcher";

export const GetOrdersApi = async ({ data }) => {
  return Fetcher.get(`order/myorders`, data);
};

export default GetOrdersApi;
