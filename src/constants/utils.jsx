import moment from "moment";
import { DATE_FORMAT, DATE_FORMAT_DATE_TIME } from "./global";
import { MdPictureAsPdf } from "react-icons/md";
import { FiImage, FiFileText } from "react-icons/fi";
import { FaRegFile, FaFileWord, FaFileAlt } from "react-icons/fa";


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

// // Getting Formik Schema Required Validation
// export const isFieldRequired = (schema: any, fieldName: string): boolean =>
//     schema?.fields?.[fieldName]?.tests?.some(
//         (test: any) => test?.OPTIONS?.name === 'required'
//     );

// // Getting Empty Array
// export const isEmptyArray = (arr: any) => {
//     return arr.length === 0 || arr.length === undefined;
// }

// //Generate ID
// export const generateId = () => `${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;


// // Find no data changed
// export const isEqualObj = (obj1: any, obj2: any) => {
//     if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

//     for (const key in obj1) {
//         if (obj1[key] !== obj2[key]) {
//             if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
//                 if (!isEqualObj(obj1[key], obj2[key])) return false;
//             } else {
//                 return false;
//             }
//         }
//     }

//     return true;
// }

// // Format Date From Now 
// type DateType = Date | string | undefined;
// export const formatDateFromNow = (date: DateType): string => {
//     if (!date) return '';
//     return moment(date).startOf('hour').fromNow();
// }

// // Format Date and Time Now 
// export const formatDate = (date: DateType): string => {
//     if (!date) return '';
//     return moment(date).format(DATE_FORMAT);
// }

// // Format Date and Time Now 
// export const formatDateTime = (date: DateType): string => {
//     if (!date) return '';
//     return moment(date).format(DATE_FORMAT_DATE_TIME);
// }



// Utility Functions
export const isFieldRequired = (schema, fieldName) =>
  schema?.fields?.[fieldName]?.tests?.some(
    (test) => test?.OPTIONS?.name === 'required'
  );

export const isEmptyArray = (arr) => {
  return arr.length === 0 || arr.length === undefined;
};

export const generateId = () => `${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;

export const isEqualObj = (obj1, obj2) => {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        if (!isEqualObj(obj1[key], obj2[key])) return false;
      } else {
        return false;
      }
    }
  }

  return true;
};

export const formatDateFromNow = (date) => {
  if (!date) return '';
  return moment(date).startOf('hour').fromNow();
};

export const formatDate = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD'); // Replace with your DATE_FORMAT
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm:ss'); // Replace with your DATE_FORMAT_DATE_TIME
};

// FILE UPLOAD

export const validateFile = (file) => {

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


// DOWNLOAD FILE
export function downloadFile(response, fileName) {

  console.log({fileName : fileName})

  return new Promise((resolve, reject) => {
    try {
      // Create the Blob object based on response data
      const blob = new Blob([response?.data], { type: response.headers['content-type'] });
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', fileName || 'download');

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


//VERIFY IS HTML DATA
export const isHTML = (data) => {
  if (!data || typeof data !== "string") return false; // Handle empty or non-string input

  // Regex to check for HTML tags, attributes, or entities
  const htmlRegex = /<([a-z]+)([^<]*)>(.*?)<\/\1>|<([a-z]+)([^<]*)\/>/i;
  return htmlRegex.test(data.trim());
};