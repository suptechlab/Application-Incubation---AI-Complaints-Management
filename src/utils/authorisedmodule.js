import { getLocalStorage } from './storage';

const isAccessible = async(moduleName, childModuleName)=>{
    const userType = getLocalStorage("user_type");
    // console.log("User Type:::", moduleName,  childModuleName);
    if (userType==="ROLE_USER") {
        const userRoles = getLocalStorage("user_roles");
        console.log("User Roles:::", userRoles);
        // Check if the user_roles exist and are not null
        if (userRoles) {
            //console.log("User Roles:", userRoles);
            const permissions = userRoles[moduleName];
            //console.log(`Permissions for ${moduleName}:`, permissions);
            if (Array.isArray(permissions) && permissions.includes(childModuleName)) {
               // console.log(`Permissions for ${moduleName} include child module ${childModuleName}`);
                return true;
            } else {
                //console.log(`Permissions for ${moduleName} do not include child module ${childModuleName}`);
                return false;
            }
        } else {
            console.log("User Roles are not set in localStorage");
            return true;
        }
    }else{
        //console.log("User Type:::", userType)
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