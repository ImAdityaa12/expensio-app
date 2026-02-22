declare module 'expo-background-fetch' {
  export enum BackgroundFetchStatus {
    Available = 1,
    Denied = 2,
    Restricted = 3,
  }

  export enum BackgroundFetchResult {
    NoData = 1,
    NewData = 2,
    Failed = 3,
  }

  export interface BackgroundFetchOptions {
    minimumInterval?: number;
    stopOnTerminate?: boolean;
    startOnBoot?: boolean;
  }

  export function registerTaskAsync(
    taskName: string,
    options?: BackgroundFetchOptions
  ): Promise<void>;

  export function unregisterTaskAsync(taskName: string): Promise<void>;

  export function getStatusAsync(): Promise<BackgroundFetchStatus>;
}
