"use client";
import React, { useEffect, useState } from "react";
import { dashboardApi } from "@/app/api/dashboardApi";
import { Spinner } from "flowbite-react";
import TotalStudents from "../components/dashboard/TotalStudents";
import ResourceStats from "../components/dashboard/ResourceStats";
import BoardwiseStats from "../components/dashboard/BoardwiseStats";
import PopularResources from "../components/dashboard/PopularResources";
import SubjectRevenue from "../components/dashboard/SubjectRevenue";
import RecentPurchases from "../components/dashboard/RecentPurchases";

interface DashboardData {
  stats: {
    students: {
      total: number;
      monthlyGrowth: string;
    };
    resources: {
      _id: string;
      count: number;
      views: number;
    }[];
    revenue: {
      monthly: number;
      growth: string;
    };
  };
  boardStats: {
    students: {
      _id: string;
      activeStudents: number;
      totalStudents: number;
      board: { name: string }[];
    }[];
    revenue: {
      _id: string;
      totalRevenue: number;
      board: { name: string }[];
    }[];
  };
  popularResources: {
    _id: string;
    name: string;
    type: 'PDF' | 'VIDEO';
    views: number;
    downloads: number;
    status: string;
    subject: { name: string }[];
    board: { name: string }[];
    standard: string;
  }[];
  recentPurchases: {
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
    type: string;
    user: { name: string }[];
    subject: { name: string }[];
    standard: string;
  }[];
  subjectRevenue: {
    _id: string;
    revenue: number;
    studentCount: number;
    subject: {
      name: string;
      standard: string;
    }[];
  }[];
}

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

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userData, setUserData] = useState({});
  const [standardData, setStandardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [
          stats, 
          boardStats, 
          popularResources, 
          recentPurchases, 
          subjectRevenue
        ] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getBoardStats(),
          dashboardApi.getPopularResources(),
          dashboardApi.getRecentPurchases(),
          dashboardApi.getSubjectRevenue()
        ]);

        if (stats.success && 
            boardStats.success && 
            popularResources.success && 
            recentPurchases.success && 
            subjectRevenue.success) {
          setDashboardData({
            stats: stats.data,
            boardStats: boardStats.data,
            popularResources: popularResources.data,
            recentPurchases: recentPurchases.data,
            subjectRevenue: subjectRevenue.data
          });
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setError('An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Log the API URL
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        
        // Get recent purchases
        const purchasesRes = await dashboardApi.getRecentPurchases();
        console.log('Purchase Response:', purchasesRes); // Log the full response
        
        if (purchasesRes.success && purchasesRes.data) {
          setPurchases(purchasesRes.data);
          
          // Get unique user IDs and standard IDs
          const userIds = [...new Set(purchasesRes.data.map(p => p.user))];
          const standardIds = [...new Set(purchasesRes.data.map(p => p.standard))];
          
          console.log('User IDs:', userIds); // Log user IDs
          console.log('Standard IDs:', standardIds); // Log standard IDs
          
          // Fetch users and standards data in parallel
          const [usersRes, standardsRes] = await Promise.all([
            dashboardApi.getUsers(userIds),
            dashboardApi.getStandards(standardIds)
          ]);

          console.log('Users Response:', usersRes); // Log users response
          console.log('Standards Response:', standardsRes); // Log standards response

          // Process user data
          if (usersRes.success && usersRes.data) {
            const userMap = {};
            usersRes.data.forEach(user => {
              userMap[user._id] = { name: user.name };
            });
            setUserData(userMap);
          }

          // Process standard data
          if (standardsRes.success && standardsRes.data) {
            const standardMap = {};
            standardsRes.data.forEach(std => {
              standardMap[std._id] = { name: std.name };
            });
            setStandardData(standardMap);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug logs
  console.log('Purchases:', purchases);
  console.log('User Data:', userData);
  console.log('Standard Data:', standardData);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Quick Stats Row */}
      <div className="lg:col-span-8 col-span-12">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <TotalStudents data={dashboardData.stats.students} />
          <ResourceStats data={dashboardData.stats.resources} />
        </div>
        <BoardwiseStats data={dashboardData.boardStats} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 col-span-12">
        <SubjectRevenue data={dashboardData.subjectRevenue} />
      </div>

      {/* Bottom Row */}
      <div className="lg:col-span-8 col-span-12">
        <PopularResources data={dashboardData.popularResources} />
      </div>
      <div className="lg:col-span-4 col-span-12">
        <RecentPurchases 
          data={purchases}
          userData={userData}
          standardData={standardData}
        />
      </div>
    </div>
  );
};

export default Dashboard;