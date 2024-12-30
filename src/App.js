import React, { Suspense, useEffect } from "react";
import Loader from "./components/Loader";
import AppRoutes from "./router";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLocalStorage } from "./utils/storage";
import { getAccountInfo, setLogout } from "./redux/slice/authSlice";
import { fetchMasterData } from "./redux/slice/masterSlice";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


function App() {

  // Initialize QueryClient
  const queryClient = new QueryClient();

  const {token} = useSelector((state)=> state?.authSlice)

  // CALL ACCOUNT INFO API HERE SO CAN VALIDATE THAT USER TOKEN IS STILL VALID OR NOT
  // MANAGE LOGIN FLOW ALSO IF USER IS LOGGED IN THAT SHOULD DIRECTLY GO ON FILE A CLAIM
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const id_token = getLocalStorage('id_token');

      if (id_token) {
        try {
          // Dispatch getAccountInfo to validate the token
          const response = await dispatch(getAccountInfo()).unwrap();
          if (!response) {
            throw new Error('Invalid token');
          } else {
            // CALL COMMON DROPDOWN API'S HERE AND STORE IN REDUX
            dispatch(fetchMasterData());
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Log the user out if the token is invalid
          dispatch(setLogout());
        }
      }
    };

    validateToken();
  }, [dispatch]);


  useEffect(()=>{

    if(token){
      dispatch(fetchMasterData()); 
    }

  },[token])


  return (
    <Suspense fallback={<Loader isLoading={true} />}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </Suspense>
  );
}

export default App;
