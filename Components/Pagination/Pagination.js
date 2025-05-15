import React from "react";
import { Pagination as MUIPagination } from "@mui/material";

const Pagination = ({ pagination, setPage }) => {
  if (!pagination) return null;

  const { current_page, last_page } = pagination;

  return (
    <div className="w-full flex justify-center sm:justify-start my-5">
      <MUIPagination
        count={last_page}
        page={current_page}
        onChange={(event, value) => setPage(value)}
        color="primary"
        variant="outlined"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default Pagination;
