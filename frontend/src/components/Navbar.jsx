import React, { useState, useRef, useEffect } from "react";
import { Close, Menu, PersonAdd, Search, ShoppingBag } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout, removeSuccess } from "../features/user/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(
      keyword.trim()
        ? `/products/?keyword=${encodeURIComponent(keyword)}`
        : "/products"
    );
    setKeyword("");
    setIsMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Dropdown actions
  const dashboard = () => { navigate("/admin/dashboard"); setIsDropdownOpen(false); setIsMenuOpen(false); };
  const orders = () => { navigate("/orders/user"); setIsDropdownOpen(false); setIsMenuOpen(false); };
  const account = () => { navigate("/me"); setIsDropdownOpen(false); setIsMenuOpen(false); };
  const myCart = () => { navigate("/cart"); setIsDropdownOpen(false); setIsMenuOpen(false); };
  const logoutUser = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success("Logout Successful", { position: "top-center", autoClose: 3000 });
        dispatch(removeSuccess());
        navigate("/login");
      })
      .catch((error) => {
        toast.error(error.message || "Logout Failed", { position: "top-center", autoClose: 3000 });
      });
  };

  const options = [
    { name: "Dashboard", funcName: dashboard, admin: true },
    { name: "Orders", funcName: orders },
    { name: "Account", funcName: account },
    { name: `Cart(${cartItems.length})`, funcName: myCart },
    { name: "Logout", funcName: logoutUser },
  ].filter(opt => !opt.admin || user?.role === "admin");

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg fixed w-full top-0 left-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-10 py-3">

        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-wide text-blue-400">
          <Link to="/" className="hover:text-blue-500 transition">
            First<span className="text-white">Shop</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          {/* Links */}
          <div className="flex space-x-8 text-sm font-medium">
            {["Home", "Products", "About Us", "Contact"].map((item, i) => (
              <Link
                key={i}
                to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                className="relative group"
              >
                <span className="group-hover:text-blue-400 transition">{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-gray-800 rounded-full overflow-hidden border border-gray-700 focus-within:ring-2 focus-within:ring-blue-400"
          >
            <input
              type="text"
              placeholder="Search product..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="px-3 py-1.5 bg-transparent outline-none text-sm text-gray-200 w-40 placeholder-gray-400"
            />
            <button type="submit" className="px-2 hover:text-blue-400">
              <Search />
            </button>
          </form>

          {/* Cart */}
          <Link to="/cart" className="relative hover:text-blue-400 transition">
            <ShoppingBag fontSize="medium" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-1.5">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Avatar / Register */}
          {!isAuthenticated ? (
            <Link to="/register" className="hover:text-blue-400 transition" title="Register">
              <PersonAdd fontSize="medium" />
            </Link>
          ) : (
            <div ref={dropdownRef} className="relative">
              <img
                src={user?.avatar?.url || "/images/profile.png"}
                alt="User"
                className="w-8 h-8 rounded-full object-cover border-2 border-indigo-400 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white shadow-2xl rounded-2xl overflow-hidden z-50">
                  {options.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.funcName}
                      className={`w-full text-left px-5 py-3 text-gray-700 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all ${idx !== options.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-blue-400 transition"
        >
          {isMenuOpen ? <Close /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 py-5 space-y-4 animate-slideDown">
          {/* Links */}
          <div className="flex flex-col items-center space-y-4">
            {["Home", "Products", "About Us", "Contact"].map((item, i) => (
              <Link
                key={i}
                to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                onClick={toggleMenu}
                className="text-gray-200 hover:text-blue-400 text-lg font-medium transition"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-gray-800 rounded-full px-3 py-2 w-11/12 mx-auto"
          >
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-grow bg-transparent outline-none text-sm px-2 text-gray-200 placeholder-gray-400"
            />
            <button type="submit" className="hover:text-blue-400">
              <Search />
            </button>
          </form>

          {/* Cart + Avatar / Register */}
          <div className="flex justify-center items-center space-x-6 pt-2">
            <Link to="/cart" onClick={toggleMenu} className="relative">
              <ShoppingBag />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-1.5">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {!isAuthenticated ? (
              <Link to="/register" onClick={toggleMenu} className="hover:text-blue-400 transition">
                <PersonAdd />
              </Link>
            ) : (
              <div ref={dropdownRef} className="relative">
                <img
                  src={user?.avatar?.url || "/images/profile.png"}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-400 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white shadow-2xl rounded-2xl overflow-hidden z-50">
                    {options.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { item.funcName(); toggleMenu(); }}
                        className={`w-full text-left px-5 py-3 text-gray-700 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all ${idx !== options.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
