import { Link } from "next/router";

const Pagination = ({ pagination }) => {
  if (!pagination) return null;

  const { current_page, last_page, links } = pagination;

  return (
    <div className="w-full ">
      <nav
        className="flex justify-center sm:justify-start items-center py-4 px-2 w-full my-3"
        aria-label="Pagination"
      >
        <ul className="flex space-x-2">
          {/* Previous Button */}
          <li>
            <Link
              href={links.prev || "#"}
              className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                links.prev
                  ? "hover:bg-violet-700 hover:text-white bg-white border border-gray-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Previous
            </Link>
          </li>

          {/* Page Numbers */}
          {Array.from({ length: last_page }, (_, i) => (
            <li key={i}>
              <Link
                href={links[i + 1]}
                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                  current_page === i + 1
                    ? "bg-violet-700 text-white border-violet-700 shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-violet-700 hover:text-white"
                }`}
              >
                {i + 1}
              </Link>
            </li>
          ))}

          {/* Next Button */}
          <li>
            <Link
              href={links.next || "#"}
              className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                links.next
                  ? "hover:bg-violet-700 hover:text-white bg-white border border-gray-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
