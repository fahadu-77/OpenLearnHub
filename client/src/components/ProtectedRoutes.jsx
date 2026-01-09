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
import AdminDashboard from '../pages/AdminDashboard';

import { loadUser } from '../actions/authActions';
import { authError } from '../slices/authSlice';

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
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/create-course" element={<CreateCoursePage />} />
    </Routes>
  );
}