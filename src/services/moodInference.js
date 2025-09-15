import { moodInferenceConfig } from '../config/theme';

class MoodInferenceService {
  constructor() {
    this.calibrationData = null;
    this.lastMoodResult = null;
    this.touchSession = {
      taps: [],
      holds: [],
      swipes: [],
      strokes: [],
    };
  }

  // Start a new calibration session
  startCalibration() {
    this.touchSession = {
      taps: [],
      holds: [],
      swipes: [],
      strokes: [],
    };
  }

  // Record tap interaction
  recordTap(touchData) {
    const { timestamp, locationX, locationY, force = 0.5 } = touchData;
    
    this.touchSession.taps.push({
      timestamp,
      location: { x: locationX, y: locationY },
      force,
    });
  }

  // Record press and hold interaction
  recordHold(touchData) {
    const { startTime, endTime, locationX, locationY, force = 0.5 } = touchData;
    
    this.touchSession.holds.push({
      startTime,
      endTime,
      duration: endTime - startTime,
      location: { x: locationX, y: locationY },
      force,
    });
  }

  // Record swipe interaction
  recordSwipe(touchData) {
    const { 
      startTime, 
      endTime, 
      startLocation, 
      endLocation, 
      velocityX, 
      velocityY,
      path = [] 
    } = touchData;
    
    const distance = Math.sqrt(
      Math.pow(endLocation.x - startLocation.x, 2) + 
      Math.pow(endLocation.y - startLocation.y, 2)
    );
    
    const duration = endTime - startTime;
    const averageVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    this.touchSession.swipes.push({
      startTime,
      endTime,
      duration,
      startLocation,
      endLocation,
      distance,
      velocity: { x: velocityX, y: velocityY },
      averageVelocity,
      path,
    });
  }

  // Record doodle/stroke interaction
  recordStroke(touchData) {
    const { path, startTime, endTime, pressure = [] } = touchData;
    
    if (path.length < 2) return;
    
    // Calculate stroke complexity
    let totalLength = 0;
    let directionChanges = 0;
    let previousDirection = null;
    
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      
      const segmentLength = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      totalLength += segmentLength;
      
      if (i > 1) {
        const direction = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        if (previousDirection !== null) {
          const angleDiff = Math.abs(direction - previousDirection);
          if (angleDiff > Math.PI / 4) { // 45 degrees
            directionChanges++;
          }
        }
        previousDirection = direction;
      }
    }
    
    const averagePressure = pressure.length > 0 
      ? pressure.reduce((sum, p) => sum + p, 0) / pressure.length 
      : 0.5;
    
