import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutChartProps {
  data: {
    value: number;
    color: string;
  }[];
  size: number;
  strokeWidth: number;
  totalAmount: string;
  trend: string;
}

export const DonutChart = ({ data, size, strokeWidth, totalAmount, trend }: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const sharedProgress = useSharedValue(0);

  React.useEffect(() => {
    sharedProgress.value = withTiming(1, { duration: 1000 });
  }, []);

  let accumulatedPercentage = 0;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (circumference * item.value) / 100;
            const rotation = (accumulatedPercentage * 360) / 100;
            accumulatedPercentage += item.value;

            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
        </G>
      </Svg>
      <View style={StyleSheet.absoluteFill} className="items-center justify-center">
        <Text className="text-muted text-[10px] uppercase tracking-widest">Total Spent</Text>
        <Text className="text-white font-bold text-3xl mt-1">${totalAmount}</Text>
        <View className="bg-success/20 px-2 py-0.5 rounded-full mt-2 flex-row items-center">
           <Ionicons name="arrow-up" size={10} color="#10B981" />
           <Text className="text-success text-[10px] font-bold ml-1">{trend}</Text>
        </View>
      </View>
    </View>
  );
};
