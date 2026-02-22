declare module 'react-native-android-sms-listener' {
  export interface SmsMessage {
    originatingAddress: string;
    body: string;
    timestamp: number;
  }

  export interface SmsSubscription {
    remove: () => void;
  }

  const SmsListener: {
    addListener: (callback: (message: SmsMessage) => void) => SmsSubscription;
  };

  export default SmsListener;
}
