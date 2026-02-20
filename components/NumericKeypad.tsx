import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface NumericKeypadProps {
  onPress: (val: string) => void;
  onDelete: () => void;
}

export const NumericKeypad = ({ onPress, onDelete }: NumericKeypadProps) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'backspace') {
      onDelete();
    } else {
      onPress(key);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            style={styles.key}
            activeOpacity={0.6}
          >
            {key === 'backspace' ? (
              <Ionicons name="backspace-outline" size={28} color="white" />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  key: {
    width: '33.33%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins_500Medium',
  },
});
