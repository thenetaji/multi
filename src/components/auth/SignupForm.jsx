import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/utils/logger';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      logger.log('מתחיל תהליך הרשמה עבור:', email);
      
      // יצירת משתמש חדש
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      logger.log('משתמש נוצר בהצלחה:', userCredential.user.uid);
      
      const user = userCredential.user;

      // עדכון שם המשתמש
      await updateProfile(user, {
        displayName: name
      });

      try {
        // יצירת מסמך משתמש ב-Firestore
        logger.log('יוצר מסמך משתמש ב-Firestore...');
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          role: 'user',
          token_balance: 10, // מספר טוקנים התחלתי
          created_at: new Date().toISOString()
        });
        logger.log('מסמך משתמש נוצר בהצלחה');
      } catch (firestoreError) {
        logger.error('שגיאה ביצירת מסמך משתמש ב-Firestore:', firestoreError);
        // במקרה של שגיאה, ננסה למחוק את המשתמש שנוצר ב-Authentication
        try {
          await user.delete();
          setError('שגיאה בהרשמה. אנא נסו שוב');
          return;
        } catch (deleteError) {
          logger.error('שגיאה במחיקת משתמש:', deleteError);
          setError('שגיאה בהרשמה. אנא צרו קשר עם התמיכה');
          return;
        }
      }

      // ניווט לדף הסטודיו
      logger.log('מנווט לדף הסטודיו...');
      navigate('/app/studio');
    } catch (err) {
      logger.error('פרטי השגיאה המלאים:', err);
      
      // תרגום שגיאות Firebase לעברית
      switch(err.code) {
        case 'auth/email-already-in-use':
          setError('כתובת האימייל כבר קיימת במערכת');
          break;
        case 'auth/invalid-email':
          setError('כתובת האימייל אינה תקינה');
          break;
        case 'auth/operation-not-allowed':
          setError('ההרשמה אינה מאופשרת כרגע. אנא פנה למנהל המערכת');
          break;
        case 'auth/weak-password':
          setError('הסיסמה חלשה מדי. יש להשתמש בלפחות 6 תווים');
          break;
        case 'auth/network-request-failed':
          setError('בעיית תקשורת. אנא בדקו את חיבור האינטרנט שלכם');
          break;
        case 'auth/api-key-not-valid':
          setError('שגיאת הגדרות מערכת. אנא פנה למנהל המערכת');
          logger.error('מפתח ה-API אינו תקין. יש לבדוק את קובץ הקונפיגורציה');
          break;
        default:
          setError('שגיאה בהרשמה. אנא נסו שוב מאוחר יותר');
          logger.error('קוד שגיאה לא מוכר:', err.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              הרשמה ל-Vibe Coding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="שם מלא"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    נרשם...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    הרשמה
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupForm; 