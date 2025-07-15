"use client";

import { useState } from "react";
import { 
  Brain, 
  Send, 
  Loader2,
  Sparkles,
  BookOpen,
  TrendingUp,
  Shield,
  HelpCircle
} from "lucide-react";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const suggestedQuestions = [
  "How can I better manage my monthly budget?",
  "What is the 6-jar money management method?",
  "How can I save more money each month?",
  "What are good investment options for beginners?",
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Financial Coach. I'm here to help you with budgeting, savings tips, and financial planning. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // For demo purposes, simulate API call
      // In production, this would call your API endpoint
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          // Simulate AI response based on input
          if (input.toLowerCase().includes("6-jar") || input.toLowerCase().includes("jar method")) {
            resolve(
              "The 6-jar money management method divides your income into 6 categories:\n\n" +
              "1. **Necessity (55%)**: Essential expenses like rent, food, utilities\n" +
              "2. **Education (10%)**: Learning and self-improvement\n" +
              "3. **Play (10%)**: Entertainment and fun activities\n" +
              "4. **Long-term Savings (10%)**: Future goals and emergencies\n" +
              "5. **Financial Freedom (10%)**: Investments and passive income\n" +
              "6. **Give (5%)**: Charity and helping others\n\n" +
              "This method helps you balance current needs with future goals while ensuring you enjoy life and give back to society. " +
              "FinCoach VN makes it easy to track your spending in each jar automatically!"
            );
          } else if (input.toLowerCase().includes("save") || input.toLowerCase().includes("saving")) {
            resolve(
              "Here are some practical tips for saving money in Vietnam:\n\n" +
              "💰 **Immediate Actions:**\n" +
              "• Cook at home instead of eating out frequently\n" +
              "• Use public transportation or carpooling\n" +
              "• Compare prices before making purchases\n\n" +
              "📊 **Smart Habits:**\n" +
              "• Set up automatic transfers to your savings jar\n" +
              "• Track your expenses daily with FinCoach VN\n" +
              "• Wait 24 hours before making impulse purchases\n\n" +
              "Based on your current spending, I recommend focusing on reducing your Play jar expenses by 10% this month."
            );
          } else {
            resolve(
              "That's a great question! Based on your financial profile, here are my recommendations:\n\n" +
              "• Start by reviewing your current jar allocations\n" +
              "• Focus on areas where you're overspending\n" +
              "• Set specific, measurable financial goals\n\n" +
              "Would you like me to analyze your recent transactions to provide more specific advice?"
            );
          }
        }, 1500);
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-64">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">AI Financial Coach</h1>
              <p className="text-sm text-gray-600">Get personalized financial guidance</p>
            </div>
          </div>
        </header>

        {/* Info Cards */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 flex items-start">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Financial Literacy</p>
                <p className="text-xs text-blue-700 mt-1">Learn budgeting basics</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex items-start">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Personalized Tips</p>
                <p className="text-xs text-green-700 mt-1">Based on your spending</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 flex items-start">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900">AI-Powered</p>
                <p className="text-xs text-purple-700 mt-1">Smart recommendations</p>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 flex items-start">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">VPBank Verified</p>
                <p className="text-xs text-yellow-700 mt-1">Trusted advice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === "user" ? "text-indigo-200" : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Suggested questions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about personal finance..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}