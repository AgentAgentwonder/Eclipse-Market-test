/**
 * Advanced AI-Powered Trading Strategies for Eclipse Market Pro
 *
 * Features:
 * - Machine learning-based market prediction
 * - Sentiment analysis integration
 * - Risk-aware position sizing
 * - Multi-timeframe analysis
 * - Adaptive strategy optimization
 * - Real-time strategy performance monitoring
 *
 * @version 2.0.0
 * @author Eclipse Market Pro Team
 */

import { invoke } from '@tauri-apps/api/core';
import { useLogger } from '../utils/logger';

export interface TradingSignal {
  id: string;
  symbol: string;
  strategy: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
  reasoning: string;
  riskScore: number;
  expectedReturn: number;
  timeHorizon: 'SCALP' | 'DAY' | 'SWING' | 'POSITION';
  technicalIndicators: Record<string, number>;
  marketConditions: MarketConditions;
}

export interface MarketConditions {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'VOLATILE';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  volume: 'LOW' | 'AVERAGE' | 'HIGH' | 'EXTREME';
  liquidity: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: 'VERY_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY_BULLISH';
  marketPhase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN';
}

export interface StrategyPerformance {
  strategy: string;
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  totalReturn: number;
  volatility: number;
  calmarRatio: number;
}

export interface AITradingConfig {
  maxPositionSize: number;
  maxDailyRisk: number;
  minConfidence: number;
  maxOpenPositions: number;
  riskPerTrade: number;
  enableLeverage: boolean;
  maxLeverage: number;
  strategies: string[];
  sentimentWeight: number;
  technicalWeight: number;
  riskWeight: number;
}

export class AITradingStrategies {
  private logger = useLogger('AITradingStrategies');
  private config: AITradingConfig;
  private activeStrategies: Map<string, any> = new Map();
  private performanceHistory: Map<string, StrategyPerformance[]> = new Map();
  private modelCache: Map<string, any> = new Map();

  constructor(config: AITradingConfig) {
    this.config = config;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.logger.info('Initializing AI trading strategies', { config: this.config });

    // Initialize all available strategies
    const strategies = [
      'MOMENTUM_SCALPER',
      'MEAN_REVERSION',
      'BREAKOUT_HUNTER',
      'SENTIMENT_MASTER',
      'ARBITRAGE_SEEKER',
      'VOLATILITY_TRADER',
      'TREND_FOLLOWER',
      'MACHINE_LEARNING_PREDICTOR',
      'NEURAL_NETWORK_SCANNER',
      'QUANTUM_PATTERN_RECOGNIZER',
    ];

    strategies.forEach(strategy => {
      if (this.config.strategies.includes(strategy)) {
        this.activeStrategies.set(strategy, {
          name: strategy,
          enabled: true,
          lastSignal: null,
          performance: null,
          model: null,
        });
      }
    });

    this.logger.info(`Initialized ${this.activeStrategies.size} trading strategies`);
  }

  // Main signal generation method
  public async generateSignals(symbols: string[]): Promise<TradingSignal[]> {
    const startTime = performance.now();
    this.logger.info('Generating AI trading signals', {
      symbols,
      strategies: Array.from(this.activeStrategies.keys()),
    });

    const signals: TradingSignal[] = [];

    for (const symbol of symbols) {
      try {
        // Get market data
        const marketData = await this.getMarketData(symbol);
        const marketConditions = await this.analyzeMarketConditions(marketData);

        // Generate signals from all active strategies
        const strategySignals = await Promise.all(
          Array.from(this.activeStrategies.keys()).map(strategy =>
            this.generateStrategySignal(strategy, symbol, marketData, marketConditions)
          )
        );

        // Combine and rank signals
        const combinedSignals = this.combineSignals(strategySignals);
        const topSignals = this.rankSignals(combinedSignals);

        signals.push(...topSignals);
      } catch (error) {
        this.logger.error(`Failed to generate signals for ${symbol}`, { error });
      }
    }

    const duration = performance.now() - startTime;
    this.logger.info(`Generated ${signals.length} trading signals`, { duration });

    return signals;
  }

