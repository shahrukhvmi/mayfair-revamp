import GetUserOrderApi from "@/api/GetUserOrderApi";

// Cart ka orderId naye device par khali ho sakta hai aur My Orders se koi purana
// order bhi ho sakta hai, is liye patient ka current order API se lete hain.
export const getCurrentOrderId = async (fallbackOrderId) => {
  try {
    const res = await GetUserOrderApi();
    return res?.data?.id || fallbackOrderId;
  } catch (error) {
    return fallbackOrderId;
  }
};
