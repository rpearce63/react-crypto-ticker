import React from "react";
import { Link } from "react-router-dom";
const Header = props => {
  const { branding } = props;
  return (
    <nav className="navbar mb-3 pt-3 pb-3 py-0  text-sm-center text-md-left">
      <div className="container">
        <a href="/" className="navbar-brand">
          {branding}
        </a>
        <div className="header-links">
          <Link to="/single" className="navbar-brand">
            Single
          </Link>
          <Link to="/dual" className="navbar-brand">
            Dual
          </Link>
        </div>
      </div>
    </nav>
  );
};

Header.defaultProps = {
  branding: "Real-Time Cryptocurrency Dashboard",
};

export default Header;
