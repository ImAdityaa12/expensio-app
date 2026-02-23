import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { getBackgroundSyncStatus } from '../services/background-sms-sync';
import { startSmsListener, stopSmsListener } from '../services/sms-listener';

export default function SmsSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listenerActive, setListenerActive] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    const status = await getBackgroundSyncStatus();
    setSyncStatus(status);
    setLoading(false);
  };

  const toggleListener = async () => {
    if (listenerActive) {
      stopSmsListener();
      setListenerActive(false);
    } else {
      const started = await startSmsListener();
      setListenerActive(started);
    }
  };

  if (Platform.OS !== 'android') {
    return (
      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <Text className="text-white text-base font-medium mb-2">SMS Auto-Sync</Text>
        <Text className="text-gray-400 text-sm">
          SMS auto-sync is only available on Android devices.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <ActivityIndicator color="#13C8EC" />
      </View>
    );
  }

  return (
    <View className="bg-gray-800 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-medium">SMS Auto-Sync</Text>
        <View className={`px-3 py-1 rounded-full ${listenerActive ? 'bg-green-500/20' : 'bg-gray-700'}`}>
          <Text className={`text-xs font-medium ${listenerActive ? 'text-green-400' : 'text-gray-400'}`}>
            {listenerActive ? '● Active' : '○ Inactive'}
          </Text>
        </View>
      </View>

      <View className="space-y-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-400 text-sm">Background Sync</Text>
          <Text className="text-white text-sm">
            {syncStatus?.isRegistered ? '✓ Enabled' : '✗ Disabled'}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-400 text-sm">Status</Text>
          <Text className="text-white text-sm">
            {syncStatus?.statusText || 'Unknown'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={toggleListener}
        className={`py-3 rounded-xl ${listenerActive ? 'bg-red-500/20' : 'bg-[#13C8EC]/20'}`}
      >
        <Text className={`text-center font-medium ${listenerActive ? 'text-red-400' : 'text-[#13C8EC]'}`}>
          {listenerActive ? 'Stop SMS Listener' : 'Start SMS Listener'}
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-500 text-xs mt-3 text-center">
        Automatically syncs expenses from bank SMS messages
      </Text>
    </View>
  );
}
