import React from "react";
import { FormControl, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";

const MUISelectField = ({ label, name, value, onChange, options = [], error = "", placeholder = "Select an option" }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="bold-font paragraph mb-2 block">
          {label}
        </label>
      )}

      <FormControl fullWidth error={!!error}>
        <Select
          id={name}
          value={value}
          onChange={onChange}
          displayEmpty
          input={<OutlinedInput />}
          sx={{
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#f44336" : "#000",
              borderWidth: "1px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#f44336" : "#000",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7c3aed", // violet-700
              borderWidth: "2px",
            },
            ".MuiSelect-select": {
              padding: "16px 12px",
              fontSize: "0.875rem",
              color: "#000",
            },
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export default MUISelectField;
