import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/colors';

interface BattleTimerProps {
  startTime: string;
  duration: number; // in seconds
  onHalfway?: () => void;
  onComplete?: () => void;
}

export const BattleTimer: React.FC<BattleTimerProps> = ({
  startTime,
  duration,
  onHalfway,
  onComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(1);
  const [isHalfwayPassed, setIsHalfwayPassed] = useState(false);
  
  useEffect(() => {
    const battleStartTime = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - battleStartTime) / 1000);
    const initialRemaining = Math.max(0, duration - elapsedSeconds);
    
    setTimeRemaining(initialRemaining);
    setProgress(initialRemaining / duration);
    
    if (initialRemaining <= duration / 2 && !isHalfwayPassed) {
      setIsHalfwayPassed(true);
      onHalfway?.();
    }
    
    if (initialRemaining <= 0) {
      onComplete?.();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newRemaining = Math.max(0, prev - 1);
        setProgress(newRemaining / duration);
        
        if (newRemaining <= duration / 2 && !isHalfwayPassed) {
          setIsHalfwayPassed(true);
          onHalfway?.();
        }
        
        if (newRemaining <= 0) {
          clearInterval(timer);
          onComplete?.();
        }
        
        return newRemaining;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, duration, onHalfway, onComplete, isHalfwayPassed]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getTimerColor = () => {
    if (timeRemaining <= duration * 0.25) return colors.danger;
    if (timeRemaining <= duration * 0.5) return colors.warning;
    return colors.primary;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle in Progress</Text>
      <Text style={[styles.timer, { color: getTimerColor() }]}>
        {formatTime(timeRemaining)}
      </Text>
      <ProgressBar 
        progress={progress} 
        fillColor={getTimerColor()}
        height={12}
      />
      {timeRemaining <= duration / 2 ? (
        <Text style={styles.message}>Hack now for maximum effect!</Text>
      ) : (
        <Text style={styles.message}>Waiting for optimal hack moment...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});