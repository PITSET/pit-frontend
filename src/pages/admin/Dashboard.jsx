import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  FolderIcon,
  UserGroupIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { getAllMembers } from "../../lib/services/memberService";
import { getAllPrograms } from "../../lib/services/programService";
import { getAllProjects } from "../../lib/services/projectService";
import { getAllStudents } from "../../lib/services/studentService";
import Loading from "../../components/ui/Loading";

// Modern stat card component with consistent orange branding
function StatCard({ count, label, icon: IconProp, link }) {
  const Icon = IconProp;

  return (
    <Link
      to={link}
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </Link>
  );
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your academy metrics and quick actions</p>
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          count={data.programs.length}
          label="Total Programs"
          icon={AcademicCapIcon}
          link="/admin/academics/programs"
        />
        <StatCard
          count={data.projects.length}
          label="Total Projects"
          icon={FolderIcon}
          link="/admin/academics/projects"
        />
        <StatCard
          count={instructorCount}
          label="Total Instructors"
          icon={UsersIcon}
          link="/admin/team/members"
        />
        <StatCard
          count={data.students.length}
          label="Total Students"
          icon={UserGroupIcon}
          link="/admin/academics/programs"
        />
      </div>
    </div>
  );
}
