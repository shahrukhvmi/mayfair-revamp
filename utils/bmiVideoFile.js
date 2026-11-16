// BMI verification video ke liye file checks. Koi bhi phone (iPhone .mov/.mp4,
// Android .mp4/.3gp/.webm) chalta hai. Extension, MIME type aur file ke andar
// ke bytes dekhe jate hain taake rename ki hui file upload na ho sake.

export const BMI_VIDEO_MAX_SIZE_MB = 20;

export const BMI_VIDEO_ACCEPT =
  "video/*,.mp4,.mov,.m4v,.3gp,.3g2,.webm";

export const BMI_VIDEO_FORMATS_TEXT = `MP4, MOV, M4V, 3GP or WEBM · Maximum ${BMI_VIDEO_MAX_SIZE_MB} MB`;

const INVALID_TYPE_MESSAGE =
  "This file is not a supported video. Please upload an MP4, MOV, M4V, 3GP or WEBM video.";

const ALLOWED_EXTENSIONS = ["mp4", "mov", "m4v", "3gp", "3g2", "webm"];

export const getVideoExtension = (name = "") =>
  name.includes(".") ? name.split(".").pop().trim().toLowerCase() : "";

const ascii = (bytes, start, end) =>
  String.fromCharCode(...bytes.slice(start, end));

// MP4 / MOV / M4V / 3GP all start with an "ftyp" box; WEBM starts with EBML.
const looksLikeVideo = (bytes) =>
  ascii(bytes, 4, 8) === "ftyp" ||
  (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3);

export const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Resolves with an error message for the patient, or null if the video is fine. */
export const validateBmiVideoFile = async (file) => {
  if (!ALLOWED_EXTENSIONS.includes(getVideoExtension(file?.name))) {
    return INVALID_TYPE_MESSAGE;
  }

  // Some phones leave the type empty; the bytes are checked below anyway.
  if (file.type && !file.type.startsWith("video/")) return INVALID_TYPE_MESSAGE;

  if (file.size === 0) {
    return "This video appears to be empty. Please choose another one.";
  }
  if (file.size > BMI_VIDEO_MAX_SIZE_MB * 1024 * 1024) {
    return `Video too large (${formatFileSize(file.size)}). Maximum allowed size is ${BMI_VIDEO_MAX_SIZE_MB} MB. Try recording a shorter video.`;
  }

  const buffer = await file.slice(0, 12).arrayBuffer();
  if (!looksLikeVideo(new Uint8Array(buffer))) return INVALID_TYPE_MESSAGE;

  return null;
};
