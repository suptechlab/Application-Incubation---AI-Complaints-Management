import moment from "moment/moment";
import { MdPictureAsPdf } from "react-icons/md";
import { FiImage, FiFileText } from "react-icons/fi";
import { FaRegFile, FaFileWord, FaFileAlt } from "react-icons/fa";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

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
  
  // Check if the target date is in the future
  if (targetDate.isAfter(now, 'day')) {
    // Calculate the difference in days
    const daysDifference = targetDate.diff(now, 'days'); // Use targetDate.diff to get positive value
    return `${daysDifference}`;
  }
  
  // Return 0 if the date is in the past or today
  return '0';
};
// CAPITALIZE FIRST LETTER
export const capitalizeFirstLetter =(str = '') => {
  if (!str) return ''; // Handle empty or null input
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .split(' ') // Split the string into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}
// VALIDATE FILE
export const validateFile = (file) => {
  const MAX_FILE_SIZE_MB = 10;

  // if (!file) {
  //   return msg.noFileSelected;
  // }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return msg.invalidFileType;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return msg.fileSizeExceeded.replace("{size}", MAX_FILE_SIZE_MB);
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

// DOWNLOAD FUNCTION

export function downloadFile(response, attachmentData, fileName) {
  return new Promise((resolve, reject) => {
    try {
      // Create the Blob object based on response data
      const blob = new Blob([response?.data], { type: response.headers['content-type'] });
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', fileName || attachmentData?.originalTitle || 'download');

      // Append the link to the document body
      document.body.appendChild(tempLink);

      // Trigger the download by clicking the link
      tempLink.click();

      // Clean up by revoking the Blob URL and removing the link
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(tempLink);

      // Success: Resolve the promise and display success message
      // toast.success(t("ATTACHMENT DOWNLOADED"), { id: "downloading" });
      resolve();
    } catch (error) {
      // Handle any errors during the download process
      console.error("Error downloading the file:", error);
      reject(error);
    }
  });
}

const EXTENSION_ICON_MAP = {
  "jpeg": <FiImage size={24} />,
  "jpg": <FiImage size={24} />,
  "png": <FiImage size={24} />,
  "pdf": <MdPictureAsPdf size={24} />,
  "txt": <FiFileText size={24} />,
  "doc": <FaFileWord size={24} />,
  "docx": <FaFileWord size={24} />,
  "rtf": <FaFileAlt size={24} />,
};

const getFileExtension = (originalTitle) => {
  if (!originalTitle) return null;
  const parts = originalTitle.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : null;
};
export const getIconForFile = (originalTitle) => {
  const extension = getFileExtension(originalTitle);
  return extension && EXTENSION_ICON_MAP[extension] ? EXTENSION_ICON_MAP[extension] : <FaRegFile size={24} />;
};
