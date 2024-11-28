import { lazy } from "react";
const Layout = lazy(() => import("../components/layout/Layout"));
const MyAccount = lazy(() => import("../pages/myAccount"));

export const PrivateRoutes = [
  {
    path: "/",
    element: <Layout layout="full" />,
    children: [
      {
        path: "/my-account",
        element: <MyAccount />,
      },
    ],
  },
];