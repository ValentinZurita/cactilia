import { NavbarBrand, NavbarIcons, NavbarLinks, NavbarToggler } from './navbar/index.js'
import { useState } from 'react';

export const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top container-fluid px-3 d-flex align-items-center">
      <NavbarToggler showMenu={showMenu} setShowMenu={setShowMenu}/>
      <NavbarBrand />
      <NavbarIcons />
      <NavbarLinks showMenu={showMenu} />
    </nav>
  );
};