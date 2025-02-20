import { lazy } from "react";
import DownloadPdf from "../pages/helpdesk/downloadpdf/DownloadPdf";
import SurveyForm from "../pages/surveyForm";
const Layout = lazy(() => import("../components/layout/Layout"));
const Home = lazy(() => import("../pages/home"));

export const PublicRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/download-ticket-pdf/:id",
        element: <DownloadPdf />,
      },
      {
        path: "/satisfaction-survey",
        element: <SurveyForm />,
      },
      {
        path: "*",
        element: <p>PAGE NOT FOUND</p>
      }
    ],
  },
];