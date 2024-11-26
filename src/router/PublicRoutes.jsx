import { lazy } from "react";
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
    ],
  },
];