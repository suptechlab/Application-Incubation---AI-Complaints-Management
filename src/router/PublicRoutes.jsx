import { lazy } from "react";
import DownloadPdf from "../pages/helpdesk/downloadpdf/DownloadPdf";
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
        path: "/download-ticket-pdf",
        element: <DownloadPdf />,
      },
      {
        path: "*",
        element: <p>PAGE NOT FOUND</p>
      }
    ],
  },
];