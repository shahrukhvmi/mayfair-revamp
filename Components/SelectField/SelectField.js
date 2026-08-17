import React from "react";
import { FormControl, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";

const MUISelectField = ({ label, name, value, onChange, options = [], error = "", placeholder = "Select an option", required = false, variant = "outlined" }) => {
  const isUnderline = variant === "underline";

  return (
    <div className="mb-4 relative">
      {label && (
        <label
          htmlFor={name}
          className={isUnderline
            ? "inter-medium-font mb-1.5 block text-[13px] text-slate-700"
            : "bold-font paragraph mb-2"
          }
        >
          {label}
          {required ? (
            <span className="text-red-500 absolute top-1 ms-1 niba-semibold-font"> *</span>
          ) : (
            <span className="text-gray-500 text-sm font-normal ml-1">(optional)</span>
          )}
        </label>
      )}

      <FormControl fullWidth error={!!error}>
        <Select
          id={name}
          value={value}
          onChange={onChange}
          displayEmpty
          className="reg-font text-2xl"
          input={<OutlinedInput />}
          sx={{
            backgroundColor: isUnderline ? "transparent" : "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              border: isUnderline ? "0" : undefined,
              borderBottom: isUnderline
                ? `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`
                : undefined,
              borderColor: isUnderline ? undefined : (error ? "#f44336" : "#000"),
              borderWidth: isUnderline ? undefined : "1px",
              borderRadius: isUnderline ? "0" : "5px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isUnderline ? undefined : (error ? "#f44336" : "#000"),
              borderBottomColor: isUnderline ? (error ? "#f87171" : "#cbd5e1") : undefined,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isUnderline ? undefined : "#7c3aed",
              borderBottomColor: isUnderline ? "#47317c" : undefined,
              borderWidth: isUnderline ? undefined : "2px",
            },
            ".MuiSelect-select": {
              padding: isUnderline ? "12px 28px 12px 0" : "16px 12px",
              color: isUnderline ? "#0f172a" : "#000",
              fontFamily: isUnderline ? "var(--inter-reg)" : undefined,
              fontSize: isUnderline ? "15px" : undefined,
            },
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value} className="reg-font text-lg">
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
