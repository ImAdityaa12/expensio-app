declare module 'react-native-get-sms-android' {
  export interface SmsFilter {
    box?: string;
    minDate?: number;
    maxDate?: number;
    bodyRegex?: string;
    read?: number;
    indexFrom?: number;
    maxCount?: number;
  }

  export interface SmsMessage {
    _id: string;
    thread_id: string;
    address: string;
    person: number;
    date: number;
    date_sent: number;
    protocol: number;
    read: number;
    status: number;
    type: number;
    body: string;
    service_center: string;
    locked: number;
    error_code: number;
    sub_id: number;
    seen: number;
    deletable: number;
    sim_slot: number;
    hidden: number;
    app_id: number;
    msg_id: number;
    reserved: number;
    pri: number;
    teleservice_id: number;
    svc_cmd: number;
    roam_pending: number;
    spam_report: number;
    secret_mode: number;
    safe_message: number;
    favorite: number;
  }

  export default class SmsAndroid {
    static list(
      filter: string,
      fail: (error: string) => void,
      success: (count: number, smsList: string) => void
    ): void;

    static delete(
      _id: string,
      fail: (error: string) => void,
      success: () => void
    ): void;

    static autoSend(
      phoneNumber: string,
      message: string,
      fail: (error: string) => void,
      success: () => void
    ): void;
  }
}
