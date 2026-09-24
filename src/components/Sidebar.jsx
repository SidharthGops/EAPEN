import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const LINKS = [
  { to: "/", label: "Chat", end: true },
  { to: "/history", label: "History" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">EAPEN</span>
        <span className="sidebar-brand-sub">Emotionally aware presence</span>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " is-active" : "")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-status">
          <span className="status-dot" />
          Backend connected
        </div>
      </div>
    </aside>
  );
}
