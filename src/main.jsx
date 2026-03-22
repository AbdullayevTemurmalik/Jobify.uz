import React, { Suspense } from "react"; // Suspense qo'shish tavsiya etiladi
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./talent/Context/ThemeContext";
import { JobReactionsProvider } from "./talent/Context/JobReactionsContext";
import { FormProvider } from "./Company/context/FormContext";


import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <JobReactionsProvider>
        <FormProvider>
          <BrowserRouter>
            {/* Suspense tarjimalar yuklanguncha kutib turadi. 
               Agar tarjima fayllaringiz katta bo'lsa, xatolik bermasligi uchun kerak.
            */}
            <Suspense fallback="Loading...">
              <App />
            </Suspense>
          </BrowserRouter>
        </FormProvider>
      </JobReactionsProvider>
    </ThemeProvider>
  </React.StrictMode>
);