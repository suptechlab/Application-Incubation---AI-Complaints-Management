import { getLocalStorage } from './storage'; 

const isAccessible = async(moduleName, childModuleName)=>{
    const userType = getLocalStorage("user_type");
    if (userType==="ROLE_USER") {
        const userRoles = getLocalStorage("user_roles");
        // Check if the user_roles exist and are not null
        if (userRoles) {
            const permissions = userRoles[moduleName];
            return Array.isArray(permissions) && permissions.includes(childModuleName); 
        } else {
            return true;
        }
    }else{
        return true;
    } 
}

const getModulePermissions = async(moduleName)=>{
    const userRoles = getLocalStorage("user_roles");
        if (userRoles) {
            const permissions = userRoles[moduleName];
           return permissions;
        } else {
            return [];
        }
}

const getPermissionsModuleNameList = async()=>{
    const userRoles = getLocalStorage("user_roles");
    if (userRoles) {
        const allValues = [];
        const keys = Object.keys(userRoles);
        keys.forEach(key=>{
            allValues.push(key);
            userRoles[key].forEach(role=>{
                allValues.push(role);
            })
            
        })
        return allValues;
    } else {
        return []; 
    }
}

const isAdminUser = async()=>{
    const userType = getLocalStorage("user_type");
    if(userType.includes('ROLE_ADMIN')){
        return true;
    }else{
        return false;
    }
}



export { isAccessible, getModulePermissions, isAdminUser, getPermissionsModuleNameList }