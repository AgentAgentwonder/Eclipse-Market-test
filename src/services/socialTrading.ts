/**
 * Advanced Social Trading & Community Features for Eclipse Market Pro
 *
 * Features:
 * - Copy trading with performance tracking
 * - Social feed with trading insights
 * - Community-driven analysis
 * - Leaderboards and competitions
 * - Trading challenges and achievements
 * - Educational content sharing
 * - Real-time social interactions
 * - Reputation and trust system
 *
 * @version 2.0.0
 * @author Eclipse Market Pro Team
 */

import { invoke } from '@tauri-apps/api/core';
import { useLogger } from '../utils/logger';

export interface SocialProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isPro: boolean;
  followersCount: number;
  followingCount: number;
  reputationScore: number;
  tradingStats: TradingStats;
  badges: Badge[];
  joinedAt: string;
  lastActive: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  longestWinStreak: number;
  tradesThisMonth: number;
  riskScore: number;
  preferredStrategies: string[];
  mostTradedAssets: string[];
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: SocialProfile;
  content: string;
  type: 'TRADE' | 'ANALYSIS' | 'INSIGHT' | 'PREDICTION' | 'EDUCATIONAL' | 'QUESTION';
  assets?: string[];
  charts?: ChartData[];
  tags: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  relatedTrade?: TradeExecution;
}

export interface Comment {
  id: string;
  authorId: string;
  author: SocialProfile;
  content: string;
  likes: number;
  replies: Comment[];
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
}

export interface TradeExecution {
  id: string;
  traderId: string;
  asset: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: string;
  strategy: string;
  reasoning?: string;
  confidence: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  screenshots?: string[];
  tags: string[];
}

export interface CopyTradingSettings {
  traderId: string;
  isActive: boolean;
  allocationPercent: number;
  maxAllocation: number;
  minAllocation: number;
  copyBuys: boolean;
  copySells: boolean;
  stopLossEnabled: boolean;
  stopLossPercent: number;
  takeProfitEnabled: boolean;
  takeProfitPercent: number;
  maxOpenPositions: number;
  assetsToCopy: string[];
  assetsToExclude: string[];
  maxRiskPerTrade: number;
  autoRebalance: boolean;
}

export interface TradingChallenge {
  id: string;
  title: string;
  description: string;
  type: 'RETURN' | 'WIN_RATE' | 'DRAWDOWN' | 'VOLUME' | 'CREATIVITY';
  category: 'INDIVIDUAL' | 'TEAM' | 'GLOBAL';
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: number;
  rules: string[];
  requirements: ChallengeRequirement[];
  leaderboard: ChallengeLeaderboardEntry[];
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  tags: string[];
}

export interface ChallengeRequirement {
  type: 'MIN_TRADES' | 'MIN_RETURN' | 'MAX_DRAWDOWN' | 'MIN_VOLUME' | 'SOCIAL_ENGAGEMENT';
  value: number;
  description: string;
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  userId: string;
  user: SocialProfile;
  score: number;
  stats: {
    trades: number;
    return: number;
    winRate: number;
    sharpeRatio: number;
  };
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'TRADING' | 'SOCIAL' | 'EDUCATION' | 'COMMUNITY' | 'EXCLUSIVE';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedAt: string;
  progress?: number;
  maxProgress?: number;
  isVisible: boolean;
}

export interface CommunityInsight {
  id: string;
  type: 'SENTIMENT' | 'PREDICTION' | 'TECHNICAL' | 'FUNDAMENTAL';
  title: string;
  description: string;
  confidence: number;
  contributors: number;
  consensusScore: number;
  relatedAssets: string[];
  timeframe: string;
  source: 'COMMUNITY' | 'PRO_ANALYSTS' | 'AI' | 'MIXED';
  timestamp: string;
  supportingData: any;
  votingEnabled: boolean;
  votes: {
    up: number;
    down: number;
  };
}

export interface ChartData {
  id: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
  annotations: ChartAnnotation[];
  timestamp: string;
}

export interface ChartAnnotation {
  id: string;
  type: 'TRENDLINE' | 'SUPPORT' | 'RESISTANCE' | 'PATTERN' | 'TEXT';
  data: any;
  description?: string;
}

export class SocialTrading {
  private logger = useLogger('SocialTrading');
  private currentUser: SocialProfile | null = null;
  private following: Set<string> = new Set();
  private followers: Set<string> = new Set();
  private copyTradingSettings: Map<string, CopyTradingSettings> = new Map();
  private feedCache: SocialPost[] = [];
  private lastFeedUpdate: number = 0;

  constructor() {
    this.initializeRealTimeUpdates();
  }

