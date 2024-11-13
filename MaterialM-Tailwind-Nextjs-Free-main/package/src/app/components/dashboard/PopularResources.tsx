"use client";
import React from "react";
import { Badge, Dropdown, Table } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";

const PopularResources = () => {
  const ResourceData = [
    {
      name: "Advanced Calculus - Chapter 1",
      type: "PDF",
      subject: "Mathematics",
      board: "CBSE",
      standard: "Grade 12",
      views: 2580,
      downloads: 1250,
      status: "success",
      statusText: "Active",
    },
    {
      name: "Chemical Bonding Video Lecture",
      type: "VIDEO",
      subject: "Chemistry",
      board: "CBSE",
      standard: "Grade 11",
      views: 1890,
      downloads: 0,
      status: "success",
      statusText: "Active",
    },
    {
      name: "Physics Mechanics Notes",
      type: "PDF",
      subject: "Physics",
      board: "ICSE",
      standard: "Grade 12",
      views: 1560,
      downloads: 890,
      status: "warning",
      statusText: "Under Review",
    },
    {
      name: "Organic Chemistry Revision",
      type: "VIDEO",
      subject: "Chemistry",
      board: "State Board",
      standard: "Grade 12",
      views: 1450,
      downloads: 0,
      status: "success",
      statusText: "Active",
    },
    {
      name: "Biology Cell Structure",
      type: "PDF",
      subject: "Biology",
      board: "CBSE",
      standard: "Grade 11",
      views: 1320,
      downloads: 760,
      status: "success",
      statusText: "Active",
    },
  ];

  const tableActionData = [
    {
      icon: "solar:eye-outline",
      listtitle: "View",
    },
    {
      icon: "solar:chart-outline",
      listtitle: "Analytics",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Edit",
    },
  ];

  return (
    <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray py-6 px-0 relative w-full break-words">
      <div className="px-6">
        <h5 className="card-title">Popular Resources</h5>
        <p className="card-subtitle">Most Accessed Learning Materials</p>
      </div>
      
      <SimpleBar className="max-h-[450px]">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Resource</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Subject</Table.HeadCell>
              <Table.HeadCell>Views</Table.HeadCell>
              <Table.HeadCell>Downloads</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {ResourceData.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.board} | {item.standard}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={item.type === 'PDF' ? 'lightinfo' : 'lightsuccess'} 
                      className={item.type === 'PDF' ? 'text-info' : 'text-success'}
                    >
                      {item.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{item.subject}</Table.Cell>
                  <Table.Cell>{item.views.toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    {item.type === 'PDF' ? item.downloads.toLocaleString() : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={`light${item.status}`} className={`text-${item.status}`}>
                      {item.statusText}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      )}
                    >
                      {tableActionData.map((items, index) => (
                        <Dropdown.Item key={index} className="flex gap-3">
                          <Icon icon={items.icon} height={18} />
                          <span>{items.listtitle}</span>
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </SimpleBar>
    </div>
  );
};

export default PopularResources;