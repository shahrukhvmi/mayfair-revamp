import React from 'react';

const TextField = ({
    label,
    name,
    placeholder = '',
    type = 'text',
    register,
    required = false,
    errors = {},
    disabled = false,
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-black mb-1"
                >
                    {label}
                    {/* {required && <span className="text-red-500">*</span>} */}
                </label>
            )}
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...register(name, { required })}
                className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800 
            ${errors[name] ? 'border-red-500' : 'border-black'}
          `}

            />
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">
                    {errors[name]?.message || 'This field is required'}
                </p>
            )}
        </div>
    );
};

export default TextField;
