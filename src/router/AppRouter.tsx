import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "../App";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import TrackListPage from "../pages/TrackListPage";
import WordDetailPage from "../pages/WordDetailPage";
import RequireAuth from "./RequireAuth";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/words" element={<App />} />
          <Route path="/tracks" element={<TrackListPage />} />
          <Route path="/mypage" element={<ProfilePage />} />
          <Route path="/profile" element={<Navigate to="/mypage" replace />} />
          <Route path="/words/:wordId" element={<WordDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
