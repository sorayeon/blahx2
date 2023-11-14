import { firestore } from 'firebase-admin';
import BadReqError from '@/controllers/error/bad_request_error';
import FirebaseAdmin from '../firebase_admin';
import { InMessage, InMessageServer, PostMessage, PostMessageReply } from './in_message';

const MEMBER_COL = 'members';
const MESSAGE_COL = 'messages';

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

async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    const messageCol = memberRef.collection(MESSAGE_COL).orderBy('createAt', 'desc');
    const messageDoc = await transation.get(messageCol);
    const data = messageDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });

  return listData;
}

async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);
  const data = await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    const messageDoc = await transation.get(messageRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    if (messageDoc.exists === false) {
      throw new BadReqError('존재하지않는 문서');
    }
    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data;
}
async function postReply({ uid, messageId, reply }: PostMessageReply) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);
  await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    const messageDoc = await transation.get(messageRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    if (messageDoc.exists === false) {
      throw new BadReqError('존재하지않는 문서');
    }
    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new BadReqError('이미 댓글을 입력했습니다.');
    }
    await transation.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
}

const MessageModel = {
  post,
  list,
  get,
  postReply,
};

export default MessageModel;
