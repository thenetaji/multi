import { auth, db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// מחלקת בסיס עם פעולות CRUD
class BaseEntity {
  static collection;

  static async get(id) {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async list() {
    const querySnapshot = await getDocs(collection(db, this.collection));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async create(data) {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  static async update(id, data) {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
    return { id, ...data };
  }

  static async delete(id) {
    const docRef = doc(db, this.collection, id);
    await deleteDoc(docRef);
    return true;
  }

  static async filter(conditions = {}, orderBy = 'created_at', limit = 100) {
    const q = query(
      collection(db, this.collection),
      ...Object.entries(conditions).map(([field, value]) => where(field, '==', value))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// מחלקות הישויות
class ProjectEntity extends BaseEntity {
  static collection = 'projects';

  static async getMyProjects() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await this.filter({ user_id: user.uid });
  }

  static async create(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    return await super.create({
      ...data,
      user_id: user.uid,
      created_by: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  static async filter(conditions = {}, orderBy = 'created_at', limit = 100) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // אם לא צוין user_id בתנאים, נוסיף אותו אוטומטית
    if (!conditions.user_id && !conditions.id) {
      conditions.user_id = user.uid;
    }

    return await super.filter(conditions, orderBy, limit);
  }
}

class ChatMessageEntity extends BaseEntity {
  static collection = 'chat_messages';
}

class AppFileEntity extends BaseEntity {
  static collection = 'app_files';
}

class ProjectHistoryEntity extends BaseEntity {
  static collection = 'project_history';
}

class GitHubConnectionEntity extends BaseEntity {
  static collection = 'github_connections';
}

// מחלקת משתמש
class UserEntity extends BaseEntity {
  static collection = 'users';

  static async invite(email) {
    return await this.create({
      email,
      role: 'user',
      token_balance: 10,
      status: 'invited'
    });
  }

  static async updateMyUserData(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await this.update(user.uid, data);
  }

  static async getMyUserData() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await this.get(user.uid);
  }

  static async list() {
    return await super.list();
  }

  static async update(id, data) {
    return await super.update(id, data);
  }

  static async delete(id) {
    return await super.delete(id);
  }
}

// ייצוא הישויות באותו מבנה כמו ב-base44
export const Project = ProjectEntity;
export const ChatMessage = ChatMessageEntity;
export const AppFile = AppFileEntity;
export const ProjectHistory = ProjectHistoryEntity;
export const GitHubConnection = GitHubConnectionEntity;
export const User = UserEntity;