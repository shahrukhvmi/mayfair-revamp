import Fetcher from "@/library/Fetcher";

export const patientSource = async (data) => {
  return Fetcher.post("/PatientSources", data);
};

export default patientSource;
