import moment from "moment";
import { DATE_FORMAT, DATE_FORMAT_DATE_TIME } from "./global";

// Getting Formik Schema Required Validation
export const isFieldRequired = (schema: any, fieldName: string): boolean =>
    schema?.fields?.[fieldName]?.tests?.some(
        (test: any) => test?.OPTIONS?.name === 'required'
    );

// Getting Empty Array
export const isEmptyArray = (arr: any) => {
    return arr.length === 0 || arr.length === undefined;
}

//Generate ID
export const generateId = () => `${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;


// Find no data changed
export const isEqualObj = (obj1: any, obj2: any) => {
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
}

// Format Date From Now 
type DateType = Date | string | undefined;
export const formatDateFromNow = (date: DateType): string => {
    if (!date) return '';
    return moment(date).startOf('hour').fromNow();
}

// Format Date and Time Now 
export const formatDate = (date: DateType): string => {
    if (!date) return '';
    return moment(date).format(DATE_FORMAT);
}

// Format Date and Time Now 
export const formatDateTime = (date: DateType): string => {
    if (!date) return '';
    return moment(date).format(DATE_FORMAT_DATE_TIME);
}