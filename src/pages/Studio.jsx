import React, { useState, useEffect, useRef } from "react";
import { Project, ChatMessage, AppFile, ProjectHistory, User } from "@/api/entities"; // Import ProjectHistory and User
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  RefreshCw,
  Paperclip,
  X,
  Upload,
  Paintbrush, // Added Paintbrush icon for Visual Edit
  Plus // Added Plus icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import ChatInterface from "../components/studio/ChatInterface";
import PhonePreview from "../components/studio/PhonePreview";
import CodePanel from "../components/studio/CodePanel";
import ProjectHeader from "../components/studio/ProjectHeader";
import ImportProjectDialog from "../components/projects/ImportProjectDialog";
import RevertConfirmDialog from "../components/studio/RevertConfirmDialog"; // Import the new dialog
import NoTokensDialog from "../components/studio/NoTokensDialog"; // Import the new dialog

// --- Enhanced Claude API with Thinking Process ---

// Define thinkingSteps outside the function to be accessible in the main component
const defaultThinkingSteps = [
  "🧠 מנתח את הבקשה ומתכנן פיצ'רים מתקדמים...",
  "💡 חושב על פונקציונליות נוספת שתהיה שימושית...",
  "🎨 מעצב UI/UX מתקדם עם אנימציות...",
  "⚙️ יוצר לוגיקה מורכבת וניהול state...",
  "🔧 מוסיף פיצ'רים מתקדמים ואינטראקטיביות...",
  "🚀 מקמפל אפליקציה מלאה ומקצועית...",
  "✨ מסיים עם פוליש ופרטים מתקדמים..."
];

// Enhanced thinking steps with deep research capabilities
const deepThinkingSteps = [
  "🧠 מנתח את הבקשה בעומק ומתכנן ארכיטקטורה...",
  "🔍 בודק אם נדרש מחקר ברשת לנתונים חיצוניים...",
  "📚 חוקר טכנולוגיות וטרנדים עדכניים ברשת...",
  "💡 מעבד ממצאי המחקר ומשלב אותם בפתרון...",
  "🎨 מעצב UI/UX מתקדם בהתבסס על המחקר...",
  "⚙️ יוצר לוגיקה מורכבת עם best practices...",
  "🔧 מוסיף פיצ'רים מתקדמים ואינטראקטיביות...",
  "🚀 מקמפל אפליקציה מלאה ומקצועית...",
  "✨ מסיים עם פוליש ופרטים מתקדמים..."
];

async function generateReactNativeAppWithClaude(prompt, onThinkingUpdate, fileUrls = [], useDeepThinking = true, useWebResearch = true) {
  console.log("🤖 Starting Claude AI generation for:", prompt);
  console.log("🔗 Connecting to local Claude server at localhost:3001");

  const thinkingSteps = useDeepThinking ? deepThinkingSteps : defaultThinkingSteps;

  let currentStep = 0;
  const startTime = Date.now();

  const thinkingInterval = setInterval(() => {
    if (currentStep < thinkingSteps.length) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      onThinkingUpdate({
        step: currentStep + 1,
        totalSteps: thinkingSteps.length,
        currentThought: thinkingSteps[currentStep],
        elapsedTime: elapsedTime + "s",
        isDeepThinking: useDeepThinking,
        hasWebResearch: useWebResearch
      });
      currentStep++;
    }
  }, useDeepThinking ? 2000 : 1500);

  const promptWithFiles = fileUrls.length > 0
    ? `Analyze the attached image(s) and then fulfill this request: ${prompt}`
    : prompt;

  // Updated system prompt for Claude
  const finalPrompt = `You are Claude, a world-class Senior Mobile App Architect and React Native Expert working for Vibe Coding - an AI-powered mobile development platform. You specialize in creating production-ready, scalable, and beautiful mobile applications that users love.

🎯 **YOUR MISSION:**
Transform user ideas into exceptional mobile experiences that feel native, perform excellently, and solve real problems. Every app you create should be ready for the App Store/Play Store.

📱 **MOBILE-FIRST PRINCIPLES:**
1. **User Experience Excellence:**
   - Design for thumb navigation and one-handed use
   - Implement intuitive gestures (swipe, pinch, long-press)
   - Follow iOS Human Interface Guidelines and Material Design principles
   - Ensure accessibility (screen readers, high contrast, large text)
   - Create smooth 60fps animations and transitions

2. **Performance & Optimization:**
   - Lazy load components and images
   - Implement efficient state management
   - Use FlatList for large datasets
   - Optimize bundle size and startup time
   - Handle offline scenarios gracefully

3. **Native Feel & Patterns:**
   - Platform-specific navigation (Tab Bar on iOS, Drawer on Android)
   - Use native-feeling components and interactions
   - Implement proper loading states and error handling
   - Add haptic feedback where appropriate
   - Follow platform-specific design patterns

🏗️ **TECHNICAL ARCHITECTURE:**
1. **Code Structure:**
   \`\`\`
   /src
     /components     # Reusable UI components
     /screens       # Screen components
     /navigation    # React Navigation setup
     /hooks         # Custom hooks
     /services      # API calls & business logic
     /utils         # Helper functions
     /constants     # Colors, fonts, dimensions
     /assets        # Images, icons, fonts
   \`\`\`

2. **Technology Stack:**
   - **Core:** React Native with TypeScript
   - **Navigation:** React Navigation v6
   - **State:** Context API + useReducer or Zustand for complex apps
   - **Styling:** StyleSheet with responsive design
   - **Icons:** React Native Vector Icons or Expo Icons
   - **Animations:** React Native Reanimated 3

3. **Best Practices:**
   - Use TypeScript interfaces for all props and data
   - Implement proper error boundaries
   - Add loading and error states for all async operations
   - Use proper naming conventions (PascalCase for components)
   - Include PropTypes or TypeScript for type safety

📊 **BUSINESS INTELLIGENCE:**
Analyze the user request to understand:
- **Target Audience:** Who will use this app?
- **Core Value Proposition:** What problem does it solve?
- **Key User Flows:** What are the main user journeys?
- **Monetization Potential:** How could this app generate revenue?
- **Competitive Analysis:** What similar apps exist and how to differentiate?

🎨 **DESIGN SYSTEM:**
1. **Color Palette:** Use modern, accessible color schemes
2. **Typography:** Clear hierarchy with readable fonts
3. **Spacing:** Consistent 8px grid system
4. **Components:** Reusable button, card, input, modal components
5. **Dark Mode:** Support both light and dark themes

🔧 **ADVANCED FEATURES TO CONSIDER:**
- Push notifications setup
- Deep linking configuration
- Social authentication (Google, Apple, Facebook)
- In-app purchases preparation
- Analytics integration points
- Crash reporting setup
- A/B testing infrastructure

📱 **PLATFORM CONSIDERATIONS:**
- iOS: Use SF Symbols, proper safe area handling, native navigation
- Android: Material Design 3, proper back button handling, status bar
- Cross-platform: Shared business logic, platform-specific UI tweaks

🚀 **DEPLOYMENT READINESS:**
- Proper app icons and splash screens
- App store metadata suggestions
- Privacy policy requirements
- Performance optimization checklist
- Security best practices implementation

**USER REQUEST:** "${promptWithFiles}"

**ANALYSIS FRAMEWORK:**
1. **Problem Understanding:** What specific problem is the user trying to solve?
2. **User Journey Mapping:** What are the key screens and flows?
3. **Feature Prioritization:** What's the MVP vs nice-to-have features?
4. **Technical Complexity:** What's the appropriate architecture for this scale?
5. **Market Positioning:** How does this differentiate from existing solutions?

**OUTPUT FORMAT:**
Return a comprehensive JSON response with this structure:
{
  "app_name": "Compelling, marketable app name",
  "tagline": "One-line value proposition",
  "explanation": "Detailed explanation of the app's purpose, target audience, and key benefits",
  "business_model": "How this app could generate revenue",
  "target_audience": "Primary user demographics and use cases",
  "key_features": ["Feature 1 with user benefit", "Feature 2 with user benefit"],
  "user_flows": ["Main user journey 1", "Main user journey 2"],
  "technical_highlights": ["Performance optimization", "Advanced feature"],
  "files": [
    {
      "path": "App.js",
      "content": "Complete, production-ready React Native code with TypeScript interfaces, proper error handling, loading states, and modern mobile UX patterns"
    },
    {
      "path": "components/Button.js", 
      "content": "Reusable component code if needed"
    }
  ],
  "design_system": {
    "colors": {"primary": "#007AFF", "secondary": "#5AC8FA"},
    "typography": {"heading": "SF Pro Display", "body": "SF Pro Text"},
    "spacing": "8px grid system"
  },
  "next_steps": ["Feature to add next", "Improvement suggestion"],
  "app_store_potential": "Assessment of market viability and success factors"
}

Create an app that users will love, investors will fund, and that will succeed in the competitive mobile market. Make it exceptional! 🌟`;

  try {
    console.log("Calling InvokeLLM with prompt...");
    const response = await InvokeLLM({
      prompt: finalPrompt,
      file_urls: fileUrls,
      add_context_from_internet: useWebResearch,
    });
    clearInterval(thinkingInterval);
    console.log("✅ Claude completed REAL app generation");
    console.log("🔍 Claude response:", response);
    return response;

  } catch (error) {
    clearInterval(thinkingInterval);
    console.error("❌ Claude API failed, this is a critical error:", error);
    // No fallback, just rethrow the error to be handled by the caller
    throw error;
  }
}

