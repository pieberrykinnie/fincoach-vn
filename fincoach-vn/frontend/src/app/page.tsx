"use client";

import Link from "next/link";
import { 
  Wallet, 
  TrendingUp, 
  Brain, 
  Trophy, 
  Shield, 
  Users,
  ChevronRight,
  Sparkles,
  PiggyBank,
  Target,
  Gift,
  GraduationCap,
  Home
} from "lucide-react";

const jars = [
  { name: "Necessity", percentage: 55, icon: Home, color: "bg-blue-500", description: "Essential expenses" },
  { name: "Education", percentage: 10, icon: GraduationCap, color: "bg-purple-500", description: "Learning & growth" },
  { name: "Play", percentage: 10, icon: Sparkles, color: "bg-pink-500", description: "Fun & entertainment" },
  { name: "Long-term Savings", percentage: 10, icon: PiggyBank, color: "bg-green-500", description: "Future security" },
  { name: "Financial Freedom", percentage: 10, icon: Target, color: "bg-yellow-500", description: "Investments" },
  { name: "Give", percentage: 5, icon: Gift, color: "bg-red-500", description: "Charity & gifts" },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Classification",
    description: "Smart transaction categorization using advanced AI tailored for Vietnamese spending patterns",
  },
  {
    icon: TrendingUp,
    title: "Real-time Insights",
    description: "Get instant feedback on your spending habits with proactive alerts and recommendations",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn Wisdom Points and unlock rewards as you build better financial habits",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your data is protected with enterprise-level security powered by AWS",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FinCoach VN</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your Money with the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> 6-Jar Method</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of young Vietnamese professionals taking control of their finances with AI-powered money management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Your Journey
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="#how-it-works" 
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-indigo-200"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "₫5B+", label: "Money Managed" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6-Jar Method Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The 6-Jar Method</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven system to balance your current needs with future goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jars.map((jar) => {
              const Icon = jar.icon;
              return (
                <div key={jar.name} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex p-3 rounded-lg ${jar.color} text-white mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{jar.name}</h3>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{jar.percentage}%</div>
                  <p className="text-gray-600">{jar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FinCoach VN?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features designed specifically for the Vietnamese market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join FinCoach VN today and start your journey to financial wellness
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started Free
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-indigo-100 mt-4 text-sm">
            No credit card required • 100 Wisdom Points welcome bonus
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wallet className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">FinCoach VN</span>
              </div>
              <p className="text-gray-400">
                Empowering Vietnamese youth with smart money management
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FinCoach VN. Built with ❤️ by Team 261 for VPBank Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
