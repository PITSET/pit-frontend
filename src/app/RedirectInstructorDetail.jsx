import { Navigate, useParams } from "react-router-dom";

export default function RedirectInstructorDetail() {
  const { id } = useParams();
  return <Navigate to={`/instructors/${id}`} replace />;
}

