import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import PublicUserProfilePage from "./Pages/PublicUserProfilePage.jsx";
import WelcomePage from "./Pages/WelcomePage.jsx";
import ExplorePage from "./Pages/ExplorePage.jsx";
import Identity from "./Pages/Welcome/Identity.jsx";
import Interests from "./Pages/Welcome/Interests.jsx";
import InvestmentPlans from "./Pages/Welcome/InvestmentPlans.jsx";
import PublicProfile from "./Pages/Welcome/PublicProfile.jsx";
import Finish from "./Pages/Welcome/Finish.jsx";
import RaiseMoneyPage from "./Pages/RaiseMoney/RaiseMoneyPage.jsx";
import RS_start from "./Pages/RaiseMoney/RS_start.jsx";
import { ProtectedRoute } from "./lib/AuthContext.jsx";
import CompanyPage from "./Pages/CompanyPage.jsx";
import RaiseMoneyEditor from "./Pages/RaiseMoney/RaiseMoneyEditor.jsx";
import RaiseMoneyRound from "./Pages/RaiseMoney/RaiseMoneyRound.jsx";
import RaiseMoneyTeam from "./Pages/RaiseMoney/RaiseMoneyTeam.jsx";
import ChatPage from "./Pages/ChatPage.jsx";
import TaxDocumentsPage from "./Pages/TaxDocumentsPage.jsx";
import WatchlistPage from "./Pages/WatchlistPage.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar /> <LandingPage />
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Navbar />
          <LoginPage />
        </>
      ),
    },
    {
      path: "/signup",
      element: (
        <>
          <Navbar />
          <SignupPage />
        </>
      ),
    },
    {
      path: "/user/:username",
      element: (
        <>
          <Navbar />
          <PublicUserProfilePage />
        </>
      ),
    },
    {
      path: "/welcome",
      element: (
        <ProtectedRoute>
          <WelcomePage />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="identity" replace /> },
        { path: "identity", element: <Identity /> },
        { path: "interests", element: <Interests /> },
        { path: "investment_plans", element: <InvestmentPlans /> },
        { path: "public_profile", element: <PublicProfile /> },
        { path: "finish", element: <Finish /> },
      ],
    },
    {
      path: "/explore",
      element: (
        <>
          <Navbar />
          <ExplorePage />
        </>
      ),
    },
    {
      path: "/watchlist",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <WatchlistPage />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money",
      element: (
        <>
          <ProtectedRoute>
            {" "}
            <Navigate to="/raise_money/start" replace />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/:startupName",
      element: (
        <>
          <ProtectedRoute>
            <Navigate to="/raise_money/:startupName/overview" replace />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/:startupName/overview",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <RaiseMoneyPage />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/start",
      element: (
        <>
          <ProtectedRoute>
            <RS_start />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/:startupName/editor",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <RaiseMoneyEditor />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/:startupName/investment",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <RaiseMoneyRound />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/raise_money/:startupName/team",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <RaiseMoneyTeam />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/company/:companyName",
      element: (
        <>
          <Navbar />
          <CompanyPage />
        </>
      ),
    },
    {
      path: "/chat",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <ChatPage />
          </ProtectedRoute>
        </>
      ),
    },
    {
      path: "/tax-documents",
      element: (
        <>
          <ProtectedRoute>
            <Navbar />
            <TaxDocumentsPage />
          </ProtectedRoute>
        </>
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
