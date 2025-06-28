import express from 'express';
import cors from 'cors';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// הגדרת Claude API
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// נתיב לקריאת Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, response_json_schema } = req.body;
    
    console.log('📨 Received request for Claude API');
    console.log('Prompt length:', prompt.length);
    console.log('🔍 Prompt preview:', prompt.substring(0, 300) + '...');
    
    // שיפור הפרומפט כדי לוודא שClaude מחזיר קוד אמיתי
    const enhancedPrompt = `You are a senior React Native engineer and system architect with deep expertise in building scalable, modular, and beautiful mobile applications using React Native, TypeScript, Redux, and TailwindCSS (NativeWind). You work inside the Vibe Coding platform, where your goal is to generate production-grade mobile code that works seamlessly with the Expo Snack preview environment, while maintaining modern design standards.

When creating applications:
1. Use TypeScript as the default language. Structure code professionally using interfaces, props typing, and strict typing where helpful. If TypeScript is not supported in the preview environment, gracefully fallback to clean JavaScript using TypeScript-like principles.

2. Follow modern architecture principles:
 - Use atomic component structure: organize UI in small reusable components.
 - Structure files clearly into \`/components\`, \`/screens\`, \`/contexts\`, \`/hooks\`, \`/assets\`, etc.
 - Apply separation of concerns: logic, styling, and rendering should be cleanly separated.

3. For UI, use:
 - React Native core components when 3rd-party libraries are unavailable.
 - TailwindCSS via NativeWind where permitted. If NativeWind is not installed, you may simulate Tailwind-style layout using StyleSheet equivalents.
 - Follow best practices for responsive layout, accessibility, and modern mobile UI design.

4. For state management:
 - Use React's built-in \`useState\`, \`useEffect\`, \`useContext\`, and \`useReducer\` for light state logic.
 - For more complex state, use Redux Toolkit with \`Provider\` and store setup in a \`/store\` directory.

5. Always create:
 - Clean and meaningful file names.
 - Reusable components.
 - Accurate imports and properly structured folders.

6. You can also:
 - Perform deep reasoning and structured breakdowns.
 - Analyze user-provided images with advanced visual understanding.
 - Simulate web search behavior to generate relevant, up-to-date content or references, even if not actually browsing.
 - Use critical thinking to assess the best design and logic for any feature.

7. If an image is provided, analyze its UI/UX deeply and translate it into React Native code with appropriate layout and styling.

8. Your tone is helpful, confident, and your output must be clean, well-organized, and easy to understand and modify by human developers.

This system is part of the Multi-Agent framework. Coordinate internally with other agents if needed for backend, API integration, design, or testing roles.

Above all, ensure:
- Code runs without errors in the Expo Snack preview.
- The UI is modern, elegant, and beautiful.
- The architecture supports scalability and future integrations.

USER REQUEST: ${prompt}

CRITICAL OUTPUT REQUIREMENTS:
You MUST return ONLY a valid JSON object that conforms to the structure specified below. Do not include any extra text, explanations, apologies, or markdown \`json\` backticks before or after the JSON object. Your entire response must be the JSON object itself.

{
  "app_name": "Your App Name",
  "explanation": "Brief description of what the app does",
  "files": [
    {
      "path": "App.js",
      "content": "ACTUAL, UNESCAPED, RAW REACT NATIVE CODE HERE. NOT A STRING, BUT THE LITERAL CODE."
    }
  ],
  "features": ["Feature 1", "Feature 2"]
}
`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: enhancedPrompt
      }]
    });

    console.log('✅ Claude responded successfully');
    
    const responseText = message.content[0].text;
    console.log('🔍 Claude raw response preview:', responseText.substring(0, 500));

    function extractJson(str) {
      const match = str.match(/\{[\s\S]*\}/);
      if (match) {
        return match[0];
      }
      return null;
    }

    let jsonString = extractJson(responseText);

    if (!jsonString) {
      console.error('❌ Critical Error: No JSON object found in Claude response.');
      return res.status(500).json({ 
        error: 'Claude returned non-JSON response',
        details: 'Could not find a JSON object in the response string.',
        raw_response: responseText,
      });
    }

    let responseData;
    try {
      responseData = JSON.parse(jsonString);
      console.log('✅ Successfully parsed outer JSON from Claude.');

      // The critical unwrapping logic
      if (responseData.files && responseData.files[0] && typeof responseData.files[0].content === 'string') {
        const innerJsonString = extractJson(responseData.files[0].content);
        if (innerJsonString) {
          console.log('🔍 Nested JSON detected. Attempting to unwrap...');
          try {
            responseData = JSON.parse(innerJsonString);
            console.log('✅ Successfully unwrapped nested JSON.');
          } catch (innerError) {
            console.log('ⓘ Could not parse nested JSON, proceeding with outer content as code.');
          }
        }
      }

    } catch (error) {
      console.error('❌ Critical Error: Failed to parse JSON response from Claude.', error);
          return res.status(500).json({ 
        error: 'Claude returned invalid JSON format',
        details: error.message,
        raw_response: responseText,
      });
    }
    
    console.log('🚀 Sending structured response to client');
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Claude API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// נתיב לבדיקת זמינות
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Claude API Server is running' });
});

app.listen(port, () => {
  console.log(`🚀 Claude API Server running on http://localhost:${port}`);
  console.log(`✅ Claude API key configured`);
}); 