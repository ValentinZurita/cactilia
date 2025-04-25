// components/NavbarBrand.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../../store/slices/siteConfigSlice.js';
import { Link } from 'react-router-dom'; // Import Link for navigation

export const NavbarBrand = () => {
  const companyInfo = useSelector(selectCompanyInfo);

  // Use navbarBrandText if available, otherwise fallback to name, then to default
  const brandText = companyInfo?.navbarBrandText || companyInfo?.name || 'Cactilia';

  return (
    <Link to="/" className="navbar-brand fw-bold text-green-2 me-auto d-flex align-items-center">
      {/* Always display the determined brandText */}
      {brandText}
    </Link>
  );
};