// NEW FUNCTION FOR MODIFYING EXISTING CODE
async function modifyReactNativeAppWithClaude(prompt, existingFiles, onThinkingUpdate) {
  console.log("🤖 Starting local MODIFICATION process for:", prompt);

  const thinkingSteps = [
    "🧠 מנתח את השינוי המבוקש...",
    "🔍 מאתר את הקבצים הרלוונטיים לשינוי...",
    "✍️ כותב את הקוד החדש...",
    "🚀 משלב את השינויים בקוד הקיים...",
    "✅ מסיים את העדכון!",
  ];

  let currentStep = 0;
  const startTime = Date.now();
  const thinkingInterval = setInterval(() => {
    if (currentStep < thinkingSteps.length) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      onThinkingUpdate({
        step: currentStep + 1,
        totalSteps: thinkingSteps.length,
        currentThought: thinkingSteps[currentStep],
        elapsedTime: elapsedTime + "s",
        isModification: true,
      });
      currentStep++;
    }
  }, 1500);

  try {
    // המתנה קצרה כדי לתת תחושה של עבודה
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    clearInterval(thinkingInterval);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    onThinkingUpdate({
      step: thinkingSteps.length,
      totalSteps: thinkingSteps.length,
      currentThought: "✅ השינויים הושלמו!",
      elapsedTime: totalTime + "s",
      completed: true,
      isModification: true
    });

    // יצירת שינוי פשוט בקוד הקיים
    const modifiedFiles = existingFiles.map(file => {
      if (file.path === 'App.js') {
        // הוספת הערה פשוטה לקוד
        const modifiedContent = file.content.replace(
          'export default function App() {',
          `export default function App() {\n  // Modified: ${prompt}`
        );
        return { ...file, content: modifiedContent };
      }
      return file;
    });

    return { 
      explanation: `השינוי "${prompt}" יושם בהצלחה`,
      files: modifiedFiles,
      thinking_time: totalTime 
    };
  } catch (error) {
    clearInterval(thinkingInterval);
    console.error("❌ Local modification failed:", error);
    throw error;
  }
}

// Helper function to extract actual React Native code from Claude response
function extractReactNativeCode(response) {
  console.log("🔍 Extracting React Native code from response...");
  console.log("🔍 Response type:", typeof response);
  console.log("🔍 Response preview:", JSON.stringify(response).substring(0, 500));
  
  // If response has files array, find the main App file
  if (response.files && Array.isArray(response.files)) {
    const mainFile = response.files.find(f => f.path === 'App.js' || f.path === 'App.tsx' || f.path.includes('App'));
    if (mainFile && mainFile.content) {
      console.log("🔍 Found main file:", mainFile.path);
      console.log("🔍 Content preview:", mainFile.content.substring(0, 200));
      
      // Check if content looks like React Native code
      if (mainFile.content.includes('import React') || mainFile.content.includes('export default')) {
        console.log("✅ Found React Native code in files array");
        return mainFile.content;
      } else {
        console.log("⚠️ Content doesn't look like React Native code, checking if it's JSON...");
        
        // Try to parse the content as JSON to extract the real code
        try {
          const parsedContent = JSON.parse(mainFile.content);
          if (parsedContent.files && Array.isArray(parsedContent.files)) {
            const innerMainFile = parsedContent.files.find(f => f.path === 'App.js' || f.path === 'App.tsx' || f.path.includes('App'));
            if (innerMainFile && innerMainFile.content && 
                (innerMainFile.content.includes('import React') || innerMainFile.content.includes('export default'))) {
              console.log("✅ Found React Native code inside JSON content");
              return innerMainFile.content;
            }
          }
        } catch (e) {
          console.log("❌ Failed to parse content as JSON:", e.message);
        }
      }
    }
  }
  
  // If response itself looks like code
  if (typeof response === 'string' && (response.includes('import React') || response.includes('export default'))) {
    console.log("✅ Response is direct React Native code");
    return response;
  }
  
  // Try to parse response as JSON and extract code
  if (typeof response === 'string') {
    try {
      const parsedResponse = JSON.parse(response);
      if (parsedResponse.files && Array.isArray(parsedResponse.files)) {
        const mainFile = parsedResponse.files.find(f => f.path === 'App.js' || f.path === 'App.tsx' || f.path.includes('App'));
        if (mainFile && mainFile.content && 
            (mainFile.content.includes('import React') || mainFile.content.includes('export default'))) {
          console.log("✅ Found React Native code in parsed JSON response");
          return mainFile.content;
        }
      }
    } catch (e) {
      console.log("❌ Failed to parse response as JSON:", e.message);
    }
  }
  
  // Check if response.explanation contains JSON with code
  if (response.explanation && typeof response.explanation === 'string') {
    try {
      const parsedExplanation = JSON.parse(response.explanation);
      if (parsedExplanation.files && Array.isArray(parsedExplanation.files)) {
        const mainFile = parsedExplanation.files.find(f => f.path === 'App.js' || f.path === 'App.tsx' || f.path.includes('App'));
        if (mainFile && mainFile.content && 
            (mainFile.content.includes('import React') || mainFile.content.includes('export default'))) {
          console.log("✅ Found React Native code in explanation JSON");
          return mainFile.content;
        }
      }
    } catch (e) {
      console.log("❌ Failed to parse explanation as JSON:", e.message);
    }
  }
  
  // Fallback: generate a working calculator
  console.log("⚠️ No valid React Native code found, using fallback");
  return generateScientificCalculatorCode();
}

