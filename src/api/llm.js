import { auth, db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { logger } from "@/utils/logger";

export class LLMService {
  static async invoke({
    prompt,
    file_urls = [],
    add_context_from_internet = false,
    response_json_schema = null,
  }) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // תיעוד הבקשה
    const requestDoc = await addDoc(collection(db, "llm_requests"), {
      prompt,
      file_urls,
      add_context_from_internet,
      userId: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    try {
      const anthropic = new Anthropic({
        apiKey: "my_api_key", // defaults to process.env["ANTHROPIC_API_KEY"]
        dangerousAllowBrowser: true, // only use in browser environments
      });

      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
        // Included the original parameters
        metadata: {
          file_urls,
          add_context_from_internet,
          response_json_schema,
          request_id: requestDoc.id,
        },
      });

      const data = response.content[0].text;

      // עדכון סטטוס הבקשה ל-completed
      await addDoc(collection(db, "llm_requests"), {
        status: "completed",
        response: data,
      });

      return data;
    } catch (error) {
      logger.error("Claude API error:", error);

      // עדכון סטטוס הבקשה ל-failed
      await addDoc(collection(db, "llm_requests"), {
        status: "failed",
        error: error.message,
      });

      throw error;
    }
  }

  static async generateImage(prompt) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const requestDoc = await addDoc(collection(db, "image_requests"), {
      prompt,
      userId: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    try {
      const response = await fetch(`${API_URL}/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          prompt,
          request_id: requestDoc.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      await addDoc(collection(db, "image_requests"), {
        status: "completed",
        response: data,
      });

      return data;
    } catch (error) {
      logger.error("Image generation API error:", error);

      await addDoc(collection(db, "image_requests"), {
        status: "failed",
        error: error.message,
      });

      throw error;
    }
  }

  static async extractDataFromFile(file) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const requestDoc = await addDoc(
      collection(db, "file_extraction_requests"),
      {
        fileName: file.name,
        fileType: file.type,
        userId: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        status: "pending",
      }
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("request_id", requestDoc.id);

      const response = await fetch(`${API_URL}/extract`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      await addDoc(collection(db, "file_extraction_requests"), {
        status: "completed",
        response: data,
      });

      return data;
    } catch (error) {
      logger.error("File extraction API error:", error);

      await addDoc(collection(db, "file_extraction_requests"), {
        status: "failed",
        error: error.message,
      });

      throw error;
    }
  }
}
