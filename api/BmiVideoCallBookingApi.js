import Fetcher from "@/library/Fetcher";

// POST /api/patient/gp-consultations/booking-session (app_url already ends with /api/)
// Hit before the BMI video call Calendly opens; the Calendly webhook on the
// backend does the rest.
export const BmiVideoCallBookingSession = async () => {
  return Fetcher.post("patient/gp-consultations/booking-session", {});
};

export default { BmiVideoCallBookingSession };
