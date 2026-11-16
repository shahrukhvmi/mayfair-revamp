import Fetcher from "@/library/Fetcher";

// TODO: the backend endpoint for BMI verification videos does not exist yet.
// Put its name here (same style as "BMIImagesForOrderProcess"). While it is
// empty the modal shows a "coming soon" message instead of calling the API.
export const BMI_VIDEO_ENDPOINT = "";

export const BmiVideoUploadApi = async (data) => {
  return Fetcher.post(BMI_VIDEO_ENDPOINT, data);
};

export default { BmiVideoUploadApi };
