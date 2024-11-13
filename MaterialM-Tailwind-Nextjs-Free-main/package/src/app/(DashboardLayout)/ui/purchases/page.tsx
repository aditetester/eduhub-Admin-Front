"use client";
import { useState, useEffect } from 'react';
import { Tabs, Table, Spinner, Button, Card } from "flowbite-react";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface Purchase {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  createdAt: string;
  validUntil: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  purchaseType: 'STANDARD' | 'SUBJECT';
  subject?: {
    _id: string;
    name: string;
    image?: string;
    price: number;
  };
  standard?: {
    _id: string;
    grade: string;
    price: number;
  };
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PurchasePage = () => {
  const [subjectPurchases, setSubjectPurchases] = useState<Purchase[]>([]);
  const [standardPurchases, setStandardPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    fetchAllPurchases();
  }, []);

  const fetchAllPurchases = async () => {
    setIsLoading(true);
    try {
      const [subjectResponse, standardResponse] = await Promise.all([
        fetch(`${API_URL}/admin/purchases?type=SUBJECT`),
        fetch(`${API_URL}/admin/purchases?type=STANDARD`)
      ]);

      const subjectData = await subjectResponse.json();
      const standardData = await standardResponse.json();

      if (subjectData.success) {
        setSubjectPurchases(subjectData.data);
      }
      if (standardData.success) {
        setStandardPurchases(standardData.data);
      }
    } catch (error) {
      toast.error('Failed to fetch purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (purchaseId: string, status: string, purchaseType: 'SUBJECT' | 'STANDARD') => {
    setStatusUpdateLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/purchases/${purchaseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Status updated to ${status}`);
        
        if (purchaseType === 'SUBJECT') {
          setSubjectPurchases(prevPurchases => 
            prevPurchases.map(purchase => 
              purchase._id === purchaseId 
                ? { ...purchase, paymentStatus: status as Purchase['paymentStatus'] }
                : purchase
            )
          );
        } else {
          setStandardPurchases(prevPurchases => 
            prevPurchases.map(purchase => 
              purchase._id === purchaseId 
                ? { ...purchase, paymentStatus: status as Purchase['paymentStatus'] }
                : purchase
            )
          );
        }
        setIsViewModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const sortPurchases = (purchases: Purchase[]) => {
    return [...purchases].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const currentPurchases = activeTab === 0 ? subjectPurchases : standardPurchases;
  const sortedPurchases = sortPurchases(currentPurchases);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const getCurrentStats = () => {
    const purchases = activeTab === 0 ? subjectPurchases : standardPurchases;
    return {
      totalPurchases: purchases.length,
      completedPurchases: purchases.filter(p => p.paymentStatus === 'COMPLETED').length,
      pendingPurchases: purchases.filter(p => p.paymentStatus === 'PENDING').length,
      totalRevenue: purchases
        .filter(p => p.paymentStatus === 'COMPLETED')
        .reduce((sum, purchase) => sum + purchase.amount, 0)
    };
  };

  const getCurrentTitle = () => {
    return activeTab === 0 ? 'Subject Purchase Management' : 'Standard Purchase Management';
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6">
      <h5 className="text-xl font-semibold text-dark dark:text-white mb-6">
        {getCurrentTitle()}
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="dark:bg-darkgray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total {activeTab === 0 ? 'Subject' : 'Standard'} Purchases
              </p>
              <h3 className="text-2xl font-bold dark:text-white">
                {getCurrentStats().totalPurchases}
              </h3>
            </div>
            <Icon icon="solar:shop-2-outline" className="text-3xl text-blue-500" />
          </div>
        </Card>

        <Card className="dark:bg-darkgray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed {activeTab === 0 ? 'Subject' : 'Standard'} Purchases
              </p>
              <h3 className="text-2xl font-bold dark:text-white">
                {getCurrentStats().completedPurchases}
              </h3>
            </div>
            <Icon icon="solar:check-circle-outline" className="text-3xl text-green-500" />
          </div>
        </Card>

        <Card className="dark:bg-darkgray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending {activeTab === 0 ? 'Subject' : 'Standard'} Purchases
              </p>
              <h3 className="text-2xl font-bold dark:text-white">
                {getCurrentStats().pendingPurchases}
              </h3>
            </div>
            <Icon icon="solar:hourglass-outline" className="text-3xl text-yellow-500" />
          </div>
        </Card>

        <Card className="dark:bg-darkgray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total {activeTab === 0 ? 'Subject' : 'Standard'} Revenue
              </p>
              <h3 className="text-2xl font-bold dark:text-white">
                ${getCurrentStats().totalRevenue}
              </h3>
            </div>
            <Icon icon="solar:dollar-outline" className="text-3xl text-blue-500" />
          </div>
        </Card>
      </div>

      <Tabs onActiveTabChange={handleTabChange}>
        <Tabs.Item 
          active={activeTab === 0} 
          title="Subject Purchases"
        >
          <PurchaseTable 
            purchases={subjectPurchases}
            isLoading={isLoading}
            onView={(purchase) => {
              setSelectedPurchase(purchase);
              setIsViewModalOpen(true);
            }}
            type="SUBJECT"
          />
        </Tabs.Item>
        <Tabs.Item 
          active={activeTab === 1} 
          title="Standard Purchases"
        >
          <PurchaseTable 
            purchases={standardPurchases}
            isLoading={isLoading}
            onView={(purchase) => {
              setSelectedPurchase(purchase);
              setIsViewModalOpen(true);
            }}
            type="STANDARD"
          />
        </Tabs.Item>
      </Tabs>

      {isViewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-darkgray rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Purchase Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
              >
                <Icon icon="solar:close-circle-outline" className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* {selectedPurchase.subject?.image && (
                  <img 
                    src={selectedPurchase.subject.image} 
                    alt={selectedPurchase.subject.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                  />
                )} */}
                <div>
                  <p className="font-medium text-lg dark:text-white">
                    {selectedPurchase.subject?.name || selectedPurchase.standard?.grade}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Amount: ${selectedPurchase.amount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Purchase Date: {new Date(selectedPurchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires: {new Date(selectedPurchase.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  color={selectedPurchase.paymentStatus === 'PENDING' ? 'warning' : 'light'}
                  onClick={() => updateStatus(selectedPurchase._id, 'PENDING', selectedPurchase.purchaseType)}
                  disabled={statusUpdateLoading}
                  className="flex-1"
                >
                  {statusUpdateLoading ? <Spinner size="sm" /> : 'Pending'}
                </Button>
                <Button 
                  color={selectedPurchase.paymentStatus === 'COMPLETED' ? 'success' : 'light'}
                  onClick={() => updateStatus(selectedPurchase._id, 'COMPLETED', selectedPurchase.purchaseType)}
                  disabled={statusUpdateLoading}
                  className="flex-1"
                >
                  {statusUpdateLoading ? <Spinner size="sm" /> : 'Success'}
                </Button>
                <Button 
                  color={selectedPurchase.paymentStatus === 'FAILED' ? 'failure' : 'light'}
                  onClick={() => updateStatus(selectedPurchase._id, 'FAILED', selectedPurchase.purchaseType)}
                  disabled={statusUpdateLoading}
                  className="flex-1"
                >
                  {statusUpdateLoading ? <Spinner size="sm" /> : 'Declined'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PurchaseTable = ({ 
  purchases, 
  isLoading, 
  onView,
  type 
}: { 
  purchases: Purchase[], 
  isLoading: boolean, 
  onView: (purchase: Purchase) => void,
  type: 'SUBJECT' | 'STANDARD'
}) => {
  const getColumns = () => {
    const commonColumns = [
      { key: 'username', label: 'Username' },
      { key: 'amount', label: 'Amount' },
      { key: 'purchaseDate', label: 'Purchase Date' },
      { key: 'expiryDate', label: 'Expiry Date' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' }
    ];

    if (type === 'SUBJECT') {
      return [
        ...commonColumns.slice(0, 1),
        { key: 'subject', label: 'Subject Name' },
        ...commonColumns.slice(1)
      ];
    } else {
      return [
        ...commonColumns.slice(0, 1),
        { key: 'standard', label: 'Standard Grade' },
        ...commonColumns.slice(1)
      ];
    }
  };

  const columns = getColumns();

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="xl" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No {type.toLowerCase()} purchases found
        </div>
      ) : (
        <Table hoverable>
          <Table.Head>
            {columns.map(column => (
              <Table.HeadCell key={column.key}>{column.label}</Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body className="divide-y">
            {purchases.map((purchase) => (
              <Table.Row 
                key={purchase._id} 
                className="bg-white dark:border-darkborder dark:bg-darkgray"
              >
                <Table.Cell className="font-medium dark:text-white">
                  {purchase.user.name}
                </Table.Cell>
                {type === 'SUBJECT' ? (
                  <Table.Cell className="dark:text-gray-400">
                    {purchase.subject?.name}
                  </Table.Cell>
                ) : (
                  <Table.Cell className="dark:text-gray-400">
                    {purchase.standard?.grade}
                  </Table.Cell>
                )}
                <Table.Cell className="dark:text-gray-400">
                  ${purchase.amount}
                </Table.Cell>
                <Table.Cell className="dark:text-gray-400">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell className="dark:text-gray-400">
                  {new Date(purchase.validUntil).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={purchase.paymentStatus} />
                </Table.Cell>
                <Table.Cell>
                  <Button 
                    size="sm" 
                    color="info"
                    onClick={() => onView(purchase)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Icon icon="solar:eye-outline" className="text-lg" />
                    View Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: Purchase['paymentStatus'] }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Completed'
        };
      case 'PENDING':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Pending'
        };
      case 'FAILED':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Failed'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default PurchasePage;