import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { downloadProfileImage, handleGetAccountDetail, handleLogin, handleVerifyOtp } from "../services/authentication.service";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../utils/storage";

export const AuthenticationContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    isDownloadingImg: false,
    userData: {},
    currentUser: {},
    permissions: [],
    modules: [],
    setUserData: () => { },
    profileImage: '',
    handleAccountDetails: () => { }
});


export default function AuthenticationProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloadingImg, setIsDownloadingImg] = useState(false);
    const [userData, setUserData] = useState({})
    const [currentUser, setCurrentUser] = useState(null)
    const [permissions, setPermissions] = useState([])
    const [authorities, setAuthorities] = useState([])
    const [modules, setModules] = useState([])

    const [profileImage, setProfileImage] = useState('')

    const navigate = useNavigate()

    const { t } = useTranslation()


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
        removeLocalStorage("profileImage")
        setUserData({})
        setPermissions([])
        setAuthorities([])
        setModules([])
        navigate('/login')
    }

    const login = async (data) => {
        const username = data.username
        return handleLogin(data).then((response) => {
            const otpToken = response?.data?.otpToken;
            navigate("/otp", { state: { username, otpToken } })
        }).catch((error) => {
            toast.error(error.response.data.errorDescription);
            throw error;  // Propagate the error
        })
    }

    const OtpVerify = async (data, actions) => {

        handleVerifyOtp(data).then((response) => {
            if (response?.data?.id_token) {
                setLocalStorage("access_token", response.data.id_token);
                setLocalStorage("refresh_token", response.data.id_token);
                setIsAuthenticated(true);
                // GET USER INFO AND SET IT INTO LOCALSTORAGE
                handleAccountDetails()
                navigate("/dashboard");


            } else {
                toast.error(response?.data?.message);
            }



        }).catch((error) => {
            toast.error(error?.response?.data?.errorDescription ?? error?.message);
        }).finally(() => {
            actions.setSubmitting(false)
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
                        const roleName = roles[0]?.userType;
                        setCurrentUser(roleName || 'SYSTEM_ADMIN');

                        const extractPermissions = (module) => {
                            return module.permissions.map((permission) => permission.name);
                        };

                        const addModulePermissions = (acc, module) => {
                            acc[module.name] = extractPermissions(module);
                            return acc;
                        };

                        const rolePermissionMap = roles.reduce((acc, role) => {
                            const modules = role.modules || [];
                            return modules.reduce(addModulePermissions, acc);
                        }, {});

                        setModules(roles[0]?.modules);
                        setPermissions(rolePermissionMap);
                    } else {
                        setCurrentUser('SYSTEM_ADMIN');
                    }


                } else {
                    setCurrentUser('SYSTEM_ADMIN')
                }

                if (data?.externalDocumentId) {
                    handleImageDownload()
                } else {
                    setIsDownloadingImg(false)
                }
                // handleImageDownload()
            })
            .catch((error) => {
                if (error?.response?.status == '401') {
                    toast.error(t("SESSION_EXPIRED"));
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
        }).catch((error) => {
            console.error('ERROR IN DOWNLOAD PROFILE', error)
        }).finally(() => {
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
                isDownloadingImg,
                handleAccountDetails
            }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
