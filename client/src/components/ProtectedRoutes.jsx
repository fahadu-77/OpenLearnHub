import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import DashboardPage from '../pages/DashboardPage';
import CreateCoursePage from '../pages/CreateCoursePage';
import CategoryCoursesPage from '../pages/CategoryCoursesPage';

import { loadUser } from '../actions/authActions';
import { authError } from '../slices/authSlice';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminFlags from '../pages/admin/Flags';
import AdminCourses from '../pages/admin/Courses';
import AdminInstructors from '../pages/admin/Instructors';
import AdminUsers from '../pages/admin/Users';
import AdminPayments from '../pages/admin/Payments';
import InstructorDashboard from '../pages/InstructorDashboard';

export function ProtectedRoutes() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const isLoaded = useSelector(state => state.auth.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      if (token) {
        dispatch(loadUser());
      } else {
        dispatch(authError());
      }
    }
  }, [isLoaded, dispatch, token]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<CategoryCoursesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/course/:id" element={<CourseDetailsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* New Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>

      <Route path="/instructor/dashboard" element={<InstructorDashboard />} />

      <Route path="/create-course" element={<CreateCoursePage />} />
    </Routes>
  );
}