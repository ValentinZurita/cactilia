import { NavbarBrand, NavbarIcons, NavbarLinks, NavbarToggler } from './navbar/index.js'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const {status, displayName} = useSelector((state) => state.auth)

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top container-fluid px-3 d-flex align-items-center">
      <NavbarToggler showMenu={showMenu} setShowMenu={setShowMenu}/>
      <NavbarBrand />
      <NavbarIcons status={status} displayName={displayName} />
      <NavbarLinks showMenu={showMenu} />
    </nav>
  );
};