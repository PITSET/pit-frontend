import { useLocation } from "react-router-dom";

const breadcrumbMap = {
  "/about": "About Us",
  "/contact": "Contact",
  "/projects": "Projects",
  "/programs": "Programs",
  "/instructors": "Instructors",
};

/**
 * useBreadcrumbs - Hook to generate breadcrumbs from current path
 * @returns {Array} Array of { label, path }
 */
export default function useBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbs = pathnames.map((_, index) => {
    const url = `/${pathnames.slice(0, index + 1).join("/")}`;
    
    // Check if we have a static map for this URL
    let label = breadcrumbMap[url];

    // If no static label, try to format the slug
    if (!label) {
      const slug = pathnames[index];
      // Simple check for IDs (if it's numeric or long-ish alphanumeric, might be an ID)
      // In a real scenario, you might want to fetch the name from a store or API
      if (!isNaN(slug) || slug.length > 20) {
        label = "Detail"; // Placeholder for dynamic content
      } else {
        label = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
      }
    }

    return { label, path: url };
  });

  return breadcrumbs;
}
