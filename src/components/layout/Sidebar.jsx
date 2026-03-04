import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Squares2X2Icon as Squares2X2SolidIcon } from "@heroicons/react/24/solid";
import admin_logo from "../../assets/admin_logo.svg";

const iconClass = "h-5 w-5 shrink-0";

export default function Sidebar({ isOpen = false, onClose }) {
  const [contentOpen, setContentOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const { pathname } = useLocation();

  const activeDropdown = useMemo(() => {
    if (pathname.startsWith("/admin/content-management")) return "content";
    if (pathname.startsWith("/admin/academics")) return "academics";
    if (pathname.startsWith("/admin/team")) return "team";
    return null;
  }, [pathname]);

  useEffect(() => {
    setContentOpen(activeDropdown === "content");
    setAcademicsOpen(activeDropdown === "academics");
    setTeamOpen(activeDropdown === "team");
  }, [activeDropdown]);

  const closeAllDropdowns = () => {
    setContentOpen(false);
    setAcademicsOpen(false);
    setTeamOpen(false);
  };

  const primaryGradient =
    "bg-[linear-gradient(90deg,_#F98349_0%,_#F65919_33.41%,_#FF2F39_100%)]";

  const listItemBase =
    "cursor-pointer rounded-md outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset active:scale-[0.99] active:bg-white/20";
  const navLink = `flex items-center gap-3 px-4 py-3 text-white no-underline hover:bg-white/10 ${listItemBase}`;
  const navLinkActive = `flex items-center gap-3 px-4 py-3 text-white no-underline ${primaryGradient} rounded-md cursor-default focus-visible:ring-2 focus-visible:ring-[#F65919]/40 focus-visible:ring-inset`;
  const subNavLink = `flex items-center gap-3 pl-4 py-2.5 text-white no-underline hover:bg-white/10 ${listItemBase}`;
  const subNavLinkActive = `flex items-center gap-3 pl-4 py-2.5 text-white no-underline ${primaryGradient} rounded-md cursor-default focus-visible:ring-2 focus-visible:ring-[#F65919]/40 focus-visible:ring-inset`;

  const NavItem = ({ to, icon: Icon, activeIcon: ActiveIcon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? navLinkActive : navLink)}
      onClick={() => {
        closeAllDropdowns();
        onClose?.();
      }}
    >
      {({ isActive }) => (
        <>
          {ActiveIcon && isActive ? (
            <ActiveIcon className={iconClass} />
          ) : (
            <Icon className={iconClass} />
          )}
          {children}
        </>
      )}
    </NavLink>
  );

  const SubNavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? subNavLinkActive : subNavLink)}
      onClick={() => onClose?.()}
    >
      {children}
    </NavLink>
  );

  const Section = ({ open, onToggle, icon: Icon, label, children }) => (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/10 ${
          open ? "bg-slate-800/70 text-white" : "text-slate-200"
        } ${listItemBase}`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`${iconClass} ${
              open ? "text-[#F98349]" : "text-slate-200"
            }`}
          />
          {label}
        </div>
        <ChevronDownIcon
          strokeWidth={2.5}
          className={`h-4 w-4 shrink-0 transition-transform ${
            open ? "rotate-180 text-[#F98349]" : "text-white/60"
          }`}
        />
      </button>
      {open && <div className="pl-1">{children}</div>}
    </div>
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col bg-slate-900 transition-transform duration-200 ease-in-out md:static md:z-auto md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-xl shadow-black/30" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <a href="/">
          <img
            src={admin_logo}
            alt="admin logo"
            className="hover:cursor-pointer"
          />
        </a>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:hidden"
        >
          <span className="sr-only">Close sidebar</span>
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        <NavItem
          to="/admin/dashboard"
          icon={Squares2X2Icon}
          activeIcon={Squares2X2SolidIcon}
        >
          Dashboard
        </NavItem>

        <Section
          open={contentOpen}
          onToggle={() => setContentOpen((o) => !o)}
          icon={DocumentTextIcon}
          label="Content"
        >
          <SubNavItem to="/admin/content-management/home">Home</SubNavItem>
          <SubNavItem to="/admin/content-management/about">About</SubNavItem>
        </Section>

        <Section
          open={academicsOpen}
          onToggle={() => setAcademicsOpen((o) => !o)}
          icon={AcademicCapIcon}
          label="Academic"
        >
          <SubNavItem to="/admin/academics/programs">Programs</SubNavItem>
          <SubNavItem to="/admin/academics/projects">Projects</SubNavItem>
        </Section>

        <Section
          open={teamOpen}
          onToggle={() => setTeamOpen((o) => !o)}
          icon={UserGroupIcon}
          label="Team"
        >
          <SubNavItem to="/admin/team/instructors">Instructors</SubNavItem>
        </Section>

        <NavItem to="/admin/contact" icon={EnvelopeIcon}>
          Contact
        </NavItem>
      </nav>

      {/* Logout */}
      <div className="p-3">
        <a
          href="#logout"
          className={`flex items-center gap-3 px-4 py-2 text-red-400 no-underline hover:bg-red-500/10 hover:text-red-300 ${listItemBase} active:bg-red-500/20 focus-visible:ring-red-400/50`}
        >
          <ArrowRightOnRectangleIcon className={iconClass} />
          Logout
        </a>
      </div>
    </aside>
  );
}
