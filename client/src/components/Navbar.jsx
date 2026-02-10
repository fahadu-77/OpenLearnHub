import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={user?.role === "admin" ? "/admin/dashboard" : "/"}
            className="flex items-center"
          >
            <img src="/logo-full.svg" alt="OpenLearnHub" className="h-8" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                {user?.role === "student" && (
                  <Link
                    to="/#categories"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors "
                  >
                    Browse
                  </Link>
                )}
                {user?.role !== "admin" && (
                  <Link
                    to="/create-course"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors "
                  >
                    Create Channel
                  </Link>
                )}
                {user?.role !== "admin" && (
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    My Learning
                  </Link>
                )}
                {user?.role === "instructor" && (
                  <Link
                    to="/instructor/dashboard"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus-visible:outline-none"
                  >
                    My Teachings
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="text-red-600 hover:text-red-900 font-medium transition-colors focus:outline-none focus-visible:outline-none"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {user?.name}
                  </span>
                </div>
                <Link
                  to="/#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Browse
                </Link>
                <Link
                  to="/create-course"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Create Channel
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  My Learning
                </Link>

                {user?.role === "instructor" && (
                  <Link
                    to="/instructor/dashboard"
                    className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Teachings
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gray-900 text-white rounded-lg font-medium text-center hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav >
  );
};
