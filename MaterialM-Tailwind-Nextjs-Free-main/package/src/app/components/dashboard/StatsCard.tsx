import { Card } from 'flowbite-react';
import { Icon } from "@iconify/react";

interface StatsCardProps {
  title: string;
  value: number;
  growth: number;
  icon: string;
  isCurrency?: boolean;
}

const StatsCard = ({ title, value, growth, icon, isCurrency = false }: StatsCardProps) => {
  const formatValue = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <Card className="dark:bg-darkgray-800">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold dark:text-white">
            {formatValue(value)}
          </h3>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Icon icon={icon} className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        </div>
      </div>
      <div className="mt-2">
        <span className={`text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <Icon 
            icon={growth >= 0 ? "mdi:trending-up" : "mdi:trending-down"} 
            className="inline mr-1" 
          />
          {Math.abs(growth)}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
      </div>
    </Card>
  );
};

export default StatsCard;