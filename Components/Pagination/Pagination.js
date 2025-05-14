const Pagination = ({ pagination, setPage }) => {
  if (!pagination) return null;

  const { current_page, last_page } = pagination;

  return (
    <div className="w-full">
      <nav
        className="flex justify-center sm:justify-start items-center py-4 px-2 w-full my-3"
        aria-label="Pagination"
      >
        <ul className="flex space-x-2">
          {/* Prev */}
          <li>
            <button
              onClick={() => current_page > 1 && setPage(current_page - 1)}
              disabled={current_page === 1}
              className={` reg-font px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${current_page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary border border-gray-300 text-white hover:text-white cursor-pointer"}
              `}
            >
              Previous
            </button>
          </li>

          {/* Page Numbers */}
          {Array.from({ length: last_page }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setPage(i + 1)}
                className={`cursor-pointer reg-font px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm
                  ${current_page === i + 1
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-300 text-gray-800 hover:bg-purple-800 hover:text-white"}
                `}
              >
                {i + 1}
              </button>
            </li>
          ))}

          {/* Next */}
          <li>
            <button
              onClick={() => current_page < last_page && setPage(current_page + 1)}
              disabled={current_page === last_page}
              className={`reg-font  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${current_page === last_page
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary !text-white border border-primary reg-font hover:bg-violet-800 hover:text-white cursor-pointer"}
              `}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
