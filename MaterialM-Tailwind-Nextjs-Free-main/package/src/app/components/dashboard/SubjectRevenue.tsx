"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { Badge, Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";

const SubjectRevenue = () => {
  const dropdownItems = ["This Month", "Last 3 Months", "This Year"];

  const SubjectRevenueData = [
    {
      icon: "solar:book-2-line-duotone",
      title: "Mathematics",
      subtitle: "Grade 11 & 12",
      color: "bg-lightprimary",
      text: 'text-primary',
      statuscolor: "success",
      statustext: "₹16.3k",
      students: 245
    },
    {
      icon: "solar:atom-line-duotone",
      title: "Physics",
      subtitle: "Grade 11 & 12",
      color: "bg-lighterror",
      text: 'text-error',
      statuscolor: "success",
      statustext: "₹12.5k",
      students: 198
    },
    {
      icon: "solar:test-tube-line-duotone",
      title: "Chemistry",
      subtitle: "Grade 11 & 12",
      color: "bg-lightsecondary",
      text: 'text-secondary',
      statuscolor: "success",
      statustext: "₹11.2k",
      students: 176
    },
    {
      icon: "solar:cell-line-duotone",
      title: "Biology",
      subtitle: "Grade 11 & 12",
      color: "bg-lightwarning",
      text: 'text-warning',
      statuscolor: "success",
      statustext: "₹9.8k",
      students: 156
    },
    {
      icon: "solar:notebook-line-duotone",
      title: "English",
      subtitle: "All Grades",
      color: "bg-lighterror",
      text: 'text-error',
      statuscolor: "success",
      statustext: "₹8.5k",
      students: 134
    },
  ];

  return (
    <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="card-title">Subject Revenue</h5>
          <p className="card-subtitle">Top Performing Subjects</p>
        </div>
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
              <HiOutlineDotsVertical size={22} />
            </span>
          )}
        >
          {dropdownItems.map((items, index) => {
            return <Dropdown.Item key={index}>{items}</Dropdown.Item>;
          })}
        </Dropdown>
      </div>

      <div className="flex flex-col mt-2">
        {SubjectRevenueData.map((item, index) => (
          <div className="flex items-center justify-between py-5 border-b border-ld" key={index}>
            <div className="flex gap-3 items-center">
              <span className={`w-14 h-10 rounded-full flex items-center justify-center ${item.color} ${item.text}`}>
                <Icon icon={item.icon} height={24} />
              </span>
              <div>
                <h4 className="text-sm mb-1">{item.title}</h4>
                <p className="text-darklink text-xs flex items-center gap-1">
                  {item.subtitle}
                  <span className="text-xs text-gray-500">({item.students} students)</span>
                </p>
              </div>
            </div>
            <Badge
              color={`light${item.statuscolor}`}
              className={`text-${item.statuscolor}`}
            >
              {item.statustext}
            </Badge>
          </div>
        ))}

        <div className="text-center pt-6">
          <a href="/ui/subjects" className="text-base font-semibold text-dark hover:text-primary dark:hover:text-primary">
            View all subjects
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubjectRevenue;