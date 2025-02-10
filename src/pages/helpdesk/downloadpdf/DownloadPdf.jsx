import React, { useEffect } from "react";
import { downloadTicketDetailsPublicApi } from "../../../redux/slice/fileClaimSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const DownloadPdf = () => {


  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { id } = useParams()
  const {t} = useTranslation()

  useEffect(() => {
    const downloadTicketData = async () => {

      const result = await dispatch(downloadTicketDetailsPublicApi(id));
      if (downloadTicketDetailsPublicApi.fulfilled.match(result)) {

        if (result?.payload?.data) {
          const blob = new Blob([result?.payload?.data], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(blob);

          toast.success(t("DOWNLOAD_SUCCESSFUL"), { id: "downloading" })


          const tempLink = document.createElement('a');
          tempLink.href = blobUrl;
          tempLink.setAttribute('download', 'ticket_details.pdf');

          // Append the link to the document body before clicking it
          document.body.appendChild(tempLink);

          tempLink.click();

          // Clean up by revoking the Blob URL
          window.URL.revokeObjectURL(blobUrl);

          // Remove the link from the document body after clicking
          document.body.removeChild(tempLink);
        } else {
          throw new Error(t("EMPTY RESPONSE"));
        }

        navigate('/')
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
