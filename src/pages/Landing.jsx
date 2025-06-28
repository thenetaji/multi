import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Code2,
  Smartphone,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Timer,
  Paintbrush,
  Globe,
  LogIn,
  UserPlus,
  Play,
  Github,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Landing() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        // אם המשתמש מחובר, מפנה אותו לסטודיו
        if (user) {
          window.location.href = '/app/studio';
        }
      } catch (error) {
        // המשתמש לא מחובר - נשאר בדף הנחיתה
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (showLogin) {
    return <LoginForm />;
  }

  if (showSignup) {
    return <SignupForm />;
  }

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "State-of-the-art Claude AI generates complete, functional React Native apps from simple descriptions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Production-Ready Code",
      description: "Get clean, professional code using React Native best practices. No placeholders, no incomplete features.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Live Preview",
      description: "See your app running instantly in our integrated phone simulator. Test and iterate in real-time.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Paintbrush className="w-8 h-8" />,
      title: "Visual Editing",
      description: "Upload screenshots and tell AI exactly what to change. Visual-first development workflow.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Web Research",
      description: "AI researches latest trends and technologies to build modern, up-to-date applications.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: "Instant Deployment",
      description: "Every app is instantly available as Expo Snack. Share with QR codes, test on any device.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      content: "Built my MVP in 10 minutes instead of 10 weeks. The AI understands exactly what I want.",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Freelance Developer",
      content: "My productivity increased 10x. I can now take on way more client projects.",
      avatar: "MR"
    },
    {
      name: "Lisa Park",  
      role: "Product Manager",
      content: "Perfect for rapid prototyping. Non-technical team members can now build functional demos.",
      avatar: "LP"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Vibe Coding</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/app/pricing">
                <Button variant="ghost" className="text-white hover:text-purple-300">
                  מחירים
                </Button>
              </Link>
              <Button 
                onClick={() => setShowLogin(true)} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <LogIn className="w-4 h-4 mr-2" />
                התחברות
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
              פיתוח אפליקציות<br />עם בינה מלאכותית
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              צור אפליקציות מובייל מדהימות בעזרת שיחה טבעית עם הבינה המלאכותית שלנו.
              פשוט תאר מה אתה רוצה, ואנחנו ניצור את זה בשבילך.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowSignup(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-2xl"
              >
                <Rocket className="w-5 h-5 mr-2" />
                התחל בחינם
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg rounded-2xl"
              >
                <Play className="w-5 h-5 mr-2" />
                צפה בהדגמה
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Everything You Need to Build Amazing Apps
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI with professional development tools 
              to deliver a seamless app creation experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              From Idea to App in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Describe Your App", 
                description: "Tell our AI what you want to build in plain English. Be as detailed or as simple as you want.",
                icon: <Sparkles className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "AI Builds Your App",
                description: "Watch as Claude AI generates complete, functional React Native code in real-time.",
                icon: <Code2 className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Test & Deploy",
                description: "Instantly preview your app, make changes, and share with QR codes. Deploy anywhere.",
                icon: <Smartphone className="w-8 h-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
                <div className="text-6xl font-bold text-purple-500/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Loved by Developers Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Build Your Next App?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of developers who are already building faster with AI.
              Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowSignup(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-2xl"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Building Free
              </Button>
              
              <Link to="/app/pricing">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg rounded-2xl"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vibe Coding</span>
            </div>
            
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 Vibe Coding. All rights reserved.</p>
              <p className="text-sm mt-1">Build mobile apps with AI • Powered by Claude</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}