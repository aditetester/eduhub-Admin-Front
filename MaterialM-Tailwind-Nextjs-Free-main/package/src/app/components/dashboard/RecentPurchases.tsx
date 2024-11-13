"use client";
import React from "react";
import { Badge, Dropdown, Table } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";

interface Purchase {
  _id: string;
  user: string;
  purchaseType: string;
  standard: string;
  amount: number;
  paymentStatus?: string;
  validUntil: string;
  createdAt: string;
}

interface RecentPurchasesProps {
  data: Purchase[];
  userData: { [key: string]: { name: string } };
  standardData: { [key: string]: { name: string } };
}

const RecentPurchases: React.FC<RecentPurchasesProps> = ({ 
  data = [], 
  userData = {}, 
  standardData = {} 
}) => {
  const tableActionData = [
    {
      icon: "solar:eye-outline",
      listtitle: "View",
      onClick: (purchase: Purchase) => {/* Add your view handler */}
    },
    {
      icon: "solar:printer-outline",
      listtitle: "Print",
      onClick: (purchase: Purchase) => {/* Add your print handler */}
    },
  ];

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'info';
    
    try {
      const upperStatus = status.toUpperCase();
      switch (upperStatus) {
        case 'COMPLETED':
          return 'success';
        case 'PENDING':
          return 'warning';
        case 'FAILED':
          return 'failure';
        default:
          return 'info';
      }
    } catch (error) {
      return 'info';
    }
  };

  const formatPurchaseType = (type: string | undefined) => {
    if (!type) return 'N/A';
    try {
      return type.charAt(0) + type.slice(1).toLowerCase();
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatAmount = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '₹0';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return '₹0';
    }
  };

  return (
    <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray py-6 px-0 relative w-full break-words">
      <div className="px-6">
        <h5 className="card-title">Recent Purchases</h5>
        <p className="card-subtitle">Overview of Latest Transactions</p>
      </div>
      
      <SimpleBar className="max-h-[450px]">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Student</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Standard</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Valid Until</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {data.length > 0 ? (
                data.map((purchase) => (
                  <Table.Row key={purchase._id}>
                    <Table.Cell className="whitespace-nowrap ps-6">
                      {userData[purchase.user]?.name || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {formatPurchaseType(purchase.purchaseType)}
                    </Table.Cell>
                    <Table.Cell>
                      {standardData[purchase.standard]?.name || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {formatAmount(purchase.amount)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        color={`light${getStatusColor(purchase.paymentStatus)}`}
                        className={`text-${getStatusColor(purchase.paymentStatus)}`}
                      >
                        {purchase.paymentStatus || 'N/A'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {formatDate(purchase.validUntil)}
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
                        {tableActionData.map((item, index) => (
                          <Dropdown.Item 
                            key={index} 
                            className="flex gap-3 cursor-pointer"
                            onClick={() => item.onClick(purchase)}
                          >
                            <Icon icon={item.icon} height={18} />
                            <span>{item.listtitle}</span>
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-4">
                    No recent purchases found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </SimpleBar>
    </div>
  );
};

export default RecentPurchases;