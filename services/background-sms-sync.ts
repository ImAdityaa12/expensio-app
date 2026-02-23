import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const BACKGROUND_SMS_SYNC_TASK = 'background-sms-sync';

// Background task to sync SMS periodically
TaskManager.defineTask(BACKGROUND_SMS_SYNC_TASK, async () => {
  try {
    console.log('🔄 Background SMS sync task started');
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('🔄 No user logged in, skipping sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // On Android, we rely on the SMS listener for real-time processing
    // This background task is a fallback for any missed messages
    if (Platform.OS === 'android') {
      console.log('🔄 Android: SMS listener handles real-time processing');
      console.log('🔄 Background task is running as fallback');
    }

    console.log('🔄 Background sync completed');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('🔄 Background sync error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSyncTask() {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SMS_SYNC_TASK);
    
    if (isRegistered) {
      console.log('🔄 Background sync task already registered');
      return true;
    }

    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SMS_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (minimum allowed by iOS)
      stopOnTerminate: false, // Continue after app is closed
      startOnBoot: true, // Start on device boot
    });

    console.log('🔄 ✅ Background sync task registered successfully');
    return true;
  } catch (error) {
    console.error('🔄 Error registering background task:', error);
    return false;
  }
}

export async function unregisterBackgroundSyncTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SMS_SYNC_TASK);
    console.log('🔄 Background sync task unregistered');
  } catch (error) {
    console.error('🔄 Error unregistering background task:', error);
  }
}

export async function getBackgroundSyncStatus() {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SMS_SYNC_TASK);
    
    return {
      status,
      isRegistered,
      statusText: getStatusText(status),
    };
  } catch (error) {
    console.error('🔄 Error getting background sync status:', error);
    return null;
  }
}

function getStatusText(status: BackgroundFetch.BackgroundFetchStatus): string {
  switch (status) {
    case BackgroundFetch.BackgroundFetchStatus.Available:
      return 'Available';
    case BackgroundFetch.BackgroundFetchStatus.Denied:
      return 'Denied';
    case BackgroundFetch.BackgroundFetchStatus.Restricted:
      return 'Restricted';
    default:
      return 'Unknown';
  }
}
