import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

import { handleLogin, handleRefreshToken, handleVerifyOtp, handleGetAccountDetail } from "../services/authentication.service";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../utils/storage";

export const AuthenticationContext = createContext({
    isAuthenticated: false,
    isLoading: true,
});


export default function AuthenticationProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
    }

    const login = async (data) => {
        const username = data.username
        return handleLogin(data).then((response) => {
            console.log('success',response?.data?.otpToken)
            const otpToken = response?.data?.otpToken;
            //toast.success(response.data.message);
            //setLocalStorage("access_token", response.data.tokens.access.token)
            //setLocalStorage("refresh_token", response.data.tokens.refresh.token)
            setIsAuthenticated(true)
            navigate("/otp",{ state: {username, otpToken}})
        }).catch((error) => {
            console.log('error 53->',error)
            toast.error(error.response.data.errorDescription);
        })
    }

    const OtpVerify = async (data) => {
        
        return handleVerifyOtp(data).then((response) => {
            console.log('otp verify 60',response)
            //toast.success(response.data.message);
            console.log('accessToken:', response.data);
            if (response.data.id_token) {
                setLocalStorage("access_token", response.data.id_token);
                setLocalStorage("refresh_token", response.data.id_token);
                setIsAuthenticated(true);
                
                handleGetAccountDetail().then((accountResponse)=>{
                    console.log("Account Detail:::", accountResponse);
                    setLocalStorage("imageUrl", accountResponse.data?.imageUrl);
                    setLocalStorage("firstName", accountResponse.data?.firstName);
                    setLocalStorage("lastName", accountResponse.data?.lastName);
                    setLocalStorage("companyTitle", '');
                    
                    const authorities = accountResponse.data?.authorities;
                    const role = 'ROLE_ADMIN' //accountResponse.data?.role;
                    setLocalStorage("user_type", authorities);
                    if(!authorities.includes("ROLE_ADMIN")){
                        const roleMap = role.modules.reduce((acc, module) => {
                            acc[module.name] = module.permissions.map(permission => permission.name);
                            return acc;
                        }, {});
                        setLocalStorage("user_roles", roleMap);
                    }
                    navigate("/dashboard");  
                }).catch((error) => {
                    toast.error(error);
                });
            } else {
                console.error('Tokens are missing in the response');
                toast.error('Tokens are missing in the response');
            }
            
        }).catch((error) => {
            toast.error(error.response.data.errorDescription);
        })
    }

    const refreshToken = async (localStorageRefreshToken) => {
        return handleRefreshToken(localStorageRefreshToken).then((response) => {
            if(response.data.data.jwt){
                setLocalStorage("langKey", 'en');
                setLocalStorage("access_token", response.data.data.jwt.accessToken);
                setLocalStorage("refresh_token", response.data.data.jwt.refreshToken);
                setIsAuthenticated(true);
                handleGetAccountDetail().then((accountResponse)=>{
                    const authorities = accountResponse.data.data.authorities;
                    const role = accountResponse.data.data.role;
                    setLocalStorage("user_type", authorities);
                    if(!authorities.includes("ROLE_ADMIN")){
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
            removeLocalStorage("access_token")
            removeLocalStorage("refresh_token")
            setIsAuthenticated(false)
        })

    }

    useEffect(() => {
    }, [isAuthenticated])


    return (
        <AuthenticationContext.Provider value={{ isAuthenticated, isLoading, setIsAuthenticated, logout, login, OtpVerify }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
