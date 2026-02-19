import React from 'react';
import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="font-poppins-bold text-xl text-dark">Profile</Text>
      <Text className="font-poppins text-gray-400">Manage your account</Text>
    </View>
  );
}
