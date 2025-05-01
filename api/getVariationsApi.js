import Fetcher from "@/library/Fetcher";

export const getVariationsApi = async (product_id) => {
    return Fetcher.get(`products/GetVaritions/${product_id}`);
};

export default { getVariationsApi };