  // User Profile Management
  public async createProfile(profileData: Partial<SocialProfile>): Promise<SocialProfile> {
    try {
      this.logger.info('Creating social trading profile', profileData);

      const profile = await invoke('create_social_profile', {
        ...profileData,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });

      this.currentUser = profile;
      this.logger.info('Social profile created successfully', { userId: profile.id });

      return profile;
    } catch (error) {
      this.logger.error('Failed to create social profile', { error });
      throw error;
    }
  }

  public async updateProfile(updates: Partial<SocialProfile>): Promise<SocialProfile> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      const updatedProfile = await invoke('update_social_profile', {
        userId: this.currentUser.id,
        updates: {
          ...updates,
          lastActive: new Date().toISOString(),
        },
      });

      this.currentUser = updatedProfile;
      this.logger.info('Social profile updated', { userId: updatedProfile.id });

      return updatedProfile;
    } catch (error) {
      this.logger.error('Failed to update social profile', { error });
      throw error;
    }
  }

  public async getProfile(userId: string): Promise<SocialProfile> {
    try {
      const profile = await invoke('get_social_profile', { userId });
      return profile;
    } catch (error) {
      this.logger.error('Failed to get social profile', { userId, error });
      throw error;
    }
  }

  // Social Feed
  public async getSocialFeed(
    filters: {
      type?: SocialPost['type'];
      assets?: string[];
      timeRange?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
      sortBy?: 'RECENT' | 'POPULAR' | 'TRENDING';
    } = {}
  ): Promise<SocialPost[]> {
    try {
      // Check cache first
      const now = Date.now();
      if (now - this.lastFeedUpdate < 30000 && this.feedCache.length > 0) {
        return this.filterFeed(this.feedCache, filters);
      }

      this.logger.info('Fetching social feed', { filters });

      const posts = await invoke('get_social_feed', {
        following: Array.from(this.following),
        filters,
      });

      this.feedCache = posts;
      this.lastFeedUpdate = now;

      const filteredPosts = this.filterFeed(posts, filters);
      this.logger.info('Social feed fetched', { postCount: filteredPosts.length });

      return filteredPosts;
    } catch (error) {
      this.logger.error('Failed to get social feed', { error });
      return [];
    }
  }

  private filterFeed(posts: SocialPost[], filters: any): SocialPost[] {
    let filtered = [...posts];

    if (filters.type) {
      filtered = filtered.filter(post => post.type === filters.type);
    }

    if (filters.assets && filters.assets.length > 0) {
      filtered = filtered.filter(post =>
        post.assets?.some(asset => filters.assets.includes(asset))
      );
    }

    if (filters.timeRange) {
      const cutoff = this.getTimeCutoff(filters.timeRange);
      filtered = filtered.filter(post => new Date(post.timestamp) > cutoff);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'POPULAR':
        filtered.sort((a, b) => b.likes + b.shares - (a.likes + a.shares));
        break;
      case 'TRENDING':
        filtered.sort((a, b) => {
          const aScore = this.calculateTrendingScore(a);
          const bScore = this.calculateTrendingScore(b);
          return bScore - aScore;
        });
        break;
      case 'RECENT':
      default:
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
    }

    return filtered;
  }

  private getTimeCutoff(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'HOUR':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'DAY':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'WEEK':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'MONTH':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private calculateTrendingScore(post: SocialPost): number {
    const age = Date.now() - new Date(post.timestamp).getTime();
    const ageInHours = age / (1000 * 60 * 60);
    const engagement = post.likes + post.shares + post.comments.length;

    // Decay score based on age
    return engagement / Math.max(1, Math.log(ageInHours + 1));
  }

  public async createPost(postData: {
    content: string;
    type: SocialPost['type'];
    assets?: string[];
    charts?: ChartData[];
    tags?: string[];
    visibility?: SocialPost['visibility'];
  }): Promise<SocialPost> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      const post = await invoke('create_social_post', {
        authorId: this.currentUser.id,
        ...postData,
        timestamp: new Date().toISOString(),
      });

      this.logger.info('Social post created', { postId: post.id, type: post.type });

      // Invalidate cache
      this.feedCache = [];

      return post;
    } catch (error) {
      this.logger.error('Failed to create social post', { error });
      throw error;
    }
  }

  // Copy Trading
  public async followTrader(traderId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('follow_trader', {
        followerId: this.currentUser.id,
        traderId,
      });

      this.following.add(traderId);
      this.logger.info('Started following trader', { traderId });

      // Invalidate cache
      this.feedCache = [];
    } catch (error) {
      this.logger.error('Failed to follow trader', { traderId, error });
      throw error;
    }
  }

  public async unfollowTrader(traderId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('unfollow_trader', {
        followerId: this.currentUser.id,
        traderId,
      });

      this.following.delete(traderId);
      this.copyTradingSettings.delete(traderId);

      this.logger.info('Stopped following trader', { traderId });

      // Invalidate cache
      this.feedCache = [];
    } catch (error) {
      this.logger.error('Failed to unfollow trader', { traderId, error });
      throw error;
    }
  }

  public async setupCopyTrading(settings: CopyTradingSettings): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('setup_copy_trading', {
        followerId: this.currentUser.id,
        settings,
      });

      this.copyTradingSettings.set(settings.traderId, settings);
      this.logger.info('Copy trading setup completed', { traderId: settings.traderId });
    } catch (error) {
      this.logger.error('Failed to setup copy trading', { settings, error });
      throw error;
    }
  }

  public async getCopyTradingPerformance(traderId: string): Promise<{
    periodReturn: number;
    totalReturn: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    copyCount: number;
  }> {
    try {
      return await invoke('get_copy_trading_performance', {
        traderId,
        followerId: this.currentUser?.id,
      });
    } catch (error) {
      this.logger.error('Failed to get copy trading performance', { traderId, error });
      throw error;
    }
  }

  // Trading Challenges
  public async getAvailableChallenges(): Promise<TradingChallenge[]> {
    try {
      const challenges = await invoke('get_trading_challenges', {
        status: ['UPCOMING', 'ACTIVE'],
      });

      this.logger.info('Fetched trading challenges', { count: challenges.length });
      return challenges;
    } catch (error) {
      this.logger.error('Failed to get trading challenges', { error });
      return [];
    }
  }

  public async joinChallenge(challengeId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('join_trading_challenge', {
        userId: this.currentUser.id,
        challengeId,
      });

      this.logger.info('Joined trading challenge', { challengeId });
    } catch (error) {
      this.logger.error('Failed to join trading challenge', { challengeId, error });
      throw error;
    }
  }

  public async getChallengeLeaderboard(challengeId: string): Promise<ChallengeLeaderboardEntry[]> {
    try {
      const leaderboard = await invoke('get_challenge_leaderboard', { challengeId });
      return leaderboard;
    } catch (error) {
      this.logger.error('Failed to get challenge leaderboard', { challengeId, error });
      return [];
    }
  }

  // Community Insights
  public async getCommunityInsights(
    filters: {
      type?: CommunityInsight['type'];
      assets?: string[];
      source?: CommunityInsight['source'];
      timeRange?: 'DAY' | 'WEEK' | 'MONTH';
    } = {}
  ): Promise<CommunityInsight[]> {
    try {
      const insights = await invoke('get_community_insights', { filters });

      this.logger.info('Fetched community insights', { count: insights.length });
      return insights;
    } catch (error) {
      this.logger.error('Failed to get community insights', { error });
      return [];
    }
  }

  public async contributeInsight(insightData: {
    type: CommunityInsight['type'];
    title: string;
    description: string;
    confidence: number;
    relatedAssets: string[];
    timeframe: string;
    supportingData: any;
  }): Promise<CommunityInsight> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      const insight = await invoke('contribute_insight', {
        ...insightData,
        contributorId: this.currentUser.id,
        timestamp: new Date().toISOString(),
        votes: { up: 0, down: 0 },
      });

      this.logger.info('Community insight contributed', { insightId: insight.id });
      return insight;
    } catch (error) {
      this.logger.error('Failed to contribute insight', { error });
      throw error;
    }
  }

  public async voteOnInsight(insightId: string, voteType: 'up' | 'down'): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('vote_on_insight', {
        insightId,
        userId: this.currentUser.id,
        voteType,
      });

      this.logger.info('Voted on community insight', { insightId, voteType });
    } catch (error) {
      this.logger.error('Failed to vote on insight', { insightId, voteType, error });
      throw error;
    }
  }

  // Achievements & Badges
  public async getUserBadges(userId?: string): Promise<Badge[]> {
    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) {
        throw new Error('No user ID provided');
      }

      const badges = await invoke('get_user_badges', { userId: targetUserId });
      return badges;
    } catch (error) {
      this.logger.error('Failed to get user badges', { userId, error });
      return [];
    }
  }

  public async checkAndAwardAchievements(userId?: string): Promise<Badge[]> {
    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) {
        throw new Error('No user ID provided');
      }

      const newBadges = await invoke('check_and_award_achievements', { userId: targetUserId });

      if (newBadges.length > 0) {
        this.logger.info('New achievements awarded', {
          userId: targetUserId,
          badges: newBadges.map(b => b.name),
        });
      }

      return newBadges;
    } catch (error) {
      this.logger.error('Failed to check achievements', { userId, error });
      return [];
    }
  }

  // Real-time Updates
  private initializeRealTimeUpdates(): void {
    // WebSocket connection for real-time updates
    setInterval(() => {
      this.processRealTimeUpdates();
    }, 5000); // Check every 5 seconds
  }

  private async processRealTimeUpdates(): Promise<void> {
    try {
      if (!this.currentUser) return;

      const updates = await invoke('get_social_updates', {
        userId: this.currentUser.id,
        lastUpdate: this.lastFeedUpdate,
      });

      if (updates.posts?.length > 0) {
        this.feedCache = [...updates.posts, ...this.feedCache];
        this.lastFeedUpdate = Date.now();
      }

      if (updates.notifications?.length > 0) {
        this.handleSocialNotifications(updates.notifications);
      }
    } catch (error) {
      // Silent fail for real-time updates
    }
  }

  private handleSocialNotifications(notifications: any[]): void {
    notifications.forEach(notification => {
      this.logger.info('Social notification received', {
        type: notification.type,
        fromUser: notification.fromUser,
      });

      // Emit events for UI components
      this.emitSocialEvent('notification', notification);
    });
  }

  private emitSocialEvent(event: string, data: any): void {
    // Custom event emission for UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`social:${event}`, { detail: data }));
    }
  }

  // Analytics & Insights
  public async getSocialAnalytics(
    timeRange: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' = 'MONTH'
  ): Promise<{
    engagement: {
      posts: number;
      likes: number;
      comments: number;
      shares: number;
    };
    growth: {
      followers: number;
      engagementRate: number;
    };
    performance: {
      copiedTrades: number;
      copyTraders: number;
      averageReturn: number;
    };
    community: {
      insightsContributed: number;
      challengesParticipated: number;
      badges: number;
    };
  }> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      const analytics = await invoke('get_social_analytics', {
        userId: this.currentUser.id,
        timeRange,
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to get social analytics', { error });
      throw error;
    }
  }

  public async getTopTraders(
    criteria: 'RETURN' | 'WIN_RATE' | 'FOLLOWERS' | 'COPY_TRADERS' | 'SOCIAL_INFLUENCE',
    limit: number = 10
  ): Promise<SocialProfile[]> {
    try {
      const traders = await invoke('get_top_traders', {
        criteria,
        limit,
      });

      this.logger.info('Fetched top traders', { criteria, count: traders.length });
      return traders;
    } catch (error) {
      this.logger.error('Failed to get top traders', { criteria, error });
      return [];
    }
  }

  // Public getters
  public getCurrentUser(): SocialProfile | null {
    return this.currentUser;
  }

  public getFollowing(): string[] {
    return Array.from(this.following);
  }

  public getFollowers(): string[] {
    return Array.from(this.followers);
  }

  public getCopyTradingSettings(): Map<string, CopyTradingSettings> {
    return new Map(this.copyTradingSettings);
  }

  // Social interactions
  public async likePost(postId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('like_post', {
        postId,
        userId: this.currentUser.id,
      });

      // Update cache
      const post = this.feedCache.find(p => p.id === postId);
      if (post) {
        post.likes++;
      }

      this.logger.info('Liked post', { postId });
    } catch (error) {
      this.logger.error('Failed to like post', { postId, error });
      throw error;
    }
  }

  public async unlikePost(postId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      await invoke('unlike_post', {
        postId,
        userId: this.currentUser.id,
      });

      // Update cache
      const post = this.feedCache.find(p => p.id === postId);
      if (post) {
        post.likes--;
      }

      this.logger.info('Unliked post', { postId });
    } catch (error) {
      this.logger.error('Failed to unlike post', { postId, error });
      throw error;
    }
  }

  public async addComment(postId: string, content: string): Promise<Comment> {
    try {
      if (!this.currentUser) {
        throw new Error('No current user profile');
      }

      const comment = await invoke('add_comment', {
        postId,
        userId: this.currentUser.id,
        content,
        timestamp: new Date().toISOString(),
      });

      // Update cache
      const post = this.feedCache.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
      }

      this.logger.info('Added comment', { postId, commentId: comment.id });
      return comment;
    } catch (error) {
      this.logger.error('Failed to add comment', { postId, error });
      throw error;
    }
  }

  // Search & Discovery
  public async searchUsers(query: string, limit: number = 20): Promise<SocialProfile[]> {
    try {
      const users = await invoke('search_users', { query, limit });
      return users;
    } catch (error) {
      this.logger.error('Failed to search users', { query, error });
      return [];
    }
  }

  public async searchPosts(query: string, filters: any = {}): Promise<SocialPost[]> {
    try {
      const posts = await invoke('search_posts', { query, filters });
      return posts;
    } catch (error) {
      this.logger.error('Failed to search posts', { query, error });
      return [];
    }
  }

  public async getTrendingAssets(timeRange: 'DAY' | 'WEEK' = 'WEEK'): Promise<
    {
      asset: string;
      mentions: number;
      sentiment: number;
      topContributors: string[];
    }[]
  > {
    try {
      const trends = await invoke('get_trending_assets', { timeRange });
      return trends;
    } catch (error) {
      this.logger.error('Failed to get trending assets', { timeRange, error });
      return [];
    }
  }
}

export default SocialTrading;
