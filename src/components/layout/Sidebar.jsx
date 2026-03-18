import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Squares2X2Icon as Squares2X2SolidIcon } from "@heroicons/react/24/solid";
import logo_image from "../../assets/logo/logo_image.svg";

const iconClass = "h-5 w-5 shrink-0";

export default function Sidebar({ isOpen = false, onClose, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const { pathname } = useLocation();

  const showExpanded = isExpanded || isOpen;

  const activeDropdown = useMemo(() => {
    if (pathname.startsWith("/admin/content")) return "content";
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

  const navLinkCollapsed =
    "flex items-center justify-center px-0 py-3 text-white no-underline hover:bg-white/10 rounded-md " +
    listItemBase;
  const navLinkActiveCollapsed =
    "flex items-center justify-center px-0 py-3 text-white no-underline rounded-md " +
    primaryGradient +
    " cursor-default focus-visible:ring-2 focus-visible:ring-[#F65919]/40 focus-visible:ring-inset";

  const NavItem = ({ to, icon: Icon, activeIcon: ActiveIcon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        showExpanded
          ? isActive
            ? navLinkActive
            : navLink
          : isActive
            ? navLinkActiveCollapsed
            : navLinkCollapsed
      }
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
          {showExpanded && (
            <span className="whitespace-nowrap">{children}</span>
          )}
        </>
      )}
    </NavLink>
  );

  const SubNavItem = ({ to, children }) =>
    showExpanded ? (
      <NavLink
        to={to}
        className={({ isActive }) => (isActive ? subNavLinkActive : subNavLink)}
        onClick={() => onClose?.()}
      >
        {children}
      </NavLink>
    ) : null;

  const Section = ({ open, onToggle, icon: Icon, label, children }) => (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={
          showExpanded
            ? `flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/10 ${
                open ? "bg-slate-800/70 text-white" : "text-slate-200"
              } ${listItemBase}`
            : `flex w-full items-center justify-center px-0 py-3 text-slate-200 hover:bg-white/10 ${listItemBase}`
        }
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`${iconClass} ${
              showExpanded && open ? "text-[#F98349]" : "text-slate-200"
            }`}
          />
          {showExpanded && <span className="whitespace-nowrap">{label}</span>}
        </div>
        {showExpanded && (
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-4 w-4 shrink-0 transition-transform ${
              open ? "rotate-180 text-[#F98349]" : "text-white/60"
            }`}
          />
        )}
      </button>
      {showExpanded && open && <div className="pl-1">{children}</div>}
    </div>
  );

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col overflow-hidden bg-slate-900 transition-[width,transform] duration-200 ease-in-out md:static md:z-auto md:translate-x-0 ${
        showExpanded ? "w-64" : "w-16"
      } ${
        isOpen ? "translate-x-0 shadow-xl shadow-black/30" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="relative flex min-h-24 items-center justify-center px-4 py-6">
        {/* Brand */}
        <a
          href="/admin/dashboard"
          className="flex items-center gap-3 overflow-hidden"
        >
          {/* Logo */}
          <img
            src={logo_image}
            alt="logo"
            className="h-16 w-16 object-contain"
          />

          {/* Animated Text */}
          <span
            className={`
            text-2xl whitespace-nowrap font-semibold tracking-wide
            transition-all duration-300 ease-in-out
            ${
              showExpanded
                ? "max-w-[200px] opacity-100 translate-x-0"
                : "max-w-0 opacity-0 -translate-x-2"
            }
            overflow-hidden
          `}
          >
            <span className="bg-[linear-gradient(90deg,#F98349_0%,#F65919_33.41%,#FF2F39_100%)] bg-clip-text text-transparent font-bold">
              PIT
            </span>{" "}
            <span className="text-white">Admin</span>
          </span>
        </a>
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
          <SubNavItem to="/admin/content/home">Home</SubNavItem>
          <SubNavItem to="/admin/content/about">About</SubNavItem>
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
          <SubNavItem to="/admin/team/members">Members</SubNavItem>
          <SubNavItem to="/admin/team/students">Students</SubNavItem>
        </Section>

        <NavItem to="/admin/contact" icon={EnvelopeIcon}>
          Contact
        </NavItem>

        <NavItem to="/admin/management" icon={ShieldCheckIcon}>
          Admin Management
        </NavItem>
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={onLogout}
          className={`flex items-center text-red-400 no-underline hover:bg-red-500/10 hover:text-red-300 ${listItemBase} active:bg-red-500/20 focus-visible:ring-red-400/50 ${
            showExpanded ? "gap-3 px-4 py-2" : "justify-center px-0 py-2"
          }`}
        >
          <ArrowRightOnRectangleIcon className={iconClass} />
          {showExpanded && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