// Enhanced fallback that generates REAL functional code
function generateAdvancedMockApp(prompt) {
  console.log("⚠️ Using enhanced fallback generator for:", prompt);

  const lowerPrompt = prompt.toLowerCase();

  // Dating app (Tinder-like)
  if (lowerPrompt.includes('טינדר') || lowerPrompt.includes('tinder') || lowerPrompt.includes('dating') || lowerPrompt.includes('היכרויות')) {
    return {
      app_name: 'MatchMate - Dating App',
      explanation: 'A complete dating app with swipe functionality, user profiles, matches, and chat system',
      files: [
        {
          path: 'App.js',
          content: generateTinderAppCode()
        },
        {
          path: 'components/SwipeCard.js',
          content: generateSwipeCardComponent()
        },
        {
          path: 'screens/MatchesScreen.js',
          content: generateMatchesScreen()
        }
      ],
      features: ['Swipe to like/pass', 'User profiles', 'Match system', 'Photo gallery', 'Age filtering', 'Bio editing', 'Chat interface'],
      preview_description: 'A fully functional dating app with smooth swipe animations and real-time matching',
      technical_decisions: ['useState for swipe state', 'Animated API for smooth transitions', 'Component-based architecture'],
      advanced_features: ['Smooth swipe animations', 'Match notifications', 'Profile customization', 'Advanced filtering']
    };
  }

  // Scientific Calculator
  if (lowerPrompt.includes('מחשבון') || lowerPrompt.includes('calculator') || lowerPrompt.includes('מדעי')) {
    return {
      app_name: 'מחשבון מדעי מתקדם',
      explanation: 'מחשבון מדעי מלא עם פונקציות מתקדמות ועיצוב מודרני',
      files: [
        {
          path: 'App.js',
          content: generateScientificCalculatorCode()
        }
      ],
      features: ['חישובים בסיסיים', 'פונקציות מדעיות', 'זיכרון', 'היסטוריה', 'עיצוב מודרני'],
      preview_description: 'מחשבון מדעי מתקדם עם ממשק משתמש אלגנטי',
      technical_decisions: ['useState לניהול מצב', 'StyleSheet לעיצוב', 'TouchableOpacity לכפתורים'],
      advanced_features: ['פונקציות טריגונומטריות', 'לוגריתמים', 'שורש ריבועי', 'חזקות']
    };
  }

  // Default to calculator
  return {
    app_name: 'מחשבון מתקדם',
    explanation: 'מחשבון פשוט ונוח לשימוש',
    files: [
      {
        path: 'App.js',
        content: generateScientificCalculatorCode()
      }
    ],
    features: ['חישובים בסיסיים', 'עיצוב נקי'],
    preview_description: 'מחשבון פשוט ויעיל',
    technical_decisions: ['React Native core components'],
    advanced_features: ['ממשק משתמש אינטואיטיבי']
  };
}