    this.touchSession.strokes.push({
      startTime,
      endTime,
      duration: endTime - startTime,
      path,
      totalLength,
      directionChanges,
      complexity: directionChanges / Math.max(path.length, 1),
      averagePressure,
      pressure,
    });
  }

  // Extract features from collected touch data
  extractFeatures() {
    const features = {
      // Tap features
      tap_speed: this.calculateTapSpeed(),
      tap_consistency: this.calculateTapConsistency(),
      tap_area: this.calculateTapArea(),
      
      // Hold features
      hold_duration: this.calculateAverageHoldDuration(),
      hold_pressure: this.calculateAverageHoldPressure(),
      
      // Swipe features
      swipe_velocity: this.calculateAverageSwipeVelocity(),
      swipe_jerk: this.calculateSwipeJerk(),
      swipe_direction_variance: this.calculateSwipeDirectionVariance(),
      
      // Stroke features
      stroke_complexity: this.calculateAverageStrokeComplexity(),
      stroke_pressure_variance: this.calculateStrokePressureVariance(),
      
      // Global features
      hesitation_index: this.calculateHesitationIndex(),
      consistency_index: this.calculateConsistencyIndex(),
    };

    return features;
  }

  // Calculate tap speed (taps per second)
  calculateTapSpeed() {
    if (this.touchSession.taps.length < 2) return 0;
    
    const taps = this.touchSession.taps;
    const timeSpan = taps[taps.length - 1].timestamp - taps[0].timestamp;
    return timeSpan > 0 ? (taps.length - 1) / (timeSpan / 1000) : 0;
  }

  // Calculate tap timing consistency
  calculateTapConsistency() {
    if (this.touchSession.taps.length < 3) return 1;
    
    const intervals = [];
    for (let i = 1; i < this.touchSession.taps.length; i++) {
      intervals.push(
        this.touchSession.taps[i].timestamp - this.touchSession.taps[i - 1].timestamp
      );
    }
    
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? 1 / (1 + stdDev / mean) : 1;
  }

  // Calculate average tap area (spread of tap locations)
  calculateTapArea() {
    if (this.touchSession.taps.length < 2) return 0;
    
    const locations = this.touchSession.taps.map(tap => tap.location);
    const centerX = locations.reduce((sum, loc) => sum + loc.x, 0) / locations.length;
    const centerY = locations.reduce((sum, loc) => sum + loc.y, 0) / locations.length;
    
    const distances = locations.map(loc => 
      Math.sqrt(Math.pow(loc.x - centerX, 2) + Math.pow(loc.y - centerY, 2))
    );
    
    return distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  }

  // Calculate average hold duration
  calculateAverageHoldDuration() {
    if (this.touchSession.holds.length === 0) return 0;
    
    const totalDuration = this.touchSession.holds.reduce((sum, hold) => sum + hold.duration, 0);
    return totalDuration / this.touchSession.holds.length;
  }

  // Calculate average hold pressure
  calculateAverageHoldPressure() {
    if (this.touchSession.holds.length === 0) return 0.5;
    
    const totalPressure = this.touchSession.holds.reduce((sum, hold) => sum + hold.force, 0);
    return totalPressure / this.touchSession.holds.length;
  }

  // Calculate average swipe velocity
  calculateAverageSwipeVelocity() {
    if (this.touchSession.swipes.length === 0) return 0;
    
    const totalVelocity = this.touchSession.swipes.reduce((sum, swipe) => sum + swipe.averageVelocity, 0);
    return totalVelocity / this.touchSession.swipes.length;
  }

  // Calculate swipe jerkiness (velocity changes)
  calculateSwipeJerk() {
    if (this.touchSession.swipes.length === 0) return 0;
    
    let totalJerk = 0;
    this.touchSession.swipes.forEach(swipe => {
      if (swipe.path && swipe.path.length > 2) {
        let jerk = 0;
        for (let i = 2; i < swipe.path.length; i++) {
          const p1 = swipe.path[i - 2];
          const p2 = swipe.path[i - 1];
          const p3 = swipe.path[i];
          
          const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
          const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
          
          const acceleration = {
            x: v2.x - v1.x,
            y: v2.y - v1.y,
          };
          
          jerk += Math.sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y);
        }
        totalJerk += jerk / Math.max(swipe.path.length - 2, 1);
      }
    });
    
    return totalJerk / this.touchSession.swipes.length;
  }

  // Calculate swipe direction variance
  calculateSwipeDirectionVariance() {
    if (this.touchSession.swipes.length === 0) return 0;
    
    const directions = this.touchSession.swipes.map(swipe => 
      Math.atan2(
        swipe.endLocation.y - swipe.startLocation.y,
        swipe.endLocation.x - swipe.startLocation.x
      )
    );
    
    const meanDirection = directions.reduce((sum, dir) => sum + dir, 0) / directions.length;
    const variance = directions.reduce((sum, dir) => sum + Math.pow(dir - meanDirection, 2), 0) / directions.length;
    
    return Math.sqrt(variance);
  }

  // Calculate average stroke complexity
  calculateAverageStrokeComplexity() {
    if (this.touchSession.strokes.length === 0) return 0;
    
    const totalComplexity = this.touchSession.strokes.reduce((sum, stroke) => sum + stroke.complexity, 0);
    return totalComplexity / this.touchSession.strokes.length;
  }

  // Calculate stroke pressure variance
  calculateStrokePressureVariance() {
    if (this.touchSession.strokes.length === 0) return 0;
    
    let totalVariance = 0;
    this.touchSession.strokes.forEach(stroke => {
      if (stroke.pressure && stroke.pressure.length > 1) {
        const mean = stroke.averagePressure;
        const variance = stroke.pressure.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / stroke.pressure.length;
        totalVariance += variance;
      }
    });
    
    return totalVariance / this.touchSession.strokes.length;
  }

  // Calculate hesitation index (pauses between interactions)
  calculateHesitationIndex() {
    const allInteractions = [
      ...this.touchSession.taps.map(t => ({ time: t.timestamp, type: 'tap' })),
      ...this.touchSession.holds.map(h => ({ time: h.startTime, type: 'hold' })),
      ...this.touchSession.swipes.map(s => ({ time: s.startTime, type: 'swipe' })),
      ...this.touchSession.strokes.map(s => ({ time: s.startTime, type: 'stroke' })),
    ].sort((a, b) => a.time - b.time);
    
    if (allInteractions.length < 2) return 0;
    
    const pauses = [];
    for (let i = 1; i < allInteractions.length; i++) {
      pauses.push(allInteractions[i].time - allInteractions[i - 1].time);
    }
    
    const averagePause = pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length;
    return Math.min(averagePause / 1000, 5); // Cap at 5 seconds
  }

  // Calculate overall consistency index
  calculateConsistencyIndex() {
    const tapConsistency = this.calculateTapConsistency();
    const holdVariance = this.calculateHoldDurationVariance();
    const swipeVariance = this.calculateSwipeVelocityVariance();
    
    return (tapConsistency + (1 / (1 + holdVariance)) + (1 / (1 + swipeVariance))) / 3;
  }

  calculateHoldDurationVariance() {
    if (this.touchSession.holds.length < 2) return 0;
    
    const durations = this.touchSession.holds.map(h => h.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    
    return Math.sqrt(variance) / mean;
  }

  calculateSwipeVelocityVariance() {
    if (this.touchSession.swipes.length < 2) return 0;
    
    const velocities = this.touchSession.swipes.map(s => s.averageVelocity);
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }

  // Infer mood from features using heuristic weights
  inferMood(features) {
    const weights = moodInferenceConfig.weights;
    const moodScores = {
      calm: 0,
      joyful: 0,
      tense: 0,
      flat: 0,
    };

    // Apply weighted features to mood scores
    Object.keys(features).forEach(featureKey => {
      const featureValue = features[featureKey];
      const featureWeights = weights[featureKey];
      
      if (featureWeights) {
        Object.keys(featureWeights).forEach(mood => {
          moodScores[mood] += featureValue * featureWeights[mood];
        });
      }
    });

    // Normalize scores
    const maxScore = Math.max(...Object.values(moodScores));
    const minScore = Math.min(...Object.values(moodScores));
    const range = maxScore - minScore;

    if (range > 0) {
      Object.keys(moodScores).forEach(mood => {
        moodScores[mood] = (moodScores[mood] - minScore) / range;
      });
    }

    // Find dominant mood and confidence
    const dominantMood = Object.keys(moodScores).reduce((a, b) =>
      moodScores[a] > moodScores[b] ? a : b
    );

    const confidence = moodScores[dominantMood];
    const isConfident = confidence >= moodInferenceConfig.confidence_threshold;

    return {
      mood: dominantMood,
      confidence,
      isConfident,
      scores: moodScores,
      features,
    };
  }

  // Complete calibration and save results
  completeCalibration() {
    const features = this.extractFeatures();
    const moodResult = this.inferMood(features);
    
    this.calibrationData = {
      timestamp: Date.now(),
      features,
      touchSession: { ...this.touchSession },
    };
    
    this.lastMoodResult = moodResult;
    
    return moodResult;
  }

  // Get the last mood inference result
  getLastMood() {
    return this.lastMoodResult;
  }

  // Reset calibration data
  recalibrate() {
    this.calibrationData = null;
    this.lastMoodResult = null;
    this.startCalibration();
  }

  // Get calibration status
  isCalibrated() {
    return this.calibrationData !== null;
  }
}

// Export singleton instance
export const moodInference = new MoodInferenceService();