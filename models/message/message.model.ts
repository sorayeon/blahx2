import BadReqError from '@/controllers/error/bad_request_error';
import FirebaseAdmin from '../firebase_admin';
import { firestore } from 'firebase-admin';

const MEMBER_COL = 'members';
const MESSAGE_COL = 'messages';

export interface PostMessage {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}

const { Firestore } = FirebaseAdmin.getInstance();
async function post({ uid, message, author }: PostMessage) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    const newMessageRef = memberRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transation.set(newMessageRef, newMessageBody);
  });
}

const MessageModel = {
  post,
};

export default MessageModel;
