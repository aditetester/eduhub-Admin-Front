"use client";
import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";

interface TotalStudentsProps {
  data: {
    total: number;
    monthlyGrowth: string;
    monthlyData?: number[]; // Make monthlyData optional
  };
}

const TotalStudents = ({ data }: TotalStudentsProps) => {
  const Action = [
    {
      icon: "solar:user-plus-outline",
      listtitle: "Add Student",
      onClick: () => {/* Add your action handler */}
    },
    {
      icon: "solar:users-group-two-outline",
      listtitle: "View All",
      onClick: () => {/* Add your action handler */}
    },
    {
      icon: "solar:chart-outline",
      listtitle: "Analytics",
      onClick: () => {/* Add your action handler */}
    },
  ];

  // Default monthly data if none provided
  const monthlyData = data.monthlyData || [0, 0, 0, 0, 0, 0, 0];

  const ChartData: any = {
    series: [
      {
        name: "Students",
        data: monthlyData,
      },
    ],
    chart: {
      type: "area",
      height: 70,
      sparkline: {
        enabled: true,
      },
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [20, 180],
      },
    },
    colors: ["var(--color-primary)"],
    tooltip: {
      theme: "dark",
      fixed: {
        enabled: true,
        position: "right",
      },
      x: {
        show: true,
        formatter: function(index: number) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
          return months[index];
        }
      },
      y: {
        formatter: function(value: number) {
          return value.toLocaleString() + ' students';
        }
      }
    },
    yaxis: {
      min: 0,
      max: Math.max(...monthlyData) + 1,
      tickAmount: 2, // Show just a few ticks for small numbers
    },
    markers: {
      size: 4,
      colors: ["var(--color-primary)"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    },
    grid: {
      show: true,
      borderColor: '#f0f0f0',
      strokeDashArray: 0,
      position: 'back',
    },
  };

  // Calculate the percentage change
  const calculateGrowth = () => {
    if (!monthlyData || monthlyData.length < 2) return "0";
    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    if (previousMonth === 0) return "100";
    return (((lastMonth - previousMonth) / previousMonth) * 100).toFixed(1);
  };

  const growthPercentage = calculateGrowth();
  const growthColor = parseFloat(growthPercentage) >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-lightprimary rounded-lg p-6 relative w-full break-words">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-14 h-10 rounded-full flex items-center justify-center bg-primary text-white">
            <Icon icon="solar:users-group-rounded-bold" height={24} />
          </span>
          <h5 className="text-base opacity-70">Total Students</h5>
        </div>
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <HiOutlineDotsVertical size={22} />
            </span>
          )}
        >
          {Action.map((item, index) => (
            <Dropdown.Item 
              key={index} 
              className="flex gap-3 cursor-pointer"
              onClick={item.onClick}
            >
              <Icon icon={item.icon} height={18} />
              <span>{item.listtitle}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>

      <div className="grid grid-cols-12 gap-[24px] items-end mt-10">
        <div className="xl:col-span-6 col-span-7">
          <h2 className="text-3xl mb-3">
            {data.total.toLocaleString()}
          </h2>
          <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs text-dark dark:text-darklink">
            <span className={`${growthColor}`}>
              {parseFloat(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}% this month
            </span>
          </span>
        </div>
        <div className="xl:col-span-6 col-span-5">
          <div className="rounded-bars md:ps-7">
            <Chart
              options={ChartData}
              series={ChartData.series}
              type="area"
              height="70px"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalStudents;