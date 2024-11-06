export const EDIT_CONFIRMATION_ALERT = {
    title: "Are you sure?",
    text: "You will not be able to recover this data!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true,
}


// AUDIT LOG ACTIVITY TYPES
export const AUDIT_TRAIL_ACTIVITY = [
    {
        label: {
            en: "Data Entry",
            es: "Entrada de Datos"
        },
        value: "DATA_ENTRY"
    },
    {
        label: {
            en: "Modification",
            es: "Modificación"
        },
        value: "MODIFICATION"
    },
    {
        label: {
            en: "Status Change",
            es: "Cambio de Estado"
        },
        value: "STATUS_CHANGE"
    }
];