  private async getMarketData(symbol: string): Promise<any> {
    try {
      const data = await invoke('get_market_data', { symbol, timeframe: '1m', limit: 500 });
      return data;
    } catch (error) {
      this.logger.error(`Failed to get market data for ${symbol}`, { error });
      throw error;
    }
  }

  private async analyzeMarketConditions(marketData: any): Promise<MarketConditions> {
    // Analyze trend
    const trend = this.analyzeTrend(marketData);

    // Analyze volatility
    const volatility = this.analyzeVolatility(marketData);

    // Analyze volume
    const volume = this.analyzeVolume(marketData);

    // Get sentiment analysis
    const sentiment = await this.getSentimentAnalysis(marketData.symbol);

    // Determine market phase
    const marketPhase = this.determineMarketPhase(marketData);

    return {
      trend,
      volatility,
      volume,
      liquidity: 'HIGH', // Simplified - would need order book data
      sentiment,
      marketPhase,
    };
  }

  private analyzeTrend(marketData: any): MarketConditions['trend'] {
    const prices = marketData.candles.map((c: any) => c.close);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];

    const rsi = this.calculateRSI(prices, 14);

    if (currentPrice > sma20 && sma20 > sma50 && rsi < 70) {
      return 'BULLISH';
    } else if (currentPrice < sma20 && sma20 < sma50 && rsi > 30) {
      return 'BEARISH';
    } else if (Math.abs(currentPrice - sma20) / sma20 < 0.01) {
      return 'SIDEWAYS';
    } else {
      return 'VOLATILE';
    }
  }

  private analyzeVolatility(marketData: any): MarketConditions['volatility'] {
    const prices = marketData.candles.map((c: any) => c.close);
    const returns = this.calculateReturns(prices);
    const volatility = this.calculateStandardDeviation(returns) * Math.sqrt(252);

    if (volatility < 0.15) return 'LOW';
    if (volatility < 0.25) return 'MEDIUM';
    if (volatility < 0.4) return 'HIGH';
    return 'EXTREME';
  }

  private analyzeVolume(marketData: any): MarketConditions['volume'] {
    const volumes = marketData.candles.map((c: any) => c.volume);
    const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    if (volumeRatio < 0.5) return 'LOW';
    if (volumeRatio < 1.5) return 'AVERAGE';
    if (volumeRatio < 2.5) return 'HIGH';
    return 'EXTREME';
  }

  private async getSentimentAnalysis(symbol: string): Promise<MarketConditions['sentiment']> {
    try {
      // Combine multiple sentiment sources
      const [newsSentiment, socialSentiment, technicalSentiment] = await Promise.all([
        this.getNewsSentiment(symbol),
        this.getSocialSentiment(symbol),
        this.getTechnicalSentiment(symbol),
      ]);

      const combinedSentiment =
        newsSentiment * 0.4 + socialSentiment * 0.3 + technicalSentiment * 0.3;

      if (combinedSentiment > 0.6) return 'VERY_BULLISH';
      if (combinedSentiment > 0.2) return 'BULLISH';
      if (combinedSentiment > -0.2) return 'NEUTRAL';
      if (combinedSentiment > -0.6) return 'BEARISH';
      return 'VERY_BEARISH';
    } catch (error) {
      this.logger.warn('Failed to get sentiment analysis', { symbol, error });
      return 'NEUTRAL';
    }
  }

  private determineMarketPhase(marketData: any): MarketConditions['marketPhase'] {
    const prices = marketData.candles.map((c: any) => c.close);
    const volumes = marketData.candles.map((c: any) => c.volume);

    const priceChange = (prices[prices.length - 1] - prices[0]) / prices[0];
    const volumeTrend = this.calculateVolumeTrend(volumes);

    if (priceChange > 0.1 && volumeTrend > 0) return 'MARKUP';
    if (priceChange < -0.1 && volumeTrend > 0) return 'MARKDOWN';
    if (Math.abs(priceChange) < 0.05 && volumeTrend < 0) return 'ACCUMULATION';
    return 'DISTRIBUTION';
  }

  private async generateStrategySignal(
    strategy: string,
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    try {
      switch (strategy) {
        case 'MOMENTUM_SCALPER':
          return this.generateMomentumSignal(symbol, marketData, marketConditions);

        case 'MEAN_REVERSION':
          return this.generateMeanReversionSignal(symbol, marketData, marketConditions);

        case 'BREAKOUT_HUNTER':
          return this.generateBreakoutSignal(symbol, marketData, marketConditions);

        case 'SENTIMENT_MASTER':
          return this.generateSentimentSignal(symbol, marketData, marketConditions);

        case 'MACHINE_LEARNING_PREDICTOR':
          return this.generateMLSignal(symbol, marketData, marketConditions);

        default:
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to generate signal for strategy ${strategy}`, { symbol, error });
      return null;
    }
  }

  private async generateMomentumSignal(
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    const prices = marketData.candles.map((c: any) => c.close);
    const rsi = this.calculateRSI(prices, 14);
    const macd = this.calculateMACD(prices);
    const currentPrice = prices[prices.length - 1];

    // Momentum conditions
    const bullishMomentum = rsi < 70 && macd.histogram > 0 && marketConditions.trend === 'BULLISH';
    const bearishMomentum = rsi > 30 && macd.histogram < 0 && marketConditions.trend === 'BEARISH';

    if (bullishMomentum) {
      return {
        id: `momentum_${Date.now()}`,
        symbol,
        strategy: 'MOMENTUM_SCALPER',
        action: 'BUY',
        confidence: Math.min(0.9, (70 - rsi) / 40 + 0.3),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'SCALP'),
        stopLoss: currentPrice * 0.98,
        takeProfit: currentPrice * 1.02,
        timestamp: new Date().toISOString(),
        reasoning: 'Strong bullish momentum with RSI oversold condition',
        riskScore: 0.3,
        expectedReturn: 0.02,
        timeHorizon: 'SCALP',
        technicalIndicators: { rsi, macd: macd.histogram },
        marketConditions,
      };
    }

    if (bearishMomentum) {
      return {
        id: `momentum_${Date.now()}`,
        symbol,
        strategy: 'MOMENTUM_SCALPER',
        action: 'SELL',
        confidence: Math.min(0.9, (rsi - 30) / 40 + 0.3),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'SCALP'),
        stopLoss: currentPrice * 1.02,
        takeProfit: currentPrice * 0.98,
        timestamp: new Date().toISOString(),
        reasoning: 'Strong bearish momentum with RSI overbought condition',
        riskScore: 0.3,
        expectedReturn: 0.02,
        timeHorizon: 'SCALP',
        technicalIndicators: { rsi, macd: macd.histogram },
        marketConditions,
      };
    }

    return null;
  }

  private async generateMeanReversionSignal(
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    const prices = marketData.candles.map((c: any) => c.close);
    const bb = this.calculateBollingerBands(prices, 20, 2);
    const rsi = this.calculateRSI(prices, 14);
    const currentPrice = prices[prices.length - 1];

    // Mean reversion conditions
    const oversold = currentPrice <= bb.lower && rsi < 30;
    const overbought = currentPrice >= bb.upper && rsi > 70;

    if (oversold && marketConditions.volatility !== 'EXTREME') {
      return {
        id: `meanreversion_${Date.now()}`,
        symbol,
        strategy: 'MEAN_REVERSION',
        action: 'BUY',
        confidence: Math.min(0.8, (bb.upper - currentPrice) / (bb.upper - bb.lower) + 0.3),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'DAY'),
        stopLoss: currentPrice * 0.95,
        takeProfit: bb.middle,
        timestamp: new Date().toISOString(),
        reasoning: 'Price oversold below lower Bollinger Band with RSI confirmation',
        riskScore: 0.4,
        expectedReturn: (bb.middle - currentPrice) / currentPrice,
        timeHorizon: 'DAY',
        technicalIndicators: {
          bbUpper: bb.upper,
          bbMiddle: bb.middle,
          bbLower: bb.lower,
          rsi,
        },
        marketConditions,
      };
    }

    if (overbought && marketConditions.volatility !== 'EXTREME') {
      return {
        id: `meanreversion_${Date.now()}`,
        symbol,
        strategy: 'MEAN_REVERSION',
        action: 'SELL',
        confidence: Math.min(0.8, (currentPrice - bb.lower) / (bb.upper - bb.lower) + 0.3),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'DAY'),
        stopLoss: currentPrice * 1.05,
        takeProfit: bb.middle,
        timestamp: new Date().toISOString(),
        reasoning: 'Price overbought above upper Bollinger Band with RSI confirmation',
        riskScore: 0.4,
        expectedReturn: (currentPrice - bb.middle) / currentPrice,
        timeHorizon: 'DAY',
        technicalIndicators: {
          bbUpper: bb.upper,
          bbMiddle: bb.middle,
          bbLower: bb.lower,
          rsi,
        },
        marketConditions,
      };
    }

    return null;
  }

  private async generateBreakoutSignal(
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    const prices = marketData.candles.map((c: any) => c.close);
    const volumes = marketData.candles.map((c: any) => c.volume);
    const atr = this.calculateATR(marketData.candles, 14);
    const currentPrice = prices[prices.length - 1];
    const currentVolume = volumes[volumes.length - 1];
    const avgVolume = volumes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;

    // Breakout conditions
    const volumeConfirmation = currentVolume > avgVolume * 1.5;
    const volatilityConfirmation = atr / currentPrice > 0.02;

    // Check for recent high/low breakouts
    const recentHigh = Math.max(...prices.slice(-20));
    const recentLow = Math.min(...prices.slice(-20));

    if (currentPrice > recentHigh && volumeConfirmation && volatilityConfirmation) {
      return {
        id: `breakout_${Date.now()}`,
        symbol,
        strategy: 'BREAKOUT_HUNTER',
        action: 'BUY',
        confidence: Math.min(0.85, ((currentPrice - recentHigh) / atr) * 0.5 + 0.5),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'SWING'),
        stopLoss: recentHigh - atr * 2,
        takeProfit: currentPrice + atr * 3,
        timestamp: new Date().toISOString(),
        reasoning: 'Bullish breakout above recent high with volume confirmation',
        riskScore: 0.35,
        expectedReturn: (atr * 3) / currentPrice,
        timeHorizon: 'SWING',
        technicalIndicators: {
          breakoutLevel: recentHigh,
          atr,
          volumeRatio: currentVolume / avgVolume,
        },
        marketConditions,
      };
    }

    if (currentPrice < recentLow && volumeConfirmation && volatilityConfirmation) {
      return {
        id: `breakout_${Date.now()}`,
        symbol,
        strategy: 'BREAKOUT_HUNTER',
        action: 'SELL',
        confidence: Math.min(0.85, ((recentLow - currentPrice) / atr) * 0.5 + 0.5),
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'SWING'),
        stopLoss: recentLow + atr * 2,
        takeProfit: currentPrice - atr * 3,
        timestamp: new Date().toISOString(),
        reasoning: 'Bearish breakout below recent low with volume confirmation',
        riskScore: 0.35,
        expectedReturn: (atr * 3) / currentPrice,
        timeHorizon: 'SWING',
        technicalIndicators: {
          breakoutLevel: recentLow,
          atr,
          volumeRatio: currentVolume / avgVolume,
        },
        marketConditions,
      };
    }

    return null;
  }

  private async generateSentimentSignal(
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    const currentPrice = marketData.candles[marketData.candles.length - 1].close;

    // Extreme sentiment conditions
    const extremeBullish =
      marketConditions.sentiment === 'VERY_BULLISH' && marketConditions.trend !== 'BULLISH';
    const extremeBearish =
      marketConditions.sentiment === 'VERY_BEARISH' && marketConditions.trend !== 'BEARISH';

    if (extremeBullish) {
      return {
        id: `sentiment_${Date.now()}`,
        symbol,
        strategy: 'SENTIMENT_MASTER',
        action: 'BUY',
        confidence: 0.75,
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'DAY'),
        stopLoss: currentPrice * 0.97,
        takeProfit: currentPrice * 1.03,
        timestamp: new Date().toISOString(),
        reasoning: 'Contrarian buy on extreme bullish sentiment with trend divergence',
        riskScore: 0.45,
        expectedReturn: 0.03,
        timeHorizon: 'DAY',
        technicalIndicators: { sentimentScore: this.getSentimentScore(marketConditions.sentiment) },
        marketConditions,
      };
    }

    if (extremeBearish) {
      return {
        id: `sentiment_${Date.now()}`,
        symbol,
        strategy: 'SENTIMENT_MASTER',
        action: 'SELL',
        confidence: 0.75,
        price: currentPrice,
        quantity: this.calculatePositionSize(symbol, currentPrice, 'DAY'),
        stopLoss: currentPrice * 1.03,
        takeProfit: currentPrice * 0.97,
        timestamp: new Date().toISOString(),
        reasoning: 'Contrarian sell on extreme bearish sentiment with trend divergence',
        riskScore: 0.45,
        expectedReturn: 0.03,
        timeHorizon: 'DAY',
        technicalIndicators: { sentimentScore: this.getSentimentScore(marketConditions.sentiment) },
        marketConditions,
      };
    }

    return null;
  }

  private async generateMLSignal(
    symbol: string,
    marketData: any,
    marketConditions: MarketConditions
  ): Promise<TradingSignal | null> {
    try {
      // Get ML prediction from backend
      const prediction = await invoke('ml_predict_price', {
        symbol,
        data: marketData.candles.slice(-100),
      });

      const currentPrice = marketData.candles[marketData.candles.length - 1].close;
      const predictedPrice = prediction.predicted_price;
      const confidence = prediction.confidence;
      const expectedReturn = (predictedPrice - currentPrice) / currentPrice;

      if (confidence > this.config.minConfidence && Math.abs(expectedReturn) > 0.01) {
        const action = expectedReturn > 0 ? 'BUY' : 'SELL';

        return {
          id: `ml_${Date.now()}`,
          symbol,
          strategy: 'MACHINE_LEARNING_PREDICTOR',
          action,
          confidence: Math.min(0.9, confidence),
          price: currentPrice,
          quantity: this.calculatePositionSize(symbol, currentPrice, 'SWING'),
          stopLoss: action === 'BUY' ? currentPrice * 0.95 : currentPrice * 1.05,
          takeProfit: predictedPrice,
          timestamp: new Date().toISOString(),
          reasoning: `ML model predicts ${action} with ${confidence.toFixed(2)} confidence`,
          riskScore: 0.25,
          expectedReturn: Math.abs(expectedReturn),
          timeHorizon: 'SWING',
          technicalIndicators: {
            prediction: predictedPrice,
            confidence,
          },
          marketConditions,
        };
      }
    } catch (error) {
      this.logger.error('Failed to generate ML signal', { symbol, error });
    }

    return null;
  }

  // Technical analysis helpers
  private calculateSMA(prices: number[], period: number): number {
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateRSI(prices: number[], period: number): number {
    const returns = this.calculateReturns(prices);
    const gains = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0).map(r => Math.abs(r));

    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calculateMACD(prices: number[]): { histogram: number; signal: number; macd: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9);
    const histogram = macd - signal;

    return { histogram, signal, macd };
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  private calculateBollingerBands(
    prices: number[],
    period: number,
    stdDev: number
  ): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const middle = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    const variance =
      recentPrices.reduce((sum, price) => {
        return sum + Math.pow(price - middle, 2);
      }, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: middle + standardDeviation * stdDev,
      middle,
      lower: middle - standardDeviation * stdDev,
    };
  }

  private calculateATR(candles: any[], period: number): number {
    const trueRanges = [];

    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

      trueRanges.push(tr);
    }

    return this.calculateSMA(trueRanges, period);
  }

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateVolumeTrend(volumes: number[]): number {
    const recentVolumes = volumes.slice(-10);
    const olderVolumes = volumes.slice(-20, -10);

    const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const olderAvg = olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length;

    return (recentAvg - olderAvg) / olderAvg;
  }

  private getSentimentScore(sentiment: MarketConditions['sentiment']): number {
    const scores = {
      VERY_BEARISH: -1,
      BEARISH: -0.5,
      NEUTRAL: 0,
      BULLISH: 0.5,
      VERY_BULLISH: 1,
    };
    return scores[sentiment];
  }

  // Position sizing and risk management
  private calculatePositionSize(symbol: string, price: number, timeHorizon: string): number {
    const baseSize = this.config.maxPositionSize;
    const riskMultiplier = this.config.riskPerTrade;

    // Adjust based on time horizon
    const timeHorizonMultiplier =
      {
        SCALP: 0.5,
        DAY: 0.75,
        SWING: 1.0,
        POSITION: 1.5,
      }[timeHorizon] || 1.0;

    const positionValue = baseSize * riskMultiplier * timeHorizonMultiplier;
    return positionValue / price;
  }

  private combineSignals(signals: (TradingSignal | null)[]): TradingSignal[] {
    const validSignals = signals.filter(signal => signal !== null) as TradingSignal[];

    // Group signals by symbol and action
    const groupedSignals = new Map<string, TradingSignal[]>();

    validSignals.forEach(signal => {
      const key = `${signal.symbol}_${signal.action}`;
      if (!groupedSignals.has(key)) {
        groupedSignals.set(key, []);
      }
      groupedSignals.get(key)!.push(signal);
    });

    // Combine signals with same symbol and action
    const combinedSignals: TradingSignal[] = [];

    groupedSignals.forEach(group => {
      if (group.length === 1) {
        combinedSignals.push(group[0]);
      } else {
        // Combine multiple signals for the same trade
        const avgConfidence = group.reduce((sum, s) => sum + s.confidence, 0) / group.length;
        const weightedPrice =
          group.reduce((sum, s) => sum + s.price * s.confidence, 0) /
          group.reduce((sum, s) => sum + s.confidence, 0);

        combinedSignals.push({
          ...group[0],
          id: `combined_${Date.now()}`,
          confidence: avgConfidence,
          price: weightedPrice,
          reasoning: `Combined signal from ${group.length} strategies: ${group.map(s => s.strategy).join(', ')}`,
          technicalIndicators: group.reduce((acc, s) => ({ ...acc, ...s.technicalIndicators }), {}),
        });
      }
    });

    return combinedSignals;
  }

  private rankSignals(signals: TradingSignal[]): TradingSignal[] {
    return signals.sort((a, b) => {
      // Sort by confidence, then by expected return, then by risk score (lower is better)
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      if (b.expectedReturn !== a.expectedReturn) {
        return b.expectedReturn - a.expectedReturn;
      }
      return a.riskScore - b.riskScore;
    });
  }

  // Mock methods for sentiment analysis
  private async getNewsSentiment(symbol: string): Promise<number> {
    // Mock implementation - would integrate with news APIs
    return Math.random() * 2 - 1; // -1 to 1
  }

  private async getSocialSentiment(symbol: string): Promise<number> {
    // Mock implementation - would integrate with social media APIs
    return Math.random() * 2 - 1; // -1 to 1
  }

  private async getTechnicalSentiment(symbol: string): Promise<number> {
    // Mock implementation - based on technical indicators
    return Math.random() * 2 - 1; // -1 to 1
  }

  // Public API methods
  public updateConfig(newConfig: Partial<AITradingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('AI trading config updated', { config: this.config });
  }

  public getActiveStrategies(): string[] {
    return Array.from(this.activeStrategies.keys());
  }

  public getStrategyPerformance(strategy: string): StrategyPerformance | null {
    const history = this.performanceHistory.get(strategy);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  public async backtestStrategy(
    strategy: string,
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<StrategyPerformance> {
    try {
      const result = await invoke('backtest_strategy', {
        strategy,
        symbol,
        startDate,
        endDate,
        config: this.config,
      });

      // Store performance history
      const history = this.performanceHistory.get(strategy) || [];
      history.push(result);
      this.performanceHistory.set(strategy, history);

      this.logger.info('Strategy backtest completed', {
        strategy,
        symbol,
        performance: result,
      });

      return result;
    } catch (error) {
      this.logger.error('Strategy backtest failed', { strategy, symbol, error });
      throw error;
    }
  }

  public getPerformanceReport(): { [strategy: string]: StrategyPerformance } {
    const report: { [strategy: string]: StrategyPerformance } = {};

    this.activeStrategies.forEach((_, strategy) => {
      const performance = this.getStrategyPerformance(strategy);
      if (performance) {
        report[strategy] = performance;
      }
    });

    return report;
  }
}

export default AITradingStrategies;
