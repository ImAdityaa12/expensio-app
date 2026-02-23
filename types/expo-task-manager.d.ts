declare module 'expo-task-manager' {
  export interface TaskManagerTask {
    data: any;
    error: Error | null;
    executionInfo: {
      eventId: string;
      taskName: string;
    };
  }

  export function defineTask(
    taskName: string,
    task: (body: TaskManagerTask) => void | Promise<any>
  ): void;

  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;

  export function unregisterTaskAsync(taskName: string): Promise<void>;

  export function unregisterAllTasksAsync(): Promise<void>;

  export function getRegisteredTasksAsync(): Promise<string[]>;
}
