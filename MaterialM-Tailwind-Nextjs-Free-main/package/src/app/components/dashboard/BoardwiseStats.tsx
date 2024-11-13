"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Select } from "flowbite-react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BoardwiseStats = () => {
  const optionscolumnchart: any = {
    chart: {
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      fontSize: "12px",
      offsetX: 0,
      offsetY: 10,
      animations: {
        speed: 500,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["var(--color-primary)", "var(--color-secondary)"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: "#90A4AE50",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 6,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['CBSE', 'ICSE', 'State Board', 'IB'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Students'
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: function (val: number) {
          return val + " students"
        }
      }
    }
  };

  const barChart = {
    series: [
      {
        name: 'Active Students',
        data: [420, 280, 350, 180]
      },
      {
        name: 'Total Revenue (₹k)',
        data: [380, 250, 300, 150]
      }
    ],
  };

  return (
    <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="card-title">Board-wise Performance</h5>
          <p className="card-subtitle">Student Distribution & Revenue by Board</p>
        </div>
        <Select id="timeRange" className="select-md" required>
          <option>This Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
          <option>This Year</option>
        </Select>
      </div>

      <div className="-ms-4 -me-3 mt-6">
        <Chart
          options={optionscolumnchart}
          series={barChart.series}
          type="bar"
          height="315px"
          width="100%"
        />
      </div>
    </div>
  );
};

export default BoardwiseStats;