import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';

class AnalyticsService {
  static async getUserStats(userId) {
    try {
      const userStatsRef = collection(db, 'userStats');
      const q = query(userStatsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs[0]?.data() || this.getDefaultStats();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return this.getDefaultStats();
    }
  }

  static getDefaultStats() {
    return {
      matchesPlayed: 0,
      winRate: 0,
      tournamentsWon: 0,
      currentRank: 'Bronze',
      recentMatches: [],
      achievements: [],
      skillProgress: {}
    };
  }

  static subscribeToUserStats(userId, callback) {
    const userStatsRef = collection(db, 'userStats');
    const q = query(userStatsRef, where('userId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const stats = snapshot.docs[0]?.data() || this.getDefaultStats();
      callback(stats);
    }, (error) => {
      console.error('Error in stats subscription:', error);
      callback(this.getDefaultStats());
    });
  }

  static async getRecentMatches(userId) {
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return [];
    }
  }

  static subscribeToRecentMatches(userId, callback) {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(matches);
    }, (error) => {
      console.error('Error in matches subscription:', error);
      callback([]);
    });
  }

  static async getAchievements(userId) {
    try {
      const achievementsRef = collection(db, 'achievements');
      const q = query(
        achievementsRef,
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  static subscribeToAchievements(userId, callback) {
    const achievementsRef = collection(db, 'achievements');
    const q = query(
      achievementsRef,
      where('userId', '==', userId),
      orderBy('unlockedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const achievements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(achievements);
    }, (error) => {
      console.error('Error in achievements subscription:', error);
      callback([]);
    });
  }

  static async getSkillProgress(userId) {
    try {
      const skillsRef = collection(db, 'skills');
      const q = query(skillsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs[0]?.data()?.progress || {};
    } catch (error) {
      console.error('Error fetching skill progress:', error);
      return {};
    }
  }

  static subscribeToSkillProgress(userId, callback) {
    const skillsRef = collection(db, 'skills');
    const q = query(skillsRef, where('userId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const progress = snapshot.docs[0]?.data()?.progress || {};
      callback(progress);
    }, (error) => {
      console.error('Error in skills subscription:', error);
      callback({});
    });
  }

  static calculateWinRate(matches) {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter(match => match.result === 'win').length;
    return Math.round((wins / matches.length) * 100);
  }

  static determineRank(stats) {
    const { winRate, tournamentsWon, matchesPlayed } = stats;
    
    if (winRate >= 70 && tournamentsWon >= 10 && matchesPlayed >= 100) return 'Diamond';
    if (winRate >= 60 && tournamentsWon >= 5 && matchesPlayed >= 50) return 'Platinum';
    if (winRate >= 50 && tournamentsWon >= 3 && matchesPlayed >= 30) return 'Gold';
    if (winRate >= 40 && matchesPlayed >= 20) return 'Silver';
    if (winRate >= 30 && matchesPlayed >= 10) return 'Bronze';
    return 'Rookie';
  }
}

export default AnalyticsService;
