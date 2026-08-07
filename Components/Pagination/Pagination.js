import React from "react";
import { Pagination as MUIPagination } from "@mui/material";
import usePaginationStore from "@/store/pagination";

const Pagination = ({ pagination }) => {
  const { currentPage, setCurrentPage } = usePaginationStore();

  if (!pagination) return null;

  const lastPage = Number(pagination?.last_page) || 1;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Page info */}
      <p className="inter-reg-font text-center text-[12.5px] text-slate-400 sm:text-left">
        Page <span className="inter-semibold-font text-slate-700">{currentPage}</span> of{" "}
        <span className="inter-semibold-font text-slate-700">{lastPage}</span>
      </p>

      {/* Controls */}
      <MUIPagination
        count={lastPage}
        page={currentPage}
        onChange={(_, v) => setCurrentPage(v)}
        variant="text"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPagination-ul": {
            flexWrap: "nowrap",
            gap: "4px",
          },
          "& .MuiPaginationItem-root": {
            minWidth: "34px",
            height: "34px",
            margin: 0,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontFamily: "var(--inter-medium)",
            fontSize: "12.5px",
            color: "#64748b",
            backgroundColor: "#ffffff",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor: "#f8fafc",
              borderColor: "#cbd5e1",
              color: "#0f172a",
            },
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#47317c",
            borderColor: "#47317c",
            color: "#ffffff",
            fontFamily: "var(--inter-semibold)",
            "&:hover": {
              backgroundColor: "#392765",
              borderColor: "#392765",
            },
          },
          "& .MuiPaginationItem-icon": {
            fontSize: "16px",
          },
          "& .MuiPaginationItem-firstLast, & .MuiPaginationItem-previousNext": {
            color: "#64748b",
          },
          "& .Mui-disabled": {
            opacity: 0.4,
            backgroundColor: "#f8fafc",
          },
        }}
      />
    </div>
  );
};

export default Pagination;
