import React, { createContext, useState, useEffect, useContext } from 'react';
import {  ticketMastersData } from '../services/ticketmanagement.service';

// Create the context
const MasterDataContext = createContext();

// Create a custom hook to use the context (optional but recommended)
export const useMasterData = () => useContext(MasterDataContext);

// Create a provider component
export const MasterDataProvider = ({ children }) => {
  const [masterData, setMasterData] = useState(null); // State to hold the data
  const [loading, setLoading] = useState(true);       // State to handle loading
  const [error, setError] = useState(null);           // State to handle errors

  useEffect(() => {
    
    const fetchMasterData = ()=>{
      ticketMastersData().then(response => {
        setMasterData(response.data);
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          setError(error?.response?.data?.errorDescription);
        } else {
          setError(error?.message ?? "Something went wrong!");
        }
      }).finally(()=>{
        setLoading(false)
      })
    }
    

    fetchMasterData();
  }, []);

  // Provide the context value
  return (
    <MasterDataContext.Provider value={{ masterData, loading, error }}>
      {children}
    </MasterDataContext.Provider>
  );
};
