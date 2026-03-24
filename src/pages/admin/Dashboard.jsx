import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AcademicCapIcon,
  FolderIcon,
  UsersIcon,
  UserGroupIcon,
  HomeIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import { getAllMembers } from "../../lib/services/memberService";
import { getAllPrograms } from "../../lib/services/programService";
import { getAllProjects } from "../../lib/services/projectService";
import { getAllStudents } from "../../lib/services/studentService";
import { getAdmin } from "../../utils/auth";
import Loader from "../../components/ui/Loader";

// Animated Number Counter
function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Stat Card - Exact transition pattern from CSS with modal colors
function StatCard({ title, count, subtitle, icon: Icon, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = Icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`relative w-full p-4 sm:p-6 lg:p-8 rounded-[10px] overflow-hidden z-0 font-sans bg-white border border-gray-200 shadow-sm group transition-all duration-500 hover:shadow-xl active:shadow-xl cursor-pointer touch-manipulation ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* animated circle - red-200 on hover */}
      <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-200 transition-transform duration-500 ease-out group-hover:scale-[35] sm:group-hover:scale-[50] group-active:scale-[35] sm:group-active:scale-[50] -z-10"></div>

      {/* corner - red-200 */}
      <div className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden bg-red-200 rounded-bl-[32px] sm:rounded-bl-[40px]">
        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 -mt-0.5 -mr-0.5 sm:-mt-1 sm:-mr-1" />
      </div>

      <p className="text-[1.5em] font-bold text-gray-800 mb-2 transition-colors duration-500 group-hover:text-gray-800">
        <AnimatedCounter value={count} />
      </p>

      <p className="text-base leading-6 text-gray-600 transition-colors duration-500 group-hover:text-gray-600">
        {title}
      </p>
      
      {subtitle && (
        <p className="text-sm text-gray-500 transition-colors duration-500 group-hover:text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Quick Action Button - Exact transition pattern from CSS with modal colors
function QuickActionButton({ text, link, icon, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      to={link}
      className={`relative w-full p-3 sm:p-4 rounded-[10px] overflow-hidden z-0 font-sans bg-white border border-gray-200 shadow-sm group transition-all duration-500 hover:shadow-xl active:shadow-xl cursor-pointer flex items-center gap-3 touch-manipulation ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* animated circle - red-200 on hover */}
      <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-200 transition-transform duration-500 ease-out group-hover:scale-[35] sm:group-hover:scale-[50] group-active:scale-[35] sm:group-active:scale-[50] -z-10"></div>

      {/* corner - red-200 */}
      <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden bg-red-200 rounded-bl-[24px] sm:rounded-bl-[32px]">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 -mt-0.5 -mr-0.5 sm:-mt-1 sm:-mr-1" />
      </div>

      <p className="text-base font-bold text-gray-800 transition-colors duration-500 group-hover:text-gray-800 group-active:text-gray-800">
        {text}
      </p>
    </Link>
  );
}

// Custom Tooltip for Area Chart - Modern dark theme
function AreaTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl p-4 border border-gray-700/50">
        <p className="font-bold text-sm mb-3 text-gray-300 border-b border-gray-700 pb-2">{label}</p>
        <div className="flex items-center justify-between gap-6 text-sm py-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-400">Active:</span>
          </div>
          <span className="font-bold text-green-400">+{data?.newProjectsActive || 0}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm py-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-gray-400">Inactive:</span>
          </div>
          <span className="font-bold text-gray-400">+{data?.newProjectsInactive || 0}</span>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2 flex items-center justify-between gap-6 text-sm py-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-400">Total:</span>
          </div>
          <span className="font-bold text-red-400">{data?.totalProjects || 0}</span>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Bar Chart - Modern dark theme
function BarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl px-5 py-3 border border-gray-700/50">
        <p className="font-bold text-sm">{data.fullName}</p>
        <p className="text-sm text-gray-400">{data.projects} projects</p>
        <p className={`text-xs mt-1 ${data.isActive ? 'text-green-400' : 'text-red-400'}`}>
          {data.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    );
  }
  return null;
}

