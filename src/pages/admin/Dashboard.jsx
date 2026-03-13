import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import Loading from "../../components/ui/Loading";

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
      className={`relative max-w-[300px] max-h-[320px] m-3 p-8 rounded-[10px] overflow-hidden z-0 font-sans bg-white border border-gray-200 shadow-sm group transition-all duration-500 hover:shadow-xl cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* animated circle - red-200 on hover */}
      <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-red-200 transition-transform duration-500 ease-out group-hover:scale-[28] -z-10"></div>

      {/* corner - red-200 */}
      <div className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center overflow-hidden bg-red-200 rounded-bl-[32px]">
        <IconComponent className="w-5 h-5 text-red-500 -mt-1 -mr-1" />
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
      className={`relative max-w-[300px] m-3 p-4 rounded-[10px] overflow-hidden z-0 font-sans bg-white border border-gray-200 shadow-sm group transition-all duration-500 hover:shadow-xl cursor-pointer flex items-center gap-3 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* animated circle - red-200 on hover */}
      <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-red-200 transition-transform duration-500 ease-out group-hover:scale-[28] -z-10"></div>

      {/* corner - red-200 */}
      <div className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center overflow-hidden bg-red-200 rounded-bl-[32px]">
        <Icon className="w-5 h-5 text-red-500 -mt-1 -mr-1" />
      </div>

      <p className="text-base font-bold text-gray-800 transition-colors duration-500 group-hover:text-gray-800">
        {text}
      </p>
    </Link>
  );
}

// Custom Tooltip for Area Chart - Modern dark theme
function AreaTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl p-4 border border-gray-700/50">
        <p className="font-bold text-sm mb-3 text-gray-300 border-b border-gray-700 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 text-sm py-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400">{entry.name}:</span>
            </div>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
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
      </div>
    );
  }
  return null;
}

// Chart wrapper component - Modern card style
function ChartContainer({ title, icon: Icon, children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = Icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 focus:outline-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Process projects data to get monthly growth data
function processMonthlyData(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [];
  }

  const months = [];
  const now = new Date();

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    months.push({
      month: monthName,
      monthKey: monthKey,
      newProjects: 0,
      totalProjects: 0,
    });
  }

  // Count projects by month using created_at
  let cumulative = 0;
  projects.forEach((project) => {
    if (project && project.created_at) {
      const createdDate = new Date(project.created_at);
      const projectMonthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthIndex = months.findIndex((m) => m.monthKey === projectMonthKey);
      if (monthIndex !== -1) {
        months[monthIndex].newProjects += 1;
      }
    }
  });

  // Calculate cumulative
  months.forEach((m) => {
    cumulative += m.newProjects;
    m.totalProjects = cumulative;
  });

  return months;
}

