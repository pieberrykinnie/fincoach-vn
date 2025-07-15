"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  Home,
  GraduationCap,
  Sparkles,
  PiggyBank,
  Target,
  Gift,
  Plus,
  Bell,
  Trophy,
  TrendingUp,
  Menu,
  X,
  LogOut,
  User,
  Brain,
  History
} from "lucide-react";
import { signOut, getCurrentUser } from "aws-amplify/auth";
import Link from "next/link";

// Mock data for demonstration
const mockJars = [
  { 
    id: "necessity",
    name: "Necessity", 
    percentage: 55, 
    icon: Home, 
    color: "bg-blue-500",
    spent: 4500000,
    limit: 5500000,
    percentageUsed: 82
  },
  { 
    id: "education",
    name: "Education", 
    percentage: 10, 
    icon: GraduationCap, 
    color: "bg-purple-500",
    spent: 800000,
    limit: 1000000,
    percentageUsed: 80
  },
  { 
    id: "play",
    name: "Play", 
    percentage: 10, 
    icon: Sparkles, 
    color: "bg-pink-500",
    spent: 600000,
    limit: 1000000,
    percentageUsed: 60
  },
  { 
    id: "longTermSavings",
    name: "Long-term Savings", 
    percentage: 10, 
    icon: PiggyBank, 
    color: "bg-green-500",
    spent: 1000000,
    limit: 1000000,
    percentageUsed: 100
  },
  { 
    id: "financialFreedom",
    name: "Financial Freedom", 
    percentage: 10, 
    icon: Target, 
    color: "bg-yellow-500",
    spent: 300000,
    limit: 1000000,
    percentageUsed: 30
  },
  { 
    id: "give",
    name: "Give", 
    percentage: 5, 
    icon: Gift, 
    color: "bg-red-500",
    spent: 200000,
    limit: 500000,
    percentageUsed: 40
  },
];

const mockAlerts = [
  { id: 1, message: "Your Necessity jar is at 82% capacity!", type: "warning", isRead: false },
  { id: 2, message: "Great job! You've saved 100% of your Long-term Savings goal", type: "success", isRead: true },
];

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("User");
  const [monthlyIncome] = useState(10000000); // 10M VND
  const [wisdomPoints] = useState(150);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      setUserEmail(user.signInDetails?.loginId || "");
      setUserName(user.signInDetails?.loginId?.split("@")[0] || "User");
    } catch {
      router.push("/login");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">FinCoach VN</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <nav className="mt-8">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 bg-indigo-50 border-r-4 border-indigo-600">
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
            <History className="h-5 w-5 mr-3" />
            Transactions
          </Link>
          <Link href="/dashboard/insights" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
            <TrendingUp className="h-5 w-5 mr-3" />
            Insights
          </Link>
          <Link href="/dashboard/ai-coach" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
            <Brain className="h-5 w-5 mr-3" />
            AI Coach
          </Link>
          <Link href="/dashboard/achievements" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
            <Trophy className="h-5 w-5 mr-3" />
            Achievements
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <Link 
                href="/dashboard/transactions/add" 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Transaction
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(7400000)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(2600000)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Wisdom Points</p>
              <p className="text-2xl font-bold text-indigo-600">{wisdomPoints} 🏆</p>
            </div>
          </div>

          {/* Alerts */}
          {mockAlerts.filter(a => !a.isRead).length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
              <div className="space-y-3">
                {mockAlerts.filter(a => !a.isRead).map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-yellow-800' : 'text-green-800'
                    }`}>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Jar Overview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your 6 Jars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockJars.map((jar) => {
                const Icon = jar.icon;
                return (
                  <div key={jar.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${jar.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{jar.name}</h3>
                          <p className="text-sm text-gray-500">{jar.percentage}% allocation</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-medium">{formatCurrency(jar.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Limit</span>
                        <span className="font-medium">{formatCurrency(jar.limit)}</span>
                      </div>
                      
                      <div className="pt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Usage</span>
                          <span className="font-medium">{jar.percentageUsed}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(jar.percentageUsed)}`}
                            style={{ width: `${jar.percentageUsed}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}