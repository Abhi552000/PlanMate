import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { ScrollToTop } from "./components/common/ScrollToTop";

const App = () => {
  return (
    <AuthProvider>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