// Process projects by program
function processProjectsByProgram(programs, projects) {
  if (!Array.isArray(programs) || !Array.isArray(projects)) {
    return [];
  }

  const colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16'];
  
  return programs.map((program, index) => {
    if (!program) return null;
    
    // Count projects linked to this program
    const projectCount = projects.filter((project) => {
      if (!project) return false;
      const programIds = project.project_programs?.map(pp => pp.programs?.id) || [];
      return programIds.includes(program.id);
    }).length;

    return {
      name: program.program_name?.length > 12 
        ? program.program_name.substring(0, 12) + '...' 
        : program.program_name || 'Other',
      fullName: program.program_name || 'Unnamed',
      projects: projectCount,
      fill: colors[index % colors.length],
    };
  }).filter(p => p && p.projects > 0).sort((a, b) => b.projects - a.projects).slice(0, 5);
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    programs: [],
    projects: [],
    members: [],
    students: [],
  });
  const [isPageVisible, setIsPageVisible] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all data in parallel
      const [membersRes, programsRes, projectsRes, studentsRes] = await Promise.all([
        getAllMembers(),
        getAllPrograms(),
        getAllProjects(),
        getAllStudents(),
      ]);

      // Extract data from response - services return res.data
      const membersData = membersRes?.data || membersRes || [];
      const programsData = programsRes?.data || programsRes || [];
      const projectsData = projectsRes?.data || projectsRes || [];
      const studentsData = studentsRes?.data || studentsRes || [];

      setData({
        members: Array.isArray(membersData) ? membersData : [],
        programs: Array.isArray(programsData) ? programsData : [],
        projects: Array.isArray(projectsData) ? projectsData : [],
        students: Array.isArray(studentsData) ? studentsData : [],
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Page load animation
    const timer = setTimeout(() => setIsPageVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate instructor count
  const instructorCount = useMemo(() => {
    if (!Array.isArray(data.members)) return 0;
    return data.members.filter((m) => m && m.is_instructor === true).length;
  }, [data.members]);

  // Process monthly data
  const monthlyData = useMemo(() => {
    return processMonthlyData(data.projects);
  }, [data.projects]);

  // Process program distribution
  const projectsByProgram = useMemo(() => {
    return processProjectsByProgram(data.programs, data.projects);
  }, [data.programs, data.projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 p-6 transition-opacity duration-700 ${isPageVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Page Title with animation */}
      <h1 className={`text-2xl font-semibold text-gray-800 mb-6 transform transition-all duration-500 ${isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        Dashboard
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button 
              onClick={fetchDashboardData} 
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* MAIN CONTENT */}
        <div className="col-span-12 xl:col-span-9">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mb-6">
            <StatCard
              title="Programs"
              count={data.programs.length}
              subtitle="Academic programs"
              icon={AcademicCapIcon}
              delay={200}
            />
            <StatCard
              title="Projects"
              count={data.projects.length}
              subtitle="Student projects"
              icon={FolderIcon}
              delay={300}
            />
            <StatCard
              title="Instructors"
              count={instructorCount}
              subtitle="Team members"
              icon={UsersIcon}
              delay={400}
            />
            <StatCard
              title="Students"
              count={data.students.length}
              subtitle="Enrolled students"
              icon={UserGroupIcon}
              delay={500}
            />
          </div>

          {/* Charts with modern design */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Growth - Modern design */}
            <ChartContainer title="Project Growth" icon={ArrowTrendingUpIcon} delay={600}>
              <div className="h-[300px] focus:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out">
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
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
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={0}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '6 4' }} />
                    <Area
                      type="monotone"
                      dataKey="totalProjects"
                      name="Total Projects"
                      stroke="#EF4444"
                      strokeWidth={3}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-800">{data.projects.length}</p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">+{monthlyData[monthlyData.length - 1]?.newProjects || 0} this month</span>
                </div>
              </div>
            </ChartContainer>

            {/* Program Distribution - Modern design */}
            <ChartContainer title="Program Distribution" icon={ChartBarIcon} delay={700}>
              <div className="h-[300px] focus:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsByProgram} layout="vertical" isAnimationActive={true} animationDuration={2000} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis 
                      type="number"
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={0}
                      tick={{ fill: '#9CA3AF' }}
                      domain={[0, 'dataMax + 1']}
                      tickFormatter={(value) => Math.round(value)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      fontSize={12} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={0}
                      width={150}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.08)' }} />
                    <Bar dataKey="projects" radius={[0, 6, 6, 0]} layout="vertical">
                      {projectsByProgram.map((entry, index) => (
                        <Cell key={index} fill={entry?.fill || '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Total Programs</p>
                  <p className="text-2xl font-bold text-gray-800">{data.programs.length}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ChartBarIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{projectsByProgram.length} active</span>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Quick Actions */}
        <div className="col-span-12 xl:col-span-3">
          <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-xl transition-shadow duration-500 ${isPageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '400ms' }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-0">
              <QuickActionButton text="Manage Home" link="/admin/content/home" icon={HomeIcon} delay={500} />
              <QuickActionButton text="Manage About" link="/admin/content/about" icon={InformationCircleIcon} delay={550} />
              <QuickActionButton text="Manage Programs" link="/admin/academics/programs" icon={AcademicCapIcon} delay={600} />
              <QuickActionButton text="Manage Projects" link="/admin/academics/projects" icon={FolderIcon} delay={650} />
              <QuickActionButton text="Manage Members" link="/admin/team/members" icon={UsersIcon} delay={700} />
              <QuickActionButton text="Manage Contact" link="/admin/contact" icon={EnvelopeIcon} delay={750} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
