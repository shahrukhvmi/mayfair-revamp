import Fetcher from "@/library/Fetcher";

/*
 * Sets the password on the signed-in account - the "Set a Password" step at
 * checkout, which runs just after registration, so we already hold the token
 * registration gave us and Fetcher attaches it.
 *
 * We used to send `{ email, company_id, password }` and the API changed
 * whichever account matched, without checking who was asking. One anonymous
 * request therefore set the password of any patient, clinician or
 * administrator on the platform - the worst of the November 2026 findings.
 *
 * Only the password is sent now. Who it belongs to is the token's business,
 * and the server no longer reads an identity out of the body.
 */
export const UpdatePassword = async ({ password, password_confirmation }) => {
  return Fetcher.post("password/UpdatePassword", {
    password,
    password_confirmation,
  });
};

export default { UpdatePassword };
