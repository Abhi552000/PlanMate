import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { BoardProvider } from "./context/BoardContext";
import { ToastContainer } from "react-toastify";
import { ScrollToTop } from "./components/common/ScrollToTop";

const App = () => {
  return (
    <AuthProvider>
      <BoardProvider>
        <ScrollToTop />
        <ToastContainer
          position="top-right"
          autoClose={3200}
          limit={3}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
        <AppRoutes />
      </BoardProvider>
    </AuthProvider>
  );
};

export default App;
