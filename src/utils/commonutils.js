import moment from "moment/moment";

// TIME REMAINING
export const timeRemaining = (date) => {
  const now = moment();
  const targetDate = moment(date);

  if (targetDate.isAfter(now)) {
    return `${targetDate.toNow(true)}`; // 'true' omits 'in'/'ago'
  } else {
    return `${targetDate.fromNow()}`; // Uses default format for past dates
  }
};

// CALCULATE DIFFERENCE
export const calculateDaysDifference = (date) => {
  const now = moment();
  const targetDate = moment(date);

  // Calculate the absolute difference in days
  const daysDifference = Math.abs(targetDate.diff(now, 'days'));

  return `${daysDifference}`;
};

// FILE UPLOAD

export const validateFile = (file) => {


  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf",
  ];
  const MAX_FILE_SIZE_MB = 1;

  if (!file) {
    return "No file selected.";
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Invalid file type. Please upload an allowed file.";
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`;
  }

  // If all validations pass
  return true;
};


//VERIFY IS HTML DATA
export const isHTML = (data) => {
  if (!data || typeof data !== "string") return false; // Handle empty or non-string input

  // Regex to check for HTML tags, attributes, or entities
  const htmlRegex = /<([a-z]+)([^<]*)>(.*?)<\/\1>|<([a-z]+)([^<]*)\/>/i;
  return htmlRegex.test(data.trim());
};