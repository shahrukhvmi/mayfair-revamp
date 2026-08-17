import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const MuiDatePickerField = ({ name, label, control, rules, required = true, errors = {} }) => {
  const currentYear = new Date().getFullYear();

  const validateDate = (value) => {
    if (!value) return "Date is required";
    const year = new Date(value).getFullYear();
    if (year > currentYear) return "Year cannot be in the future";
    return true;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value || null}
            onChange={(date) => field.onChange(date)}
            maxDate={new Date()}
            format="dd/MM/yyyy"
            className="reg-font"
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[name],
                helperText: errors[name]?.message,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    transition: "border-color 180ms ease, box-shadow 180ms ease",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(71, 49, 124, 0.45)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(71, 49, 124, 0.10)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#47317c",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#47317c",
                  },
                  "& .MuiIconButton-root": {
                    color: "#47317c",
                  },
                },
              },
              desktopPaper: {
                sx: {
                  borderRadius: "16px",
                  "& .MuiPickersDay-root.Mui-selected": {
                    backgroundColor: "#47317c",
                    "&:hover, &:focus": { backgroundColor: "#392765" },
                  },
                },
              },
              mobilePaper: {
                sx: {
                  borderRadius: "16px",
                  "& .MuiPickersDay-root.Mui-selected": {
                    backgroundColor: "#47317c",
                    "&:hover, &:focus": { backgroundColor: "#392765" },
                  },
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default MuiDatePickerField;
