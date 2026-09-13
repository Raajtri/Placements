import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Home } from "./pages/public/Home";
import { About } from "./pages/public/About";
import { Placements } from "./pages/public/Placements";
import { Process } from "./pages/public/Process";
import { Companies } from "./pages/public/Companies";
import { Statistics } from "./pages/public/Statistics";
import { Reports } from "./pages/public/Reports";
import { Policy } from "./pages/public/Policy";
import { IndustrySpeaks } from "./pages/public/IndustrySpeaks";
import { AlumniTestimonials } from "./pages/public/AlumniTestimonials";
import { Team } from "./pages/public/Team";
import { Contact } from "./pages/public/Contact";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";

import { StudentLayout } from "./pages/student/StudentLayout";
import { StudentDashboard } from "./pages/student/Dashboard";
import { StudentProfile } from "./pages/student/Profile";
import { StudentDocuments } from "./pages/student/Documents";
import { StudentDrives } from "./pages/student/Drives";
import { StudentDriveDetail } from "./pages/student/DriveDetail";
import { StudentApplications } from "./pages/student/Applications";

import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminStudents } from "./pages/admin/Students";
import { AdminCompanies } from "./pages/admin/Companies";
import { AdminDrives } from "./pages/admin/Drives";
import { AdminApplications } from "./pages/admin/Applications";
import { AdminAnnouncements } from "./pages/admin/Announcements";
import { AdminStatistics } from "./pages/admin/Statistics";

function NotFound() {
  return <div className="container-page py-24 text-center text-slate-500">Page not found.</div>;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/process" element={<Process />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/industry-speaks" element={<IndustrySpeaks />} />
          <Route path="/testimonials" element={<AlumniTestimonials />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resources" element={<Policy />} />

          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<Login adminMode />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute roles={["STUDENT"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="drives" element={<StudentDrives />} />
            <Route path="drives/:id" element={<StudentDriveDetail />} />
            <Route path="applications" element={<StudentApplications />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN", "TPO"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="drives" element={<AdminDrives />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="statistics" element={<AdminStatistics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
