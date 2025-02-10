import React, { useEffect } from "react";
import { downloadTicketDetailsPublicApi } from "../../../redux/slice/fileClaimSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const DownloadPdf = () => {


  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { id } = useParams()

  useEffect(() => {
    const downloadTicketData = async () => {

      const result = await dispatch(downloadTicketDetailsPublicApi(id));
      if (downloadTicketDetailsPublicApi.fulfilled.match(result)) {
        navigate('/my-account')
      } else {
      }
    }


    if (id) {
      downloadTicketData()
    }

  }, [id])

  return <div></div>;
};

export default DownloadPdf;
