import { auth, db } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { LLMService } from './llm';

// Core integrations class
class CoreIntegrations {
  static async InvokeLLM({ prompt, file_urls = [], add_context_from_internet = false, response_json_schema = null }) {
    return await LLMService.invoke({
      prompt,
      file_urls,
      add_context_from_internet,
      response_json_schema
    });
  }

  static async SendEmail({ to, subject, body, attachments = [] }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // תיעוד שליחת המייל
    await addDoc(collection(db, 'email_requests'), {
      to,
      subject,
      body,
      attachments,
      user_id: user.uid,
      created_at: new Date().toISOString(),
      status: 'pending'
    });

    // TODO: להחליף בשליחת מייל אמיתית
    return { status: 'sent' };
  }

  static async UploadFile({ file }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      // יצירת שם ייחודי לקובץ
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(db, `uploads/${user.uid}/${fileName}`);

      // העלאת הקובץ
      await uploadBytes(storageRef, file);

      // קבלת URL להורדה
      const file_url = await getDownloadURL(storageRef);

      // תיעוד ההעלאה
      await addDoc(collection(db, 'file_uploads'), {
        file_name: fileName,
        file_url,
        user_id: user.uid,
        created_at: new Date().toISOString()
      });

      return { file_url };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async GenerateImage({ prompt }) {
    return await LLMService.generateImage(prompt);
  }

  static async ExtractDataFromUploadedFile({ file_url, json_schema = null }) {
    return await LLMService.extractDataFromFile({
      file_url,
      json_schema
    });
  }
}

// ייצוא באותו מבנה כמו ב-base44
export const Core = CoreIntegrations;
export const InvokeLLM = CoreIntegrations.InvokeLLM;
export const SendEmail = CoreIntegrations.SendEmail;
export const UploadFile = CoreIntegrations.UploadFile;
export const GenerateImage = CoreIntegrations.GenerateImage;
export const ExtractDataFromUploadedFile = CoreIntegrations.ExtractDataFromUploadedFile; 