// Chart wrapper component - Modern card style
function ChartContainer({ title, icon: Icon, children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const IconComponent = Icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Only render children after animation completes (500ms duration)
      setTimeout(() => setIsReady(true), 500);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 focus:outline-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {title && Icon && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      {isReady ? children : <div className="h-[250px] sm:h-[300px]" />}
    </div>
  );
}

// Process projects data to get monthly growth data with active/inactive breakdown
function processMonthlyData(projects, year = null) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [];
  }

  const now = new Date();
  const currentYear = year || now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const isCurrentYear = currentYear === now.getFullYear();
  const monthsToShow = isCurrentYear ? currentMonth + 1 : 12; // Only show up to current month if this year
  
  const months = [];

  // Get months up to current month (or all 12 if not current year)
  for (let i = 0; i < monthsToShow; i++) {
    const date = new Date(currentYear, i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    months.push({
      month: monthName,
      sortOrder: i,
      newProjects: 0,
      newProjectsActive: 0,
      newProjectsInactive: 0,
      totalProjects: 0,
      totalProjectsActive: 0,
      totalProjectsInactive: 0,
    });
  }

  // Filter projects by year and sort - check both created_at and createdAt
  const yearProjects = projects.filter(p => {
    if (!p) return false;
    const createdAt = p.created_at || p.createdAt;
    if (!createdAt) return false;
    const projectYear = new Date(createdAt).getFullYear();
    return projectYear === currentYear;
  }).sort((a, b) => {
    const aDate = new Date(a.created_at || a.createdAt);
    const bDate = new Date(b.created_at || b.createdAt);
    return aDate - bDate;
  });

  // Count projects by month and track active/inactive
  yearProjects.forEach((project) => {
    if (!project) return;
    const createdAt = project.created_at || project.createdAt;
    if (!createdAt) return;
    const createdDate = new Date(createdAt);
    const monthIndex = createdDate.getMonth();
    
    // Only count if month is within our displayed range
    if (monthIndex < monthsToShow) {
      const isActive = project.is_featured === true;
      months[monthIndex].newProjects += 1;
      if (isActive) {
        months[monthIndex].newProjectsActive += 1;
      } else {
        months[monthIndex].newProjectsInactive += 1;
      }
    }
  });

  // Calculate cumulative totals per month
  let runningActive = 0;
  let runningInactive = 0;
  months.forEach((m) => {
    runningActive += m.newProjectsActive;
    runningInactive += m.newProjectsInactive;
    m.totalProjects = runningActive + runningInactive;
    m.totalProjectsActive = runningActive;
    m.totalProjectsInactive = runningInactive;
  });

  return months;
}

// Get available years from projects
function getAvailableYears(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [new Date().getFullYear()];
  }

  const years = new Set();
  projects.forEach((project) => {
    if (!project) return;
    const createdAt = project.created_at || project.createdAt;
    if (createdAt) {
      const year = new Date(createdAt).getFullYear();
      years.add(year);
    }
  });
  
  // Always include current year
  years.add(new Date().getFullYear());
  
  return Array.from(years).sort((a, b) => b - a); // Sort descending
}

// Generate consistent unique colors based on the number of items (deterministic)
function generateDynamicColors(count) {
  // Extended palette of visually distinct colors
  const palette = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#84CC16', // Lime
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#A855F7', // Purple
    '#0EA5E9', // Sky
    '#22C55E', // Green
  ];
  
  // If we have more programs than palette colors, cycle through with slight variations
  const colors = [];
  for (let i = 0; i < count; i++) {
    const baseColor = palette[i % palette.length];
    
    // For colors beyond palette, add opacity variation
    if (i >= palette.length) {
      const opacity = 1 - Math.floor(i / palette.length) * 0.15;
      colors.push(baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0'));
    } else {
      colors.push(baseColor);
    }
  }
  
  return colors;
}


