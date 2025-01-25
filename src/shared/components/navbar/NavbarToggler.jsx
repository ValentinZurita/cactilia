
export const NavbarToggler = ({ showMenu, setShowMenu }) => (
  <button
    className="navbar-toggler navbar-toggler-thin-green square-toggler me-3"
    type="button"
    aria-label="Toggle navigation"
    aria-expanded={showMenu}
    onClick={() => setShowMenu(!showMenu)}
  >

    {/* 3 lines*/}
    <span className="navbar-toggler-icon"></span>
  </button>
);