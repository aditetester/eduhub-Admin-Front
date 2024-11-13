"use client";
import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";

interface Resource {
  _id: string;
  count: number;
  views: number;
  type: 'PDF' | 'VIDEO';
}

interface ResourceStatsProps {
  data?: {
    resources?: Resource[];
    monthlyViews?: number[];
  };
}

const DEFAULT_DATA = {
  resources: [] as Resource[],
  monthlyViews: [0, 0, 0, 0, 0, 0, 0]
};

const ResourceStats: React.FC<ResourceStatsProps> = ({ data = DEFAULT_DATA }) => {
  // Ensure we have default values
  const resources = data?.resources || DEFAULT_DATA.resources;
  const monthlyViews = data?.monthlyViews || DEFAULT_DATA.monthlyViews;

  // Calculate totals
  const totalResources = resources.reduce((sum, item) => sum + (item.count || 0), 0);
  const pdfCount = resources
    .filter(r => r.type === 'PDF')
    .reduce((sum, item) => sum + (item.count || 0), 0);
  const videoCount = resources
    .filter(r => r.type === 'VIDEO')
    .reduce((sum, item) => sum + (item.count || 0), 0);

  const Action = [
    {
      icon: "solar:add-circle-outline",
      listtitle: "Add Resource",
    },
    {
      icon: "solar:chart-outline",
      listtitle: "View Analytics",
    },
    {
      icon: "solar:list-outline",
      listtitle: "View All",
    },
  ];

  const ChartData: any = {
    series: [
      {
        name: "Resource Views",
        color: "var(--color-secondary)",
        data: monthlyViews,
      },
    ],
    chart: {
      id: "resource-stats",
      type: "area",
      height: 70,
      sparkline: {
        enabled: true,
      },
      group: "sparklines",
      fontFamily: "inherit",
      foreColor: "#adb0bb",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.3,
        inverseColors: false,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [20, 180],
      },
    },
    markers: {
      size: 4,
      colors: ["var(--color-secondary)"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    },
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
          return value.toLocaleString() + ' views';
        }
      }
    },
    yaxis: {
      min: 0,
      max: Math.max(...monthlyViews) + 10,
      tickAmount: 3,
    },
  };

  return (
    <div className="bg-lightsecondary rounded-lg p-6 relative w-full break-words">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-14 h-10 rounded-full flex items-center justify-center bg-secondary text-white">
            <Icon icon="solar:documents-line-duotone" height={24} />
          </span>
          <h5 className="text-base opacity-70">Resource Usage</h5>
        </div>
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full cursor-pointer">
              <HiOutlineDotsVertical size={22} />
            </span>
          )}
        >
          {Action.map((items, index) => (
            <Dropdown.Item key={index} className="flex gap-3">
              <Icon icon={items.icon} height={18} />
              <span>{items.listtitle}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>

      <div className="grid grid-cols-12 gap-[24px] items-end mt-10">
        <div className="xl:col-span-6 col-span-7">
          <h2 className="text-3xl mb-3">{totalResources}</h2>
          <div className="flex gap-4">
            <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs text-dark dark:text-darklink">
              <span className="opacity-70">PDF: {pdfCount}</span>
            </span>
            <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs text-dark dark:text-darklink">
              <span className="opacity-70">Video: {videoCount}</span>
            </span>
          </div>
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

export default ResourceStats;