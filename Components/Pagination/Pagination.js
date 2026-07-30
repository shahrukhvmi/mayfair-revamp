import React from "react";
import { Pagination as MUIPagination } from "@mui/material";

import usePaginationStore from "@/store/pagination";

const Pagination = ({ pagination }) => {
  const { currentPage, setCurrentPage } = usePaginationStore();

  if (!pagination) {
    return null;
  }

  const lastPage = Number(pagination?.last_page) || 1;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Page information */}
      <div className="text-center sm:text-left">
        <p className="mont-medium-font m-0 text-[12px] text-slate-500">
          Page{" "}
          <span className="mont-bold-font text-[#47317c]">{currentPage}</span>{" "}
          of <span className="mont-bold-font text-slate-800">{lastPage}</span>
        </p>
      </div>

      {/* Pagination controls */}
      <div className="flex w-full justify-center sm:w-auto sm:justify-end">
        <div className="rounded-[15px] border border-[#47317c]/10 bg-[#faf9fc] p-1.5">
          <MUIPagination
            count={lastPage}
            page={currentPage}
            onChange={handlePageChange}
            variant="text"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPagination-ul": {
                flexWrap: "nowrap",
                gap: "3px",
              },

              "& .MuiPaginationItem-root": {
                minWidth: "38px",
                height: "38px",
                margin: 0,
                borderRadius: "10px",
                border: "1px solid transparent",
                fontFamily: "var(--mont-medium)",
                fontSize: "12px",
                color: "#64748b",
                transition: "all 180ms ease",

                "&:hover": {
                  backgroundColor: "rgba(71,49,124,0.07)",
                  borderColor: "rgba(71,49,124,0.1)",
                  color: "#47317c",
                },
              },

              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#47317c",
                borderColor: "#47317c",
                color: "#ffffff",
                fontFamily: "var(--mont-bold)",
                boxShadow: "0 6px 16px rgba(71,49,124,0.22)",

                "&:hover": {
                  backgroundColor: "#392765",
                  borderColor: "#392765",
                  color: "#ffffff",
                },
              },

              "& .MuiPaginationItem-icon": {
                fontSize: "18px",
              },

              "& .MuiPaginationItem-firstLast": {
                color: "#47317c",
              },

              "& .MuiPaginationItem-previousNext": {
                color: "#47317c",
              },

              "& .Mui-disabled": {
                opacity: 0.35,
                color: "#94a3b8",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
