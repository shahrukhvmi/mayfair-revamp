// CONSTANT FILE
// export const app_url = "https://app.mayfairweightlossclinic.co.uk/api/";
// // export const app_url = " http://192.168.1.194:7000/api";
// // export const app_url = "https://staging.mayfairweightlossclinic.co.uk/api";
// // export const passwordlink = "http://localhost:3000/email-confirmation"
// export const passwordlink =
//   "https://mayfairweightlossclinic.co.uk/start-consultation/email-confirmation";
// export const meta_url =
//   "https://mayfairweightlossclinic.co.uk/start-consultation/";
// export default { app_url };
// CONSTANT FILE
const serverType = process.env.NEXT_PUBLIC_SERVER_TYPE;
console.log(serverType, "SERVERRRrrrrrrrr");
let app_url = "";
let passwordlink = "";
let meta_url = "";
switch (serverType) {
  case "local":
    app_url = "http://192.168.1.194:7000/api";
    passwordlink = "http://localhost:3000/email-confirmation";
    meta_url = "http://localhost:3000/";
    break;
  case "staging":
    console.log("STAGING WORKING");
    app_url = "https://staging.mayfairweightlossclinic.co.uk/api";
    passwordlink =
      "https://staging.mayfairweightlossclinic.co.uk/start-consultation/email-confirmation";
    meta_url =
      "https://staging.mayfairweightlossclinic.co.uk/start-consultation/";
    break;
  case "production":
  default:
    app_url = "https://app.mayfairweightlossclinic.co.uk/api/";
    passwordlink =
      "https://mayfairweightlossclinic.co.uk/start-consultation/email-confirmation";
    meta_url = "https://mayfairweightlossclinic.co.uk/start-consultation/";
    break;
}
export { app_url };