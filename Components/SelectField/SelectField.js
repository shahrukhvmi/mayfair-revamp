import React from "react";
import { FormControl, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";

const MUISelectField = ({ label, name, value, onChange, onBlur, inputRef, options = [], error = "", placeholder = "Select an option", required = false, variant = "underline", placeholderDisabled = true }) => {
  const isUnderline = variant === "underline";

  return (
    <div className="mb-4 relative">
      {label && (
        <label
          htmlFor={name}
          className={isUnderline
            ? "inter-medium-font mb-1.5 flex items-center gap-1 text-[13px] text-slate-700"
            : "bold-font paragraph mb-2"
          }
        >
          {label}
          {required ? (
            <span className={isUnderline
              ? "text-red-400 text-[14px] leading-none"
              : "text-red-500 absolute top-1 ms-1 niba-semibold-font"
            }> *</span>
          ) : (
            <span className={isUnderline
              ? "inter-reg-font text-[12px] text-slate-400"
              : "text-gray-500 text-sm font-normal ml-1"
            }>(optional)</span>
          )}
        </label>
      )}

      <FormControl fullWidth error={!!error}>
        <Select
          id={name}
          name={name}
          onBlur={onBlur}
          inputRef={inputRef}
          value={value}
          onChange={onChange}
          displayEmpty
          className={isUnderline ? "inter-reg-font" : "reg-font text-2xl"}
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
          <MenuItem value="" disabled={placeholderDisabled} sx={isUnderline ? { fontFamily: "var(--inter-reg)", fontSize: "15px" } : undefined}>
            {placeholder}
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value} className={isUnderline ? "inter-reg-font" : "reg-font text-lg"} sx={isUnderline ? { fontFamily: "var(--inter-reg)", fontSize: "15px" } : undefined}>
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
