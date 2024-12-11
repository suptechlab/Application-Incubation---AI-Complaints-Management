import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

import { handleLogin, handleRefreshToken, handleVerifyOtp, handleGetAccountDetail } from "../services/authentication.service";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../utils/storage";

export const AuthenticationContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    userData: {},
    setUserData: () => { },
});


export default function AuthenticationProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState({})
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const localStorageRefreshToken = getLocalStorage("refresh_token")
        if (!!localStorageRefreshToken) {
            refreshToken(localStorageRefreshToken)
        }
    }, [])

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
        // removeLocalStorage("imageUrl")
        // removeLocalStorage("firstName")
        // removeLocalStorage("lastName")
        // removeLocalStorage("companyTitle")
        // removeLocalStorage("user_type")
        // removeLocalStorage("email")
        // removeLocalStorage("password")

    }

    const login = async (data) => {
        const username = data.username
        return handleLogin(data).then((response) => {
            const otpToken = response?.data?.otpToken;
            //toast.success(response.data.message);
            //setLocalStorage("access_token", response.data.tokens.access.token)
            //setLocalStorage("refresh_token", response.data.tokens.refresh.token)
            // setIsAuthenticated(true)
            navigate("/otp", { state: { username, otpToken } })
        }).catch((error) => {
            console.log('error 53->', error)
            toast.error(error.response.data.errorDescription);
        })
    }

    const OtpVerify = async (data) => {

        return handleVerifyOtp(data).then((response) => {
            console.log('otp verify 70', response)
            //toast.success(response.data.message);
            console.log('accessToken:', response.data);
            if (response.data.id_token) {
                setLocalStorage("access_token", response.data.id_token);
                setLocalStorage("refresh_token", response.data.id_token);
                setIsAuthenticated(true);
                // handleGetAccountDetail().then((accountResponse)=>{
                //     console.log("Account Detail:::", accountResponse);
                //     setLocalStorage("imageUrl", accountResponse.data?.imageUrl);
                //     setLocalStorage("firstName", accountResponse.data?.firstName);
                //     setLocalStorage("lastName", accountResponse.data?.lastName);
                //     setLocalStorage("companyTitle", '');

                //     const authorities = accountResponse.data?.authorities;
                //     const role = 'ROLE_ADMIN' //accountResponse.data?.role;
                //     setLocalStorage("user_type", authorities);
                //     if(!authorities.includes("ROLE_ADMIN")){
                //         const roleMap = role.modules.reduce((acc, module) => {
                //             acc[module.name] = module.permissions.map(permission => permission.name);
                //             return acc;
                //         }, {});
                //         setLocalStorage("user_roles", roleMap);
                //     }
                //     navigate("/dashboard");  
                // }).catch((error) => {
                //     toast.error('Something went wrong.');
                //     console.log('errorOTP 98 ',error);
                // });

                handleGetAccountDetail()
                    .then((accountResponse) => {
                        console.log("Account Detail:::", accountResponse);
                        const { data } = accountResponse;
                        setUserData(data)
                        // Set user details in local storage
                        // setLocalStorage("imageUrl", data?.imageUrl);
                        // setLocalStorage("firstName", data?.firstName);
                        // setLocalStorage("lastName", data?.lastName);
                        // setLocalStorage("role", JSON.stringify(data?.roles));
                        // setLocalStorage("companyTitle", "");

                        // Set authorities
                        const authorities = data?.authorities || [];
                        setLocalStorage("user_type", authorities);

                        // Check for roles and create role map
                        const roles = data?.roles || [];
                        if (!authorities.includes("ROLE_ADMIN")) {
                            const roleMap = roles.reduce((acc, role) => {
                                const modules = role.modules || [];
                                modules.forEach((module) => {
                                    acc[module.name] = module.permissions.map(
                                        (permission) => permission.name
                                    );
                                });
                                return acc;
                            }, {});
                            setLocalStorage("user_roles", roleMap);
                        }

                        // Navigate to dashboard
                        navigate("/dashboard");
                    })
                    .catch((error) => {
                        toast.error("Something went wrong.");
                        console.log("Error in handleGetAccountDetail:", error);
                    });

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
                setLocalStorage("langKey", 'es');
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
                setUserData, // Pass setUserData to the context
            }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
