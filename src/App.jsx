import React, { useEffect } from "react"; // useEffect qo'shildi
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"; // useLocation qo'shildi
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

import { useTheme } from "./talent/Context/ThemeContext";

// --- Company Pages ---
import Layout from "./Company/Layout/LoyoUt.jsx";
import Talents from "./Company/Talent/Talent.jsx";
import Jobs from "./Company/Jobs/Jobs.jsx";
import Home from "./Company/Home/Home.jsx";
import SignUpPage from "./Company/Register/Register.jsx";
import SignInCompany from "./Company/Login/Login.jsx";
import ForgotPassword1 from "./Company/ForgotPassword1/ForgotPassword1.jsx";
import ForgotPassword2 from "./Company/ForgotPassword2/ForgotPassword2.jsx";
import ForgotPassword3 from "./Company/ForgotPassword3/ForgotPassword3.jsx";
import ForgotPassword4 from "./Company/ForgotPassword4/ForgotPassword4.jsx";
import DashboardCompany from "./Company/Dashboard/Dashboard.jsx";
import TelegramVerify from "./Company/Register/TelegramVerify.jsx";
import Verify from "./Company/Register/Verify.jsx";
import MyCompany from "./Company/MyCompany/MyCompany.jsx";
import MyJobs from "./Company/MyJobs/MyJobs.jsx";
import JobDetailPageCompany from "./Company/JobDetail/JobDetailPage.jsx";
import PostJob from "./Company/PostJob/PostJob.jsx";
import Notification from "./Company/Notifications/Notification.jsx";
import Contacts from "./Company/Contacts/Contacts.jsx";
import Faaq from "./Company/Faq/Faq.jsx";

// --- Talent Pages ---
import MainLayout from "./talent/components/MainLayout.jsx";
import DashboardTalent from "./talent/components/Dashbord/Dashbord";
import SignInTalent from "./talent/pages/Auth/SignIn";
import RegistrationForm from "./talent/pages/RegistrationPage/RegistrationPage";
import RegistrationFormStepTwo from "./talent/pages/RegistrationFormStepTwo/RegistrationFormStepTwo";
import RegistrationFormStepThree from "./talent/pages/RegistrationFormStepThree/RegistrationFormStepThree";
import JobMatches from "./talent/components/JobMatches/JobMatches";
import ProfilePage from "./talent/components/MyProfile/MyProfile";
import JobDetail from "./talent/components/JobDetail/JobDetail";
import JobAlerts from "./talent/components/JobAlerts/JobAlerts";
import CompanyDetail from "./talent/components/CompanyDetail/CompanyDetail";
import Faq from "./talent/pages/Faq/Faq";
import Contact from "./talent/pages/Contact/Contact";
import VerifyAccount from "./talent/pages/VerifyAccount/VerifyAccount";
import Setting from "./talent/pages/Setting/Setting";
import ForgotPasswordTalent from "./talent/pages/ResetPassword/ResetPassword";
import Congratulations from "./talent/components/Congratulations/Congratulations.jsx";
import Reactions from "./talent/pages/Reactions/Reactions.jsx";
import RoleSelection from "./Company/RoleSelect/RoleSelect.jsx";
import Talent from "./Company/Talen/Talents.jsx";
import TalentDetail from "./Company/Talen/TalentDetail.jsx";
import JobDetailPage from "./talent/pages/JobDetail/JobDetail.jsx";

// --- Skrolni tepaga qaytaruvchi yordamchi komponent ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- ProtectedRoute ---
const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/roleSelection" replace />;
  }

  return children ? children : <Outlet />;
};

function App() {
  const { settings } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${settings.darkMode ? "bg-[#121212]" : "bg-[#F8F9FA]"
        }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster position="top-right" />

      {/* Sahifa o'zgarganda skrolni tepaga surish */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />


        {/* 1. COMPANY SECTION - Faqat Sidebarli sahifalar */}
        <Route element={<Layout />}>
          <Route path="/company/signin" element={<SignInCompany />} />
          <Route path="/company/signup" element={<SignUpPage />} />
          <Route path="/company/signup/telegram" element={<TelegramVerify />} />
          <Route path="/company/signup/verify" element={<Verify />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/faq" element={<Faaq />} />
          <Route
            path="/talent/job-detail-page/:id" element={<JobDetailPage />}
          />
          <Route
            path="/company/forgot-password-1"
            element={<ForgotPassword1 />}
          />
          <Route
            path="/company/forgot-password-2"
            element={<ForgotPassword2 />}
          />
          <Route
            path="/company/forgot-password-3"
            element={<ForgotPassword3 />}
          />
          <Route
            path="/company/forgot-password-4"
            element={<ForgotPassword4 />}
          />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/talents" element={<Talents />} />
          <Route path="/roleSelection" element={<RoleSelection />} />

          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute>
                <DashboardCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/my-company"
            element={
              <ProtectedRoute>
                <MyCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/my-jobs"
            element={
              <ProtectedRoute>
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/job-detail/:id"
            element={
              <ProtectedRoute>
                <JobDetailPageCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/talents"
            element={
              <ProtectedRoute>
                <Talent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/talents/:id"
            element={
              <ProtectedRoute>
                <TalentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/faq"
            element={
              <ProtectedRoute>
                <Faq />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/contacts"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/settings"
            element={
              <ProtectedRoute>
                <Setting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/post-job"
            element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/notification"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
        </Route>









        {/* 2. AUTH SECTION - Bular sidebarsiz chiqadi */}
        <Route path="/company/signin" element={<SignInCompany />} />
        <Route path="/company/signup" element={<SignUpPage />} />
        <Route path="/company/signup/telegram" element={<TelegramVerify />} />
        <Route path="/company/signup/verify" element={<Verify />} />
        <Route
          path="/company/forgot-password-1"
          element={<ForgotPassword1 />}
        />
        <Route
          path="/company/forgot-password-2"
          element={<ForgotPassword2 />}
        />
        <Route
          path="/company/forgot-password-3"
          element={<ForgotPassword3 />}
        />
        <Route
          path="/company/forgot-password-4"
          element={<ForgotPassword4 />}
        />
        <Route path="/roleSelection" element={<RoleSelection />} />











        {/* 3. TALENT SECTION - Talent Headeri bilan */}
        <Route path="/talent/signin" element={<SignInTalent />} />
        <Route
          path="/talent/registration/step-1"
          element={<RegistrationForm />}
        />
        <Route
          path="/talent/registration/step-2"
          element={<RegistrationFormStepTwo />}
        />
        <Route
          path="/talent/registration/step-3"
          element={<RegistrationFormStepThree />}
        />
        <Route path="/talent/verify-account" element={<VerifyAccount />} />
        <Route
          path="/talent/forgot-password"
          element={<ForgotPasswordTalent />}
        />
        <Route path="/talent/jobs" element={<Jobs />} />
        <Route path="/talent/talents" element={<Talents />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/talent/dashboard" element={<DashboardTalent />} />
            <Route path="/talent/profile" element={<ProfilePage />} />
            <Route path="/talent/alerts" element={<JobAlerts />} />
            <Route path="/talent/matches" element={<JobMatches />} />
            <Route path="/talent/job-post/:id" element={<JobDetail />} />
            <Route path="/talent/job-details/:id" element={<CompanyDetail />} />
            <Route
              path="/talent/congratulations"
              element={<Congratulations />}
            />
            <Route path="/talent/settings" element={<Setting />} />
            <Route path="/talent/faq" element={<Faq />} />
            <Route path="/talent/contacts" element={<Contact />} />
            <Route path="/talent/reactions" element={<Reactions />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
