"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

const FullLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* Icon - Light/Dark modes */}
      <div className="text-3xl">
        <Icon 
          icon="carbon:education" 
          className="block dark:hidden text-blue-500" 
        />
        <Icon 
          icon="carbon:education" 
          className="hidden dark:block text-blue-300" 
        />
      </div>

      {/* Text Logo */}
      <div className="text-3xl font-extrabold">
        <span className="block dark:hidden bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          EduHub
        </span>
        <span className="hidden dark:block bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
          EduHub
        </span>
      </div>
    </Link>
  );
};

export default FullLogo;