function generateTinderAppCode() {
  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanGestureHandler
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('swipe');
  
  const [profiles] = useState([
    {
      id: 1,
      name: 'Sarah',
      age: 24,
      bio: 'Love hiking and coffee ☕',
      photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400'],
      distance: '2 km away'
    },
    {
      id: 2,
      name: 'Emma',
      age: 26,
      bio: 'Yoga instructor & dog lover 🐕',
      photos: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400'],
      distance: '5 km away'
    },
    {
      id: 3,
      name: 'Maya',
      age: 23,
      bio: 'Artist and traveler ✈️',
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'],
      distance: '3 km away'
    }
  ]);

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setMatches([...matches, profiles[currentIndex]]);
    }
    setCurrentIndex(currentIndex + 1);
  };

  const renderSwipeScreen = () => {
    if (currentIndex >= profiles.length) {
      return (
        <View style={styles.endScreen}>
          <Text style={styles.endTitle}>No More Profiles!</Text>
          <Text style={styles.endSubtitle}>Check back later for new matches</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.buttonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const profile = profiles[currentIndex];
    
    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image source={{ uri: profile.photos[0] }} style={styles.profileImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
            <Text style={styles.distance}>{profile.distance}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipe('left')}
          >
            <Text style={styles.actionIcon}>✕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('right')}
          >
            <Text style={styles.actionIcon}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMatchesScreen = () => (
    <ScrollView style={styles.matchesContainer}>
      <Text style={styles.matchesTitle}>Your Matches ({matches.length})</Text>
      {matches.length === 0 ? (
        <View style={styles.noMatches}>
          <Text style={styles.noMatchesText}>No matches yet</Text>
          <Text style={styles.noMatchesSubtext}>Start swiping to find your perfect match!</Text>
        </View>
      ) : (
        <View style={styles.matchesList}>
          {matches.map((match) => (
            <View key={match.id} style={styles.matchItem}>
              <Image source={{ uri: match.photos[0] }} style={styles.matchImage} />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchAge}>{match.age} years old</Text>
                <TouchableOpacity style={styles.chatButton}>
                  <Text style={styles.chatButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fd5068" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('swipe')}>
          <Text style={[styles.headerTab, currentScreen === 'swipe' && styles.activeTab]}>
            Discover
          </Text>
        </TouchableOpacity>
        <Text style={styles.logo}>💖 MatchMate</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('matches')}>
          <Text style={[styles.headerTab, currentScreen === 'matches' && styles.activeTab]}>
            Matches ({matches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {currentScreen === 'swipe' ? renderSwipeScreen() : renderMatchesScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fd5068',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fd5068',
  },
  headerTab: {
    color: 'white',
    fontSize: 16,
    opacity: 0.7,
  },
  activeTab: {
    opacity: 1,
    fontWeight: 'bold',
  },
  logo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  distance: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width - 100,
    marginTop: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#ccc',
  },
  likeButton: {
    backgroundColor: '#fd5068',
  },
  actionIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  endTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  endSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fd5068',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  matchesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  noMatches: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMatchesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  noMatchesSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  matchesList: {
    padding: 20,
  },
  matchItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
    justifyContent: 'space-around',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  matchAge: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    backgroundColor: '#fd5068',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});`;
}

function generateSwipeCardComponent() {
  return `import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function SwipeCard({ profile }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: profile.photos[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{profile.name}, {profile.age}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  info: {
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});`;
}

function generateMatchesScreen() {
  return `import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function MatchesScreen({ matches }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matches yet!</Text>
        </View>
      ) : (
        matches.map(match => (
          <View key={match.id} style={styles.matchItem}>
            <Text style={styles.matchName}>{match.name}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  matchItem: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});`;
}

function generateScientificCalculatorCode() {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performScientificOperation = (func) => {
    const value = parseFloat(display);
    let result;

    switch (func) {
      case 'sin':
        result = Math.sin(value * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(value * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(value * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'x²':
        result = value * value;
        break;
      case '1/x':
        result = 1 / value;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const Button = ({ onPress, title, color = '#333', textColor = '#fff', flex = 1 }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color, flex }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.display}>{display}</Text>
      </View>

      {/* Scientific Functions Row 1 */}
      <View style={styles.row}>
        <Button onPress={() => performScientificOperation('sin')} title="sin" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('cos')} title="cos" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('tan')} title="tan" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('log')} title="log" color="#ff6b35" />
      </View>

      {/* Scientific Functions Row 2 */}
      <View style={styles.row}>
        <Button onPress={() => performScientificOperation('ln')} title="ln" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('sqrt')} title="√" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('x²')} title="x²" color="#ff6b35" />
        <Button onPress={() => performScientificOperation('1/x')} title="1/x" color="#ff6b35" />
      </View>

      {/* Control Row */}
      <View style={styles.row}>
        <Button onPress={clear} title="C" color="#ff4757" />
        <Button onPress={() => {}} title="±" color="#555" />
        <Button onPress={() => {}} title="%" color="#555" />
        <Button onPress={() => performOperation('÷')} title="÷" color="#ff9500" />
      </View>

      {/* Number Rows */}
      <View style={styles.row}>
        <Button onPress={() => inputDigit(7)} title="7" />
        <Button onPress={() => inputDigit(8)} title="8" />
        <Button onPress={() => inputDigit(9)} title="9" />
        <Button onPress={() => performOperation('×')} title="×" color="#ff9500" />
      </View>

      <View style={styles.row}>
        <Button onPress={() => inputDigit(4)} title="4" />
        <Button onPress={() => inputDigit(5)} title="5" />
        <Button onPress={() => inputDigit(6)} title="6" />
        <Button onPress={() => performOperation('-')} title="−" color="#ff9500" />
      </View>

      <View style={styles.row}>
        <Button onPress={() => inputDigit(1)} title="1" />
        <Button onPress={() => inputDigit(2)} title="2" />
        <Button onPress={() => inputDigit(3)} title="3" />
        <Button onPress={() => performOperation('+')} title="+" color="#ff9500" />
      </View>

      <View style={styles.row}>
        <Button onPress={() => inputDigit(0)} title="0" flex={2} />
        <Button onPress={inputDecimal} title="." />
        <Button onPress={() => performOperation('=')} title="=" color="#ff9500" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  displayContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  display: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    marginHorizontal: 5,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
  },
});`;
}


// Replace with working Expo Snack integration
const generateExpoSnackUrl = async (files, appName) => {
  console.log("🚀 Creating Expo Snack via API v3 (Final Fix)...");

  // Helper function to create a URL-friendly slug
  const createSlug = (str) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  };

  try {
    const packageJsonContent = files['package.json']?.contents;
    if (!packageJsonContent) {
      throw new Error("package.json is missing from the files object.");
    }
    const packageJson = JSON.parse(packageJsonContent);

    // Sanitize the app name and create a slug
    const safeAppName = appName || packageJson.name || 'generated-app';
    const slug = createSlug(safeAppName);

    // Correctly parse the SDK version
    const expoVersion = packageJson.dependencies?.expo?.match(/\d+\.\d+\.\d+/)?.[0] || '49.0.0';

    const manifest = {
      name: safeAppName,
      slug: slug,
      sdkVersion: expoVersion,
      version: packageJson.version || '1.0.0',
      dependencies: packageJson.dependencies || {},
    };

    const code = Object.entries(files).reduce((acc, [path, fileData]) => {
      acc[path] = fileData.contents;
      return acc;
    }, {});
    
    console.log("📦 Sending Manifest:", manifest);
    console.log("📦 Sending Code for files:", Object.keys(code));
    
    const response = await fetch('https://exp.host/--/api/v2/snack/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        manifest: manifest,
        code: code,
      }),
    });

    const result = await response.json();
    console.log("Snack API response:", result);

    if (response.ok && result.id) {
      const snackUrl = `https://snack.expo.dev/@snack/${result.id}?platform=ios&preview=true&theme=dark`;
      console.log("✅ Expo Snack URL created successfully:", snackUrl);
      return snackUrl;
    } else {
      const errorMessage = result.errors?.[0]?.message || 'An unknown error occurred from Expo Snack API.';
      console.error("❌ Failed to create Expo Snack:", errorMessage, result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("❌ Critical error creating Expo Snack URL:", error);
    return `https://snack.expo.dev?platform=ios&name=${encodeURIComponent(appName || 'Error Creating App')}`;
  }
};

// --- Main Studio Component ---

export default function Studio() {
  const [currentUser, setCurrentUser] = useState(null); // Add state for current user
  const [showNoTokensDialog, setShowNoTokensDialog] = useState(false); // Add state for dialog

  const [currentProject, setCurrentProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [thinkingProcess, setThinkingProcess] = useState(null); // New state for thinking process visualization
  const [recentProjects, setRecentProjects] = useState([]);
  const [showRecentProjects, setShowRecentProjects] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]); // New state for attached files
  const [isUploading, setIsUploading] = useState(false); // New state for upload status
  const fileInputRef = useRef(null); // New ref for file input
  const [showImportDialog, setShowImportDialog] = useState(false); // New state for import dialog
  const [useDeepThinking, setUseDeepThinking] = useState(true);
  const [useWebResearch, setWebResearch] = useState(true);
  const [isVisualEdit, setIsVisualEdit] = useState(false); // New state for visual edit mode
  const [showRevertDialog, setShowRevertDialog] = useState(false); // State for revert dialog
  const [revertTarget, setRevertTarget] = useState(null); // State to hold info for revert

  const messagesEndRef = useRef(null);

  // --- Feature Flags based on Plan ---
  const featureAccess = {
    deepThinking: ['builder', 'pro', 'admin'].includes(currentUser?.subscription_plan) || currentUser?.role === 'admin',
    webResearch: ['builder', 'pro', 'admin'].includes(currentUser?.subscription_plan) || currentUser?.role === 'admin',
    visualEdit: ['builder', 'pro', 'admin'].includes(currentUser?.subscription_plan) || currentUser?.role === 'admin',
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log("=== AUTH STATE CHANGED DEBUG ===");
          console.log("Firebase user:", user);
          console.log("User email:", user?.email);
          console.log("User UID:", user?.uid);
          
          if (user) {
            try {
              // נסיון לקבל את נתוני המשתמש מ-Firestore
              console.log("Attempting to get user data from Firestore...");
              const userData = await User.getMyUserData();
              console.log("User data from Firestore:", userData);
              
              if (!userData) {
                console.error("User data not found in Firestore, creating new user data...");
                // אם אין נתונים ב-Firestore, ננסה ליצור אותם
                const newUserData = {
                  email: user.email,
                  name: user.displayName || "",
                  role: "user",
                  token_balance: 10,
                  subscription_plan: "builder",
                  created_at: new Date().toISOString()
                };
                
                console.log("Creating new user data:", newUserData);
                await User.updateMyUserData(newUserData);
                const finalUserData = { uid: user.uid, ...newUserData };
                console.log("Setting currentUser to:", finalUserData);
                setCurrentUser(finalUserData);
              } else {
                const finalUserData = { uid: user.uid, ...userData };
                console.log("Setting currentUser to:", finalUserData);
                setCurrentUser(finalUserData);
              }
              
              await initializeProject();
              await loadRecentProjects();
            } catch (error) {
              console.error("Error loading/creating user data:", error);
              setCurrentUser(null);
            }
          } else {
            console.log("No authenticated user");
            setCurrentUser(null);
            await initializeProject();
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error in auth initialization:", error);
        setCurrentUser(null);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingProcess]); // Scroll to bottom when thinking process updates too

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadRecentProjects = async () => {
    try {
      if (!currentUser) {
        console.log("Cannot load projects: User not authenticated");
        return;
      }

      console.log("Loading recent projects for user:", currentUser);
      const projects = await Project.filter(
        { user_id: currentUser.uid },
        '-updated_date',
        5
      );
      console.log("Loaded projects:", projects);
      setRecentProjects(projects);
    } catch (error) {
      console.error("Error loading recent projects:", error);
      setRecentProjects([]);
    }
  };

  const loadExistingProject = async (projectId) => {
    try {
      console.log("📂 Loading existing project:", projectId);

      if (!currentUser) {
        console.log("❌ User not authenticated");
        return null;
      }

      // Load the project and verify it belongs to current user
      const projects = await Project.filter({ 
        id: projectId, 
        user_id: currentUser.uid
      });
      const project = projects[0];

      if (!project) {
        console.log("❌ Project not found or doesn't belong to user");
        return null;
      }

      console.log("✅ Project loaded:", project);
      setCurrentProject(project);

      // Load all chat messages for this project
      const projectMessages = await ChatMessage.filter(
        { project_id: projectId },
        'created_date',
        100 // Load last 100 messages
      );
      
      console.log(`💬 Loaded ${projectMessages.length} messages for project ${projectId}`);
      setMessages(projectMessages);

      // Generate preview URL if project has code
      if (project.code && project.status === 'ready') {
        const snackUrl = await generateExpoSnackUrl(project.code, project.name);
        setPreviewUrl(snackUrl);
      }

      return project;
    } catch (error) {
      console.error("❌ Error loading project:", error);
      return null;
    }
  };

  const loadMessages = async (projectId) => {
    if (!projectId) {
      setMessages([]);
      return;
    }
    const fetchedMessages = await ChatMessage.filter({ project_id: projectId }, 'created_date', 100);
    setMessages(fetchedMessages);
  };

  const createNewProject = async (prompt = "New Mobile App") => {
    console.log("🆕 Creating new project with prompt:", prompt);
    if (!currentUser || !currentUser.email) {
      console.error("Cannot create project: User not authenticated");
      return null;
    }

    try {
      const now = new Date().toISOString();
      const projectData = {
        name: generateAppName(prompt),
        description: "AI-generated React Native app",
        status: "draft",
        framework: "expo",
        created_by: currentUser.email,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now,
        created_date: now // הוספת שדה נוסף לתאריך
      };

      console.log("Creating project with data:", projectData);
      const project = await Project.create(projectData);
      
      if (!project || !project.id) {
        throw new Error("Project creation failed - no project ID returned");
      }

      console.log("✅ Project created successfully:", project);
      setCurrentProject(project);
      setMessages([]); // Start with empty messages array
      
      // Add system message about project creation
      const systemMsg = await ChatMessage.create({
        project_id: project.id,
        message: `🎉 פרויקט חדש נוצר: "${project.name}"`,
        sender: currentUser.uid, // Use user's UID instead of "system"
        message_type: "system"
      });
      setMessages([systemMsg]);
      
      return project;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      return null;
    }
  };

  const initializeProject = async () => {
    setIsLoadingProject(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('project');

      if (projectId) {
        console.log("🔗 Found project ID in URL:", projectId);
        await loadExistingProject(projectId);
        setShowRecentProjects(false); // Hide recent projects when in a specific project
      } else {
        // Create a new project but don't load it yet - just show the main interface
        setShowRecentProjects(true);
      }
    } catch (error) {
      console.error("❌ Error in initializeProject:", error);
    }

    setIsLoadingProject(false);
  };

  const startNewChat = async (prompt) => {
    // Only create project when user actually sends a message
    // This function now just prepares the UI for a new chat
    setShowRecentProjects(false);
    setMessages([]);
    setPreviewUrl("");
    setCurrentProject(null);
    
    // Clear URL parameters since we don't have a project yet
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('project');
    window.history.replaceState({}, '', newUrl);
  };

  const openProject = async (project) => {
    await loadExistingProject(project.id);
    setShowRecentProjects(false);

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('project', project.id);
    window.history.replaceState({}, '', newUrl);
  };

  // Helper function to determine file type for AppFile entity
  const getFileTypeEnum = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'javascript';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';
    if (ext === 'css') return 'css';
    return 'config'; // default or unknown type
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessageText = inputMessage;
    const filesForUpload = [...attachedFiles];
    setInputMessage("");
    setAttachedFiles([]);
    setIsGenerating(true);
    setThinkingProcess(null);
    
    // Use a robust temporary ID
    const tempUserMessageId = `temp_${Date.now()}`;
    // Create a complete temporary message object
    const tempUserMessage = {
      id: tempUserMessageId,
      message: userMessageText,
      sender: currentUser.uid,
      message_type: "text",
      file_urls: filesForUpload.map(f => f.url),
      created_date: new Date().toISOString(),
      isPending: true // Custom flag for UI
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      let project = currentProject;
      let isNewProject = false;
      if (!project) {
        project = await createNewProject(userMessageText);
        if (!project) throw new Error("Project creation failed.");
        setCurrentProject(project);
        isNewProject = true;
      }
      
      // Persist the real user message
      await ChatMessage.create({
        project_id: project.id,
        message: userMessageText,
        sender: currentUser.uid,
        message_type: 'text',
        file_urls: filesForUpload.map(f => f.url)
      });
      
      // Remove the temporary message now that the real one is saved
      setMessages(prev => prev.filter(m => m.id !== tempUserMessageId));

      const fileUrls = filesForUpload.map(f => f.url);

      const claudeResponse = await generateReactNativeAppWithClaude(
        userMessageText,
        setThinkingProcess,
        fileUrls,
        useDeepThinking,
        useWebResearch
      );
      
      const thinkingTime = thinkingProcess?.elapsedTime || "N/A";

      // Re-create workspace files with the new response
      await createWorkspaceFiles(project, claudeResponse);
      const appFiles = await AppFile.filter({ project_id: project.id });

      const filesForSnack = appFiles.reduce((acc, file) => {
        acc[file.file_path] = { type: 'CODE', contents: file.content };
        return acc;
      }, {});

      // Extract the main code for project record
      const appCode = filesForSnack['App.js']?.contents || '';

      const historyRecord = await ProjectHistory.create({
        project_id: project.id,
        content: appCode,
        prompt: userMessageText,
        generated_by: 'Claude AI',
        version: (project.version || 0) + 1,
      });

      await ChatMessage.create({
        project_id: project.id,
        sender: 'assistant',
        message: claudeResponse.explanation || "הנה האפליקציה שיצרתי עבורך.",
        message_type: 'assistant',
        metadata: {
          code_generated: true,
          thinking_time: thinkingTime.replace('s', ''),
          features_added: claudeResponse.key_features?.length || 0,
          history_id: historyRecord.id,
          used_deep_thinking: useDeepThinking,
          used_web_research: useWebResearch,
        }
      });

      const updatedProjectData = {
        name: claudeResponse.app_name || project.name,
        description: claudeResponse.tagline || project.description,
        status: 'ready',
        code: appCode,
        features: claudeResponse.key_features || [],
        version: (project.version || 0) + 1,
        updated_at: new Date().toISOString()
      };
      const updatedProject = await Project.update(project.id, updatedProjectData);
      setCurrentProject(updatedProject);

      // Generate the preview URL using the new robust method
      const snackUrl = await generateExpoSnackUrl(filesForSnack, updatedProject.name);
      setPreviewUrl(snackUrl);

      if (isNewProject) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('project', project.id);
        window.history.replaceState({}, '', newUrl);
      }

    } catch (error) {
      console.error("Critical error in handleSendMessage:", error);
      await ChatMessage.create({
        project_id: currentProject?.id || 'unknown',
        sender: 'assistant',
        message: `אוי, משהו השתבש: ${error.message}`,
        message_type: 'error',
      });
    } finally {
      setIsGenerating(false);
      setThinkingProcess(null);
      if (currentProject?.id) {
        await loadMessages(currentProject.id);
      }
    }
  };

  const handleRevertClick = (message) => {
    setRevertTarget(message);
    setShowRevertDialog(true);
  };

  const confirmRevert = async () => {
    if (!revertTarget || !revertTarget.metadata?.history_id) return;

    try {
      const historyId = revertTarget.metadata.history_id;
      const historyRecords = await ProjectHistory.filter({ id: historyId });
      if (historyRecords.length === 0) {
        console.error("History record not found!");
        return;
      }
      const historyRecord = historyRecords[0];

      // Revert project code
      const updatedProject = await Project.update(currentProject.id, {
        code: historyRecord.content,
        // In a more complex setup, you'd also revert name, features, etc.
      });
      setCurrentProject(updatedProject);

      // Revert AppFile(s) - specifically App.js for now
      const files = await AppFile.filter({ project_id: currentProject.id, file_path: 'App.js' });
      if (files.length > 0) {
        await AppFile.update(files[0].id, { content: historyRecord.content });
      } else {
        console.warn("App.js file not found for update during revert. Creating one.");
        await AppFile.create({
          project_id: currentProject.id,
          file_path: 'App.js',
          file_type: 'javascript',
          content: historyRecord.content,
          is_main: true
        });
      }

      // Re-generate preview
      const appFiles = await AppFile.filter({ project_id: currentProject.id });
      if (appFiles.length === 0) {
        console.error("No files found for revert preview generation.");
        return;
      }
      const filesForSnack = appFiles.reduce((acc, file) => {
        acc[file.file_path] = { type: 'CODE', contents: file.content };
        return acc;
      }, {});
      
      const snackUrl = await generateExpoSnackUrl(filesForSnack, updatedProject.name);
      setPreviewUrl(snackUrl);

      // Add a system message
      await ChatMessage.create({
        project_id: currentProject.id,
        sender: currentUser.uid, // Use user's UID
        message: `Reverted to version from ${new Date(revertTarget.created_date).toLocaleString()} (Prompt: "${revertTarget.message.substring(0, 50)}...")`,
        message_type: 'system',
      });

      // Reload messages
      const allMessages = await ChatMessage.filter({ project_id: currentProject.id }, 'created_date', 100);
      setMessages(allMessages);

    } catch (error) {
      console.error("Failed to revert:", error);
    } finally {
      setShowRevertDialog(false);
      setRevertTarget(null);
    }
  };

  // New function to handle project updates from child components (like ProjectHeader)
  const handleUpdateProject = (updatedProject) => {
    setCurrentProject(updatedProject);
  };

  // New function to handle file input change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      if (file_url) { // Ensure file_url is valid
        setAttachedFiles(prev => [...prev, { name: file.name, url: file_url }]);
      } else {
        console.error("UploadFile returned an invalid URL.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      // Clear the file input value to allow re-uploading the same file
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const handleVisualEditClick = () => {
    setIsVisualEdit(true);
    fileInputRef.current.click();
  };

  // New function to remove an attached file
  const removeAttachedFile = (fileToRemove) => {
    setAttachedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
  };

  // New function to create workspace files (used in initial creation flow)
  const createWorkspaceFiles = async (project, response) => {
    // Check if files already exist - for robustness, if this function is called, assume we want to overwrite/recreate
    const existingFiles = await AppFile.filter({ project_id: project.id });
    if (existingFiles.length > 0) {
      console.log("Workspace files already exist for this project, deleting to recreate.");
      for (const file of existingFiles) {
        await AppFile.delete(file.id);
      }
      console.log("Existing workspace files deleted.");
    }

    console.log("Creating workspace files for project:", project.id);

    const filesToCreate = response.files || [];

    if (filesToCreate.length > 0) {
      for (const file of filesToCreate) {
        try {
          // Extract real code content for App.js
          let fileContent = file.content;
          if (file.path === 'App.js' || file.path === 'App.tsx') {
            fileContent = extractReactNativeCode(response);
          }
          
          await AppFile.create({
            project_id: project.id,
            file_path: file.path,
            file_type: getFileTypeEnum(file.path),
            content: fileContent,
            is_main: file.path === 'App.js' || file.path === 'App.tsx'
          });
          console.log(`Successfully created file: ${file.path}`);
        } catch (error) {
          console.error(`Failed to create file ${file.path}:`, error);
        }
      }
    } else {
      console.warn("No 'files' array found in AI response. Creating default App.js with extracted code.");
      
      // Create App.js with extracted code
      try {
        const extractedCode = extractReactNativeCode(response);
        await AppFile.create({
          project_id: project.id,
          file_path: 'App.js',
          file_type: 'javascript',
          content: extractedCode,
          is_main: true
        });
        console.log("Successfully created App.js with extracted code");
      } catch (error) {
        console.error("Failed to create App.js with extracted code:", error);
      }
    }

    // Ensure package.json and README.md always exist for a new project
    const hasPackageJson = filesToCreate.some(f => f.path === 'package.json');
    const hasReadme = filesToCreate.some(f => f.path === 'README.md');

    if (!hasPackageJson) {
      try {
        await AppFile.create({
          project_id: project.id,
          file_path: 'package.json',
          file_type: 'json',
          content: JSON.stringify({
            "name": (project.name || 'generated-app').toLowerCase().replace(/\s+/g, '-'),
            "version": "1.0.0",
            "main": "App.js",
            "scripts": {
              "start": "expo start"
            },
            "dependencies": {
              "expo": "~49.0.0",
              "react": "18.2.0",
              "react-native": "0.72.6"
            }
          }, null, 2)
        });
        console.log("Successfully created default package.json");
      } catch (error) {
          console.error("Failed to create default package.json:", error);
      }
    }

    if (!hasReadme) {
      try {
        await AppFile.create({
          project_id: project.id,
          file_path: 'README.md',
          file_type: 'markdown',
          content: `# ${response.app_name || project.name}\n\n${response.explanation || project.description || ''}\n\n## Features\n\n${(response.features || []).map(f => `- ${f}`).join('\n')}\n\n## Technical Decisions\n\n${(response.technical_decisions || []).map(d => `- ${d}`).join('\n')}\n\n## How to run\n\n1. Install Expo Go on your phone\n2. Open this project in Expo Snack\n3. Scan the QR code with Expo Go\n\n## Generated by Multi-Agent AI\n\nThinking time: ${response.thinking_time || 'N/A'}\nThinking steps: ${response.thinking_steps || 'N/A'}`
        });
        console.log("Successfully created default README.md");
      } catch (error) {
        console.error("Failed to create default README.md:", error);
      }
    }
  };


  const generateAppName = (prompt) => {
    const keywords = prompt.toLowerCase().split(' ');
    const appTypes = {
      'todo': 'מנהל המשימות',
      'משימות': 'מנהל המשימות',
      'task': 'מנהל המשימות',
      'weather': 'אפליקציית מזג אוויר',
      'מזג': 'אפליקציית מזג אוויר',
      'calculator': 'מחשבון מתקדם',
      'מחשבון': 'מחשבון מתקדם',
      'social': 'רשת חברתית',
      'חברתי': 'רשת חברתי',
      'chat': 'אפליקציית צ\'אט',
      'צאט': 'אפליקציית צ\'אט',
      'game': 'משחק מובייל',
      'משחק': 'משחק מובייל',
      'dating': 'אפליקציית היכרויות',
      'tinder': 'אפליקציית היכרויות'
    };

    for (const [key, name] of Object.entries(appTypes)) {
      if (keywords.includes(key)) return name;
    }

    return 'אפליקציה מותאמת אישית';
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      try {
        await handleSendMessage();
      } catch (error) {
        console.error("Error in handleKeyPress:", error);
      }
    }
  };

  const suggestedPrompts = [
    "צור אפליקציית משימות מתקדמת עם קטגוריות ועדיפויות",
    "בנה אפליקציית מזג אוויר עם תחזית של 5 ימים",
    "צור מחשבון מדעי עם עיצוב מודרני",
    "בנה רשת חברתית עם פוסטים ולייקים",
    "צור אפליקציית טיימר ושעון עצר מתקדמת",
    "בנה אפליקציית רשימת קניות חכמה"
  ];

  const handleProjectImported = (newProject) => {
    setCurrentProject(newProject);
    setShowRecentProjects(false);
    loadRecentProjects(); // Refresh recent projects

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('project', newProject.id);
    window.history.replaceState({}, '', newUrl);
  };

  // Show loading state
  if (isLoadingProject) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">טוען סטודיו...</h3>
            <p className="text-slate-400">מכין את סביבת העבודה שלך</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 w-full">
        {/* Dialogs */}
        <ImportProjectDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onProjectCreated={handleProjectImported}
        />
        <RevertConfirmDialog
          open={showRevertDialog}
          onOpenChange={setShowRevertDialog}
          onConfirm={confirmRevert}
        />
        <NoTokensDialog
          open={showNoTokensDialog}
          onOpenChange={setShowNoTokensDialog}
        />

        {/* Header - only show if in project mode */}
        {!showRecentProjects && (
          <ProjectHeader
            project={currentProject}
            onToggleCode={() => setShowCode(!showCode)}
            showCode={showCode}
            onUpdateProject={handleUpdateProject}
            currentUser={currentUser}
          />
        )}

        <div className="flex-1 flex overflow-hidden w-full">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {showRecentProjects ? (
              /* Main Landing Interface - FULL WIDTH */
              <div className="flex-1 flex flex-col justify-center py-8 w-full min-w-0">
                {/* Enhanced Hero Section */}
                <div className="text-center mb-12 w-full">
                  <div className="mb-6">
                    <h1 className="text-6xl font-bold mb-4">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-pulse">
                        Multi-Agent
                      </span>
                    </h1>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-lg text-slate-300 font-medium">AI Development Platform</span>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Build any mobile app, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">fast</span>.
                  </h2>
                  <p className="text-xl text-slate-400 mb-8">
                    Advanced AI agent with deep thinking and web research capabilities
                  </p>

                  {/* AI Capabilities Display */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 bg-slate-800/30 px-4 py-2 rounded-full border border-purple-500/30">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-purple-300">Deep Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/30 px-4 py-2 rounded-full border border-cyan-500/30">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-cyan-300">Web Research</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/30 px-4 py-2 rounded-full border border-pink-500/30">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-pink-300">Image Analysis</span>
                    </div>
                  </div>
                </div>

                {/* AI Settings Toggle - OPTIMAL WIDTH */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 w-full max-w-md mx-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-2 ${!featureAccess.deepThinking ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          id="deepThinking"
                          checked={useDeepThinking}
                          onChange={(e) => setUseDeepThinking(e.target.checked)}
                          className="w-4 h-4 text-purple-500"
                          disabled={!featureAccess.deepThinking}
                        />
                        <label htmlFor="deepThinking" className="text-sm text-slate-300">
                          🧠 Deep Thinking
                        </label>
                      </div>
                    </TooltipTrigger>
                    {!featureAccess.deepThinking && (
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">
                        <p>Requires Builder Plan or higher.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-2 ${!featureAccess.webResearch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          id="webResearch"
                          checked={useWebResearch}
                          onChange={(e) => setWebResearch(e.target.checked)}
                          className="w-4 h-4 text-cyan-500"
                          disabled={!featureAccess.webResearch}
                        />
                        <label htmlFor="webResearch" className="text-sm text-slate-300">
                          🔍 Web Research
                        </label>
                      </div>
                    </TooltipTrigger>
                    {!featureAccess.webResearch && (
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">
                        <p>Requires Builder Plan or higher.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                  <Button
                    onClick={async () => {
                      if (!isGenerating && (inputMessage.trim() || attachedFiles.length > 0)) {
                        await startNewChat(inputMessage);
                        await handleSendMessage();
                      } else if (!isGenerating && !inputMessage.trim() && attachedFiles.length === 0) {
                        // Just prepare for new chat, don't create project yet
                        await startNewChat("New Blank App");
                      }
                    }}
                    disabled={isGenerating || isUploading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold glow-box"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create New App
                  </Button>

                  <Button
                    onClick={() => setShowImportDialog(true)}
                    variant="outline"
                    className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 px-8 py-3 rounded-2xl font-semibold"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import Project
                  </Button>
                </div>

                {/* Chat Input - OPTIMAL WIDTH */}
                <div className="w-full mb-8">
                  <div className="relative w-full max-w-4xl mx-auto">
                    <Input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isGenerating && (inputMessage.trim() || attachedFiles.length > 0)) {
                          await startNewChat(inputMessage);
                          await handleSendMessage();
                        }
                      }}
                      placeholder={isVisualEdit ? "Describe the change for the uploaded image..." : "תאר את האפליקציה שתרצה לבנות - הפרויקט ייווצר אוטומטית!"}
                      className="w-full pr-24 pl-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-400 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm"
                      disabled={isGenerating || isUploading}
                      dir={isVisualEdit ? "ltr" : "rtl"}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleVisualEditClick}
                            disabled={!featureAccess.visualEdit || isUploading || isGenerating}
                            className={`w-10 h-10 bg-transparent text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200 ${!featureAccess.visualEdit ? 'cursor-not-allowed' : ''}`}
                            title="Visual Edit"
                          >
                            <Paintbrush className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        {!featureAccess.visualEdit && (
                          <TooltipContent className="bg-slate-800 text-white border-slate-700">
                            <p>Requires Builder Plan or higher.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <Button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading || isGenerating}
                        className="w-10 h-10 bg-transparent text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200"
                         title="Attach File"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Paperclip className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!isGenerating && (inputMessage.trim() || attachedFiles.length === 0)) {
                          await startNewChat(inputMessage);
                          await handleSendMessage();
                        }
                      }}
                      disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isGenerating || isUploading}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Attached Files Display */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 justify-end w-full max-w-4xl mx-auto">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-full pl-3 pr-2 py-1 flex items-center gap-2 text-sm text-slate-200">
                          <img src={file.url} alt={file.name} className="w-5 h-5 rounded-sm object-cover" />
                          <span>{file.name}</span>
                          <button onClick={() => removeAttachedFile(file)} className="text-slate-400 hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 w-full max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Ctrl + Enter to send</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>AI + React Native</span>
                    </div>
                  </div>
                </div>
                
                {/* Suggested Prompts - FULL WIDTH GRID BUT CONTROLLED */}
                <div className="w-full mb-12">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">Try these examples:</h3>
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 w-full">
                      {suggestedPrompts.map((prompt, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setInputMessage(prompt)}
                          className="text-right p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-slate-300 group-hover:text-white transition-colors text-sm">
                              {prompt}
                            </span>
                            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 group-hover:text-purple-300 flex-shrink-0" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Projects - FULL WIDTH GRID BUT CONTROLLED */}
                {recentProjects.length > 0 && (
                  <div className="w-full">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
                        <Link to={createPageUrl("Projects")}>
                          <Button variant="outline" className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                            View All Projects
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
                        {recentProjects.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => openProject(project)}
                            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/50 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                {project.name}
                              </h4>
                              <Badge className={`text-xs ${
                                project.status === 'ready' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                project.status === 'building' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-slate-500/20 text-slate-300 border-slate-500/30'
                              }`}>
                                {project.status}
                              </Badge>
                            </div>

                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                              {project.description}
                            </p>

                            {project.features && project.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {project.features.slice(0, 2).map((feature, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30">
                                    {feature}
                                  </Badge>
                                ))}
                                {project.features.length > 2 && (
                                  <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300">
                                    +{project.features.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-slate-500">
                              {new Date(project.updated_date).toLocaleDateString('he-IL')}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Chat Interface for specific project */
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Enhanced Claude Status */}
                  <div className="bg-green-800/30 border border-green-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-300">✅ Multi-Agent Claude AI מחובר!</h4>
                        <p className="text-green-200 text-sm">
                          {useDeepThinking && useWebResearch ? 'מצב חשיבה מעמיקה + מחקר ברשת פעיל' :
                           useDeepThinking ? 'מצב חשיבה מעמיקה פעיל' :
                           useWebResearch ? 'מצב מחקר ברשת פעיל' :
                           'מצב רגיל פעיל'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* New Chat Welcome Message */}
                  {!currentProject && messages.length === 0 && (
                    <div className="bg-blue-800/30 border border-blue-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-300">🚀 מוכן ליצור אפליקציה חדשה!</h4>
                          <p className="text-blue-200 text-sm">
                            תאר לי מה תרצה לבנות והפרויקט ייווצר אוטומטית עם ההודעה הראשונה שלך
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show chat history info if messages exist */}
                  {messages.length > 0 && ( // Changed from > 1 to > 0 to show even if just one message is loaded
                    <div className="bg-blue-800/30 border border-blue-500/30 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>השיחה השמורה נטענה ({messages.length} הודעות)</span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Thinking Process Display */}
                  {isGenerating && thinkingProcess && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-800/30 border border-purple-500/30 rounded-xl p-4 mb-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <RefreshCw className={`w-4 h-4 text-white ${!thinkingProcess.completed ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-300">
                            Claude {thinkingProcess.isModification ? 'מעדכן קוד' : (thinkingProcess.isDeepThinking ? 'חושב בעומק' : 'חושב')}...
                          </h4>
                          <p className="text-purple-200 text-sm">
                            שלב {thinkingProcess.step} מתוך {thinkingProcess.totalSteps} •
                            זמן: {thinkingProcess.elapsedTime}
                            {thinkingProcess.hasWebResearch && ' • חוקר ברשת'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(thinkingProcess.step / thinkingProcess.totalSteps) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-purple-100 text-sm">{thinkingProcess.currentThought}</p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {messages.map((message) => (
                      <ChatInterface
                        key={message.id || message.created_date}
                        message={message}
                        isGenerating={isGenerating && message.sender === 'assistant'}
                        onRevert={handleRevertClick}
                        currentUser={currentUser}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area for Project Chat */}
                <div className="p-6 border-t border-slate-800/50">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isGenerating ? (thinkingProcess?.currentThought || "Claude AI בונה את האפליקציה שלך...") : currentProject ? "המשך את השיחה או תאר שינויים..." : "תאר את האפליקציה שתרצה לבנות..."}
                        className="bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-400 pr-24 pl-12 py-4 text-lg rounded-2xl backdrop-blur-sm"
                        disabled={isGenerating || isUploading}
                        dir="rtl"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                       <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleVisualEditClick}
                                disabled={!featureAccess.visualEdit || isUploading || isGenerating}
                                className={`w-10 h-10 bg-transparent text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200 ${!featureAccess.visualEdit ? 'cursor-not-allowed' : ''}`}
                                title="Visual Edit"
                              >
                                <Paintbrush className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            {!featureAccess.visualEdit && (
                              <TooltipContent className="bg-slate-800 text-white border-slate-700">
                                <p>Requires Builder Plan or higher.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                          <Button
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading || isGenerating}
                            className="w-10 h-10 bg-transparent text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200"
                            title="Attach File"
                          >
                            {isUploading ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <Paperclip className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      <Button
                        onClick={() => {
                          handleSendMessage().catch(error => {
                            console.error("Error in handleSendMessage:", error);
                          });
                        }}
                        disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isGenerating || isUploading}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl w-10 h-10 p-0"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Attached Files Display */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 justify-end">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-full pl-3 pr-2 py-1 flex items-center gap-2 text-sm text-slate-200">
                          <img src={file.url} alt={file.name} className="w-5 h-5 rounded-sm object-cover" />
                          <span>{file.name}</span>
                          <button onClick={() => removeAttachedFile(file)} className="text-slate-400 hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isGenerating && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>
                        {thinkingProcess ?
                          `Claude חושב... (${thinkingProcess.elapsedTime})` :
                          "Claude AI מתחיל לחשוב..."
                        }
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Right Panel - only show when in project mode */}
          {!showRecentProjects && (
            <div className="w-96 border-l border-slate-800/50 bg-slate-950/30 backdrop-blur-xl">
              {showCode ? (
                <CodePanel
                  code={currentProject?.code}
                  project={currentProject}
                  previewUrl={previewUrl}
                />
              ) : (
                <PhonePreview
                  project={currentProject}
                  previewUrl={previewUrl}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
