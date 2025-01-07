import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

import { handleLogin, handleRefreshToken, handleVerifyOtp, handleGetAccountDetail, downloadProfileImage } from "../services/authentication.service";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../utils/storage";

export const AuthenticationContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    isDownloadingImg :false,
    userData: {},
    currentUser: {},
    permissions: [],
    modules: [],
    setUserData: () => { },
    profileImage: ''
});


export default function AuthenticationProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloadingImg, setIsDownloadingImg] = useState(true);
    const [userData, setUserData] = useState({})
    const [currentUser, setCurrentUser] = useState(null)
    const [permissions, setPermissions] = useState([])
    const [authorities, setAuthorities] = useState([])
    const [modules, setModules] = useState([])

    const [profileImage , setProfileImage] = useState('')

    const navigate = useNavigate()
    const location = useLocation()

    // useEffect(() => {
    //     const localStorageRefreshToken = getLocalStorage("refresh_token")
    //     if (!!localStorageRefreshToken) {
    //         refreshToken(localStorageRefreshToken)
    //     }
    // }, [])

    useEffect(() => {
        if (!!getLocalStorage("access_token")) {
            setIsAuthenticated(true)
            setIsLoading(false)
        } else {
            setIsAuthenticated(false)
            setIsLoading(false)
        }
    }, [])

    const logout = () => {
        removeLocalStorage("access_token")
        removeLocalStorage("refresh_token")
        setIsAuthenticated(false)
    }

    const login = async (data) => {
        const username = data.username
        return handleLogin(data).then((response) => {
            const otpToken = response?.data?.otpToken;
            navigate("/otp", { state: { username, otpToken } })
        }).catch((error) => {
            console.log('error 53->', error)
            toast.error(error.response.data.errorDescription);
        })
    }

    const OtpVerify = async (data) => {

        return handleVerifyOtp(data).then((response) => {
            if (response.data.id_token) {
                setLocalStorage("access_token", response.data.id_token);
                setLocalStorage("refresh_token", response.data.id_token);
                setIsAuthenticated(true);
                // GET USER INFO AND SET IT INTO LOCALSTORAGE
                handleAccountDetails()
                navigate("/dashboard");

            } else {
                toast.error('Tokens are missing in the response');
            }

        }).catch((error) => {
            toast.error(error.response.data.errorDescription);
            //navigate("/login"); 
        })
    }

    const refreshToken = async (localStorageRefreshToken) => {
        return handleRefreshToken(localStorageRefreshToken).then((response) => {
            if (response.data.data.jwt) {
                // setLocalStorage("langKey", 'es');
                setLocalStorage("access_token", response.data.data.jwt.accessToken);
                setLocalStorage("refresh_token", response.data.data.jwt.refreshToken);
                setIsAuthenticated(true);
                handleGetAccountDetail().then((accountResponse) => {
                    const authorities = accountResponse.data.data.authorities;
                    const role = accountResponse.data.data.role;
                    setLocalStorage("user_type", authorities);
                    if (!authorities.includes("ROLE_ADMIN")) {
                        const roleMap = role.modules.reduce((acc, module) => {
                            acc[module.name] = module.permissions.map(permission => permission.name);
                            return acc;
                        }, {});
                        setLocalStorage("user_roles", roleMap);
                    }

                }).catch((error) => {
                    toast.error(error);
                });
                navigate(location.pathname)
            } else {
                console.error('JWT tokens are missing in the response');
                toast.error('JWT tokens are missing in the response');
            }
        }).catch((error) => {
            // Temp stoping refresh token work
            // removeLocalStorage("access_token")
            // removeLocalStorage("refresh_token")
            // setIsAuthenticated(false)
        })

    }

    useEffect(() => {
    }, [isAuthenticated])

    // GET ACCOUNT DETAILS AND SET IT IN TO STATES
    const handleAccountDetails = () => {
        setIsLoading(true)
        // CALL API FOR GET ACCOUNT DETAILS
        handleGetAccountDetail()
            .then((response) => {
                const { data } = response;
                setUserData(data)
                // Set authorities
                const authorities = data?.authorities || [];
                setAuthorities(authorities)
                // Check for roles and create role map
                const roles = data?.roles || [];
                if (!authorities.includes("ROLE_ADMIN")) {
                    if (roles?.length > 0) {
                        // const roleMap = {
                        //     'fi-admin': 'FI_USER',
                        //     'fi-agent': 'FI_USER',
                        //     'seps-admin': 'SEPS_USER',
                        //     'seps-agent': 'SEPS_USER',
                        // };
                        const roleName = roles[0]?.userType;
                        setCurrentUser(roleName || 'SYSTEM_ADMIN');

                        const rolePermissionMap = roles.reduce((acc, role) => {
                            const modules = role.modules || [];
                            modules.forEach((module) => {
                                acc[module.name] = module.permissions.map(
                                    (permission) => permission.name
                                );
                            });
                            return acc;
                        }, {});
                        setModules(roles[0]?.modules);
                        setPermissions(rolePermissionMap);
                    } else {
                        setCurrentUser('SYSTEM_ADMIN');
                    }


                } else {
                    setCurrentUser('SYSTEM_ADMIN')
                }

                // if(data?.externalDocumentId){
                //     handleImageDownload()
                // }
                handleImageDownload()
            })
            .catch((error) => {
                console.log(error)
                console.error("Error fetching account details:", error);

                if (error?.response?.status === '401') {
                    toast.error("Session expired. Please log in again.");
                    logout();
                }

            }).finally(() => {
                setIsLoading(false)
            });
    }

    // HANDLE IMAGE DOWNLOAD AND SAVE IT IN LOCAL STORAGE
    const handleImageDownload = () => {
        setIsDownloadingImg(true)
        downloadProfileImage().then(async (response) => {

            console.log({ response })
            const reader = new FileReader();
            const blob = response.data;

            const base64Url = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Store the base64 URL in localStorage
            localStorage.setItem('profileImage', base64Url);
            setProfileImage(base64Url)
            //  base64Url; // Return the base64 URL
        }).catch((error)=>{
            console.error('ERROR IN DOWNLOAD PROFILE',error)
        }).finally(()=>{
            setIsDownloadingImg(false)
        })
    }


    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            handleAccountDetails()
        }
    }, []);


    return (
        <AuthenticationContext.Provider value={
            {
                isAuthenticated,
                isLoading,
                setIsAuthenticated,
                logout,
                login,
                OtpVerify,
                userData,
                currentUser,
                permissions,
                authorities,
                modules,
                profileImage,
                isDownloadingImg
            }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
