import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { NetworkProblem } from './aiService';

export class FirebaseService {
  async saveProblem(problem: string, solutions: string[]): Promise<void> {
    try {
      await addDoc(collection(db, 'troubleshooting'), {
        problem,
        solutions,
        timestamp: new Date()
      });
      console.log('Problem saved to Firebase!');
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  }

  async getHistory(): Promise<NetworkProblem[]> {
    try {
      const q = query(
        collection(db, 'troubleshooting'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const history: NetworkProblem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          problem: data.problem,
          solutions: data.solutions,
          timestamp: data.timestamp.toDate()
        });
      });
      
      return history;
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
}