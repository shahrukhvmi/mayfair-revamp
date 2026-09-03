import React from "react";
import defaultLogo from "@/public/images/logo.svg";
import Image from "next/image";

const ApplicationLogo = ({ logoUrl, priority = false, ...props }) => {
  const logoSrc = logoUrl || defaultLogo;

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      priority={priority}
      {...props}
    />
  );
};

export default ApplicationLogo;
