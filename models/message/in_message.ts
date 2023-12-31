import { firestore } from 'firebase-admin';

interface MessageBase {
  id: string;
  /** 사용자가 남긴 질문 */
  message: string;
  /** 댓글 */
  reply?: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
  /** 비공개 처리여부 */
  deny?: boolean;
}

export interface InMessage extends MessageBase {
  createAt: string;
  replyAt?: string;
}

export interface InMessageServer extends MessageBase {
  createAt: firestore.Timestamp;
  replyAt?: firestore.Timestamp;
}
export interface PostMessage {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}
export interface PostMessageReply {
  uid: string;
  messageId: string;
  reply: string;
}

export interface PostMessageDeny {
  uid: string;
  messageId: string;
  deny: boolean;
}
