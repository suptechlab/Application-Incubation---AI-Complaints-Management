import Layout from "../components/layout/Layout";
import Home from "../pages/home";
import MyAccount from "../pages/myAccount";

export const PublicRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/my-account',
        element: <MyAccount />
      },
    ]
  }
]