// Process projects by program - includes all programs (active and inactive)
// Uses is_active field: false = gray bar (inactive), true = colored bar (active)
function processProjectsByProgram(programs, projects) {
  if (!Array.isArray(programs) || !Array.isArray(projects)) {
    return [];
  }

  // Deduplicate programs by both ID and program_name
  const seenIds = new Set();
  const seenNames = new Set();
  const uniquePrograms = programs.filter((program) => {
    if (!program || !program.program_name) return false;
    // Skip if we've already seen this ID or this name
    if (seenIds.has(program.id) || seenNames.has(program.program_name)) return false;
    seenIds.add(program.id);
    seenNames.add(program.program_name);
    return true;
  });

  // Map all programs to include their project count (including zero)
  const programsWithProjects = uniquePrograms.map((program) => {
    // Count projects linked to this program using program_name
    // Backend returns projects with flattened 'programs' array: [{id, program_name}, ...]
    const projectCount = projects.filter((project) => {
      if (!project || !project.programs) return false;
      // Match by program_name in project.programs array
      const programNames = project.programs.map(p => p.program_name) || [];
      return programNames.includes(program.program_name);
    }).length;

    // is_active determines both color and active/inactive status
    // is_active = true → colored bar (active)
    // is_active = false → gray bar (inactive)
    const isActive = program.is_active === true;
    
    return {
      programId: program.id,
      originalName: program.program_name || 'Unnamed',
      projects: projectCount,
      isActive: isActive,
    };
  }).sort((a, b) => b.projects - a.projects);

  // Generate unique university-style program codes (no numbers)
  function generateProgramCode(name, usedCodes) {
    const words = name.trim().split(/\s+/);

    let code = "";

    // Step 1: first letters
    if (words.length >= 3) {
      code = words.slice(0, 3).map(w => w[0]).join("");
    } else if (words.length === 2) {
      code = words[0][0] + words[1].slice(0, 2);
    } else {
      code = words[0].slice(0, 3);
    }

    code = code.toUpperCase();

    // Step 2: ensure uniqueness without numbers
    if (!usedCodes.includes(code)) {
      usedCodes.push(code);
      return code;
    }

    // Step 3: try alternative combinations
    const letters = name.replace(/\s+/g, "").toUpperCase();

    for (let i = 0; i < letters.length - 2; i++) {
      const candidate = letters.slice(i, i + 3);
      if (!usedCodes.includes(candidate)) {
        usedCodes.push(candidate);
        return candidate;
      }
    }

    // fallback (rare case)
    let index = 0;
    while (true) {
      const candidate = letters.slice(index, index + 4);
      if (!usedCodes.includes(candidate)) {
        usedCodes.push(candidate);
        return candidate;
      }
      index++;
    }
  }

  // Generate program codes
  const usedNames = [];
  const programsWithNames = programsWithProjects.map((item) => {
    const code = generateProgramCode(item.originalName, usedNames);

    return {
      ...item,
      name: code,
      fullName: item.originalName,
    };
  });

  // Generate dynamic colors for active (is_active=true) programs only
  const activePrograms = programsWithNames.filter(p => p.isActive);
  const colors = generateDynamicColors(activePrograms.length);
  
  // Assign colors: gray for inactive (is_active=false), dynamic colors for active
  const colorMap = {};
  activePrograms.forEach((program, index) => {
    colorMap[program.programId] = colors[index];
  });

  return programsWithNames.map((item) => ({
    ...item,
    fill: item.isActive ? (colorMap[item.programId] || '#10B981') : '#9CA3AF', // Green for active, gray for inactive
  }));
}

