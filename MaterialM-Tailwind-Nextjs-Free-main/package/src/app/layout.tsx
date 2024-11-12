import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import 'simplebar-react/dist/simplebar.min.css';
import "./css/globals.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduHub",
  description: "Education Management System",
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSIjMzQ4NWZkIiBkPSJNMjYgMzBoLTJ2LTJoMnYyem0tNCAwSDR2LTJoMTh2MnptNC00aC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnptMC00aC0yVjZoMnY0ek0xNiAyLjc4TDI4LjIyIDE1TDE2IDI3LjIyTDMuNzggMTVMMTYgMi43OE0xNiAwTDEuNTYgMTQuNDRMMTYgMjguODlMMzAuNDQgMTQuNDRMMTYgMHoiLz48L3N2Zz4=',
        sizes: '32x32',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/education-icon.svg" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body className={`${inter.className}`}>
        <Flowbite theme={{ theme: customTheme }}>{children}
           <Toaster position="top-right" />
        </Flowbite>
      </body>
    </html>
  );
}
