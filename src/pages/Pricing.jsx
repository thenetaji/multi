
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Zap,
  Crown,
  Rocket,
  ArrowLeft,
  CreditCard,
  Banknote,
  Infinity,
  Sparkles,
  Users,
  Clock,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Pricing() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.log("User not logged in");
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const plans = [
    {
      id: "starter",
      name: "Starter Plan",
      price: 20,
      credits: 100,
      icon: <Zap className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      description: "Perfect for getting started with AI app development",
      features: [
        "100 Monthly AI Messages",
        "Basic App Generation",
        "Live Preview",
        "Export to Expo Snack",
        "Community Support"
      ],
      limitations: [
        "Limited to simple apps",
        "Standard response time"
      ]
    },
    {
      id: "builder",
      name: "Builder Plan",
      price: 50,
      credits: 250,
      icon: <Crown className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Most popular choice for serious app builders",
      features: [
        "250 Monthly AI Messages",
        "Advanced App Generation",
        "Visual Editing with Images",
        "Web Research Integration",
        "Deep Thinking Mode",
        "Priority Support",
        "Multi-file Projects",
        "Advanced Components"
      ],
      popular: true,
      limitations: []
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: 100,
      credits: 500,
      icon: <Rocket className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      description: "Maximum power for professional developers",
      features: [
        "500 Monthly AI Messages",
        "Enterprise App Generation",
        "All Visual Editing Features",
        "Advanced Web Research",
        "Fastest Response Times",
        "1-on-1 Support",
        "Complex App Architecture",
        "Custom Components",
        "API Integration Assistance",
        "Code Review & Optimization"
      ],
      limitations: []
    }
  ];

  const handlePurchase = async (plan) => {
    setSelectedPlan(plan.id);
    
    // Here you would integrate with your payment processor
    // For now, we'll simulate the purchase process
    
    if (!currentUser) {
      // Redirect to login/signup
      alert("Please log in first to purchase a plan.");
      await User.login();
      return;
    }

    // Simulate payment processing
    try {
      // In a real implementation, you'd integrate with Stripe, PayPal, etc.
      // For demo purposes, we'll directly update the user's token balance and subscription plan
      
      const confirmation = window.confirm(
        `Purchase ${plan.name} for $${plan.price}?\n\nThis will add ${plan.credits} tokens and set your plan to ${plan.name}.`
      );
      
      if (confirmation) {
        const newBalance = (currentUser.token_balance || 0) + plan.credits;
        
        // Update both token balance and subscription plan
        await User.updateMyUserData({ 
            token_balance: newBalance,
            subscription_plan: plan.id 
        });
        
        // Update local state
        setCurrentUser(prev => ({ 
            ...prev, 
            token_balance: newBalance,
            subscription_plan: plan.id
        }));
        
        alert(`Success! ${plan.credits} tokens have been added and your plan is now ${plan.name}.`);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setSelectedPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 py-12 sm:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center"> {/* Removed mb-16 as per outline's general layout fix */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link to={createPageUrl("Studio")}>
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </Link>
          </div>

          {/* New H2 for Pricing as per outline */}
          <h2 className="text-base font-semibold text-purple-400">Pricing</h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // Removed className="mb-8" as new p tag classes handle spacing
          >
            {/* Existing H1 changed to P and classes applied as per outline */}
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                AI Power
              </span>
            </p>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Unlock the full potential of AI-powered app development. Choose the plan that fits your needs.
            </p>
          </motion.div>

          {/* Current User Info */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-slate-800/50 rounded-full px-6 py-3 mb-8"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-300">Logged in as: <span className="text-white font-medium">{currentUser.email}</span></p>
                <div className="flex items-center gap-2">
                  {currentUser.role === 'admin' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <Infinity className="w-3 h-3 mr-1" />
                      Unlimited Access
                    </Badge>
                  ) : (
                    <>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Banknote className="w-3 h-3 mr-1" />
                        {currentUser.token_balance || 0} Tokens
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 capitalize">
                        <Star className="w-3 h-3 mr-1" />
                        {currentUser.subscription_plan || 'Free'} Plan
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 ${
                currentUser?.subscription_plan === plan.id 
                  ? 'ring-2 ring-green-500/50' 
                  : (plan.popular ? 'ring-2 ring-purple-500/30' : '')
              }`}>
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400 ml-2">/month</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-semibold">{plan.credits} Monthly Messages</span>
                  </div>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-400 mb-3 text-sm">Limitations</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="text-xs text-slate-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={selectedPlan === plan.id || currentUser?.role === 'admin' || currentUser?.subscription_plan === plan.id}
                    className={`w-full ${
                      currentUser?.subscription_plan === plan.id
                        ? 'bg-green-600'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'
                    } text-white font-semibold py-3`}
                  >
                    {selectedPlan === plan.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentUser?.subscription_plan === plan.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : currentUser?.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Account
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Choose {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "What happens when I run out of tokens?",
                answer: "When your monthly tokens are depleted, you'll need to upgrade or wait for next month's reset. You can always view your usage in the dashboard."
              },
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Do tokens roll over to next month?",
                answer: "No, tokens reset monthly. This ensures you always get fresh capacity and our latest AI improvements."
              },
              {
                question: "What apps can I build?",
                answer: "Any React Native app! From simple calculators to complex social apps, dating apps, games, and business tools."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/30 border-slate-700/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-slate-400 text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