export default function Dashboard() {
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get current admin info
  const admin = getAdmin();

  // Query for all data with caching - dramatically reduces API calls
  // Each query is cached for 10 minutes, so navigating between pages won't refetch
  const { data: membersData = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await getAllMembers();
      return res?.data || res || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: programsData = [], isLoading: isProgramsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await getAllPrograms();
      return res?.data || res || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: projectsData = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await getAllProjects();
      return res?.data || res || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: studentsData = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await getAllStudents();
      return res?.data || res || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const isLoading = isMembersLoading || isProgramsLoading || isProjectsLoading || isStudentsLoading;

  const data = {
    programs: programsData,
    projects: projectsData,
    members: membersData,
    students: studentsData,
  };

  // Page load animations with staggered timing
  useEffect(() => {
    const titleTimer = setTimeout(() => setIsTitleVisible(true), 0);
    const timer = setTimeout(() => setIsPageVisible(true), 100);
    // Quick Actions sidebar animation - starts after charts, at same time as first item
    const quickTimer = setTimeout(() => setIsQuickActionsVisible(true), 800);
    
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(timer);
      clearTimeout(quickTimer);
    };
  }, []);

  // Calculate instructor count
  const instructorCount = useMemo(() => {
    if (!Array.isArray(data.members)) return 0;
    return data.members.filter((m) => m && m.is_instructor === true).length;
  }, [data.members]);

  // Process monthly data
  const monthlyData = useMemo(() => {
    return processMonthlyData(data.projects, selectedYear);
  }, [data.projects, selectedYear]);

  // Get available years from projects
  const availableYears = useMemo(() => {
    return getAvailableYears(data.projects);
  }, [data.projects]);

  // Calculate Y-axis configuration for Project Growth chart
  const maxProjects = Math.max(...monthlyData.map(d => d.totalProjects), 0);
  let yAxisMax;
  let yAxisTicks;
  
  if (maxProjects <= 10) {
    yAxisMax = maxProjects + 2;
    yAxisTicks = Array.from({ length: yAxisMax + 1 }, (_, i) => i);
  } else if (maxProjects <= 50) {
    yAxisMax = Math.ceil((maxProjects + 5) / 5) * 5;
    yAxisTicks = Array.from({ length: yAxisMax / 5 + 1 }, (_, i) => i * 5);
  } else if (maxProjects <= 100) {
    yAxisMax = Math.ceil((maxProjects + 10) / 10) * 10;
    yAxisTicks = Array.from({ length: yAxisMax / 10 + 1 }, (_, i) => i * 10);
  } else {
    yAxisMax = Math.ceil((maxProjects + 20) / 20) * 20;
    yAxisTicks = Array.from({ length: yAxisMax / 20 + 1 }, (_, i) => i * 20);
  }

  // Process program distribution
  const projectsByProgram = useMemo(() => {
    return processProjectsByProgram(data.programs, data.projects);
  }, [data.programs, data.projects]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={`min-h-screen bg-gray-100 p-4 sm:p-6 transition-opacity duration-700 ${isPageVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Page Header with Title and User Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className={`text-xl sm:text-2xl font-semibold text-gray-800 transform transition-all duration-500 ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          Dashboard
        </h1>

        {/* User Profile Card - Avatar + username with hover tooltip */}
        {admin && (
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-2 py-1.5 shadow-sm cursor-default">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {admin.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {admin.username}
              </span>
            </div>
            {/* Tooltip on hover */}
            <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-3 px-4 shadow-xl whitespace-nowrap">
                <p className="font-semibold text-sm">{admin.username}</p>
                <p className="text-gray-400 mt-1">{admin.email}</p>
                {admin.role && (
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    admin.role === 'super_admin' 
                      ? 'bg-purple-500/30 text-purple-200' 
                      : 'bg-blue-500/30 text-blue-200'
                  }`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
        {/* MAIN CONTENT */}
        <div className="col-span-12 xl:col-span-9 min-w-0">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Programs"
              count={data.programs.length}
              subtitle="Academic programs"
              icon={AcademicCapIcon}
              delay={100}
            />
            <StatCard
              title="Projects"
              count={data.projects.length}
              subtitle="Student projects"
              icon={FolderIcon}
              delay={200}
            />
            <StatCard
              title="Instructors"
              count={instructorCount}
              subtitle="Team members"
              icon={UsersIcon}
              delay={300}
            />
            <StatCard
              title="Students"
              count={data.students.length}
              subtitle="Enrolled students"
              icon={UserGroupIcon}
              delay={400}
            />
          </div>

          {/* Charts with modern design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Project Growth - Modern design */}
            {/* Project Growth - Modern design */}
            <ChartContainer delay={500}>
              {/* Year Filter in Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Project Growth</h2>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => document.getElementById('year-dropdown').classList.toggle('hidden')}
                    className="flex items-center justify-between bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 min-w-[100px] hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer transition-colors duration-200 shadow-sm"
                  >
                    <span>{selectedYear}</span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-2" />
                  </button>
                  <div id="year-dropdown" className="hidden absolute right-0 z-10 mt-1 w-full min-w-[100px] rounded-lg border border-gray-300 bg-white shadow-lg max-h-48 overflow-y-auto">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYear(year);
                          document.getElementById('year-dropdown').classList.add('hidden');
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors duration-150 ${
                          selectedYear === year ? 'text-red-600 font-medium bg-red-50' : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] min-w-0 focus:outline-none">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out">
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      width={35}
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={0}
                      tick={{ fill: '#9CA3AF' }}
                      domain={[0, yAxisMax]}
                      ticks={yAxisTicks}
                      allowDecimals={false}
                    />
                    <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#EF4444', strokeWidth: 1 }} />
                    {/* Inactive projects (gray) - behind active */}
                    <Area
                      type="monotone"
                      dataKey="totalProjectsInactive"
                      name="Inactive"
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      fill="url(#colorInactive)"
                      animationBegin={500}
                      strokeLinecap="round"
                      dot={false}
                    />
                    {/* Active projects (green) - on top */}
                    <Area
                      type="monotone"
                      dataKey="totalProjectsActive"
                      name="Active"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#colorActive)"
                      animationBegin={500}
                      strokeLinecap="round"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">{selectedYear} Total Projects</p>
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">+{monthlyData.reduce((sum, m) => sum + m.newProjects, 0)}</span>
                    <span className="text-sm text-gray-400">
                      (<span className="text-green-600">+{monthlyData.reduce((sum, m) => sum + m.newProjectsActive, 0)}</span>
                      <span className="mx-1">/</span>
                      <span className="text-gray-500">+{monthlyData.reduce((sum, m) => sum + m.newProjectsInactive, 0)}</span>)
                    </span>
                  </div>
                </div>
              </div>
            </ChartContainer>

            {/* Program Distribution - Modern design */}
            <ChartContainer title="Program Distribution" icon={ChartBarIcon} delay={600}>
              <div className="h-[250px] sm:h-[300px] chart-no-focus min-w-0 focus:outline-none">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectsByProgram} margin={{ top: 10, right: 20, left: 20, bottom: 30 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={true} />
                    <XAxis 
                      dataKey="name"
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF' }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      type="number"
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF' }}
                      domain={[0, 'dataMax + 1']}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.08)' }} />
                    <Bar dataKey="projects" radius={[6, 6, 0, 0]} animationBegin={600} barCategoryGap="20%">
                      {projectsByProgram.map((entry, index) => (
                        <Cell key={index} fill={entry?.fill || '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Total Programs</p>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-green-600">{projectsByProgram.filter(p => p.isActive).length}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-2xl font-bold text-gray-500">{projectsByProgram.filter(p => !p.isActive).length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Projects</p>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-green-600">{data.projects.filter(p => p.is_featured === true).length}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-lg font-bold text-gray-500">{data.projects.filter(p => p.is_featured === false).length}</span>
                  </div>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Quick Actions */}
        <div className="col-span-12 xl:col-span-3 overflow-hidden mt-4 xl:mt-0">
          <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-xl transition-all duration-500 ${isQuickActionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <QuickActionButton text="Manage Home" link="/admin/content/home" icon={HomeIcon} delay={500} />
              <QuickActionButton text="Manage About" link="/admin/content/about" icon={InformationCircleIcon} delay={550} />
              <QuickActionButton text="Manage Programs" link="/admin/academics/programs" icon={AcademicCapIcon} delay={600} />
              <QuickActionButton text="Manage Projects" link="/admin/academics/projects" icon={FolderIcon} delay={650} />
              <QuickActionButton text="Manage Members" link="/admin/team/members" icon={UsersIcon} delay={700} />
              <QuickActionButton text="Manage Students" link="/admin/team/students" icon={UserGroupIcon} delay={750} />
              <QuickActionButton text="Manage Contact" link="/admin/contact" icon={EnvelopeIcon} delay={800} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
