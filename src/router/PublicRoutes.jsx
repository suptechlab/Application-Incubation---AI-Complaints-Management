import { lazy } from "react";

const Layout = lazy(() => import("../components/layout/Layout"));
const Home = lazy(() => import("../pages/home"));
const MyAccount = lazy(() => import("../pages/myAccount"));

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
        path: "/my-account",
        element: <MyAccount />,
      },
    ],
  },
];