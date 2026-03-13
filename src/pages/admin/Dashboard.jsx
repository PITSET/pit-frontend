import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  FolderIcon,
  UserGroupIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getAllMembers } from "../../lib/services/memberService";
import { getAllPrograms } from "../../lib/services/programService";
import { getAllProjects } from "../../lib/services/projectService";
import { getAllStudents } from "../../lib/services/studentService";
import Loading from "../../components/ui/Loading";

// Modern stat card component
function StatCard({ count, label, icon: IconProp, link }) {
  const Icon = IconProp;

  return (
    <Link
      to={link}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
      </div>
    </Link>
  );
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Process projects data to get monthly growth data
function processMonthlyData(projects) {
  const months = [];
  const now = new Date();

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    months.push({
      month: monthName,
      fullMonth: monthKey,
      newProjects: 0,
      totalProjects: 0,
    });
  }

  // Count projects by month
  let cumulative = 0;
  projects.forEach((project) => {
    if (project.created_at) {
      const createdDate = new Date(project.created_at);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthIndex = months.findIndex((m) => m.fullMonth === monthKey);
      if (monthIndex !== -1) {
        months[monthIndex].newProjects += 1;
      }
    }
  });

  // Calculate cumulative total
  months.forEach((m) => {
    cumulative += m.newProjects;
    m.totalProjects = cumulative;
  });

  return months;
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

      // Services may return { data: [...] } or the array directly
      const getData = (res) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      };

      setData({
        members: getData(membersRes),
        programs: getData(programsRes),
        projects: getData(projectsRes),
        students: getData(studentsRes),
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
  }, []);

  // Calculate instructor count from members
  const instructorCount = useMemo(() => {
    return data.members.filter((m) => m.is_instructor === true).length;
  }, [data.members]);

  // Process monthly project data
  const monthlyData = useMemo(() => {
    return processMonthlyData(data.projects);
  }, [data.projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
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

      {/* Stats Cards Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          count={data.programs.length}
          label="Programs"
          icon={AcademicCapIcon}
          link="/admin/academics/programs"
        />
        <StatCard
          count={data.projects.length}
          label="Projects"
          icon={FolderIcon}
          link="/admin/academics/projects"
        />
        <StatCard
          count={instructorCount}
          label="Instructors"
          icon={UsersIcon}
          link="/admin/team/members"
        />
        <StatCard
          count={data.students.length}
          label="Students"
          icon={UserGroupIcon}
          link="/admin/academics/programs"
        />
      </div>

      {/* Project Growth Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Project Growth</h2>
            <p className="text-sm text-gray-500">Monthly project creation over the last 12 months</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">Total Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-300" />
              <span className="text-gray-600">New Projects</span>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 sm:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="totalProjects"
                name="Total Projects"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', strokeWidth: 0, r: 4, cx: 0, cy: 0 }}
                activeDot={{ r: 6, fill: '#EA580C', stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="newProjects"
                name="New Projects"
                stroke="#FDBA74"
                strokeWidth={2}
                dot={{ fill: '#FDBA74', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
