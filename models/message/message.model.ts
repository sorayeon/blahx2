import { firestore } from 'firebase-admin';
import BadReqError from '@/controllers/error/bad_request_error';
import FirebaseAdmin from '../firebase_admin';
import { InMessage, InMessageServer, PostMessage, PostMessageReply, PostMessageDeny } from './in_message';
import { InAuthUser } from '../in_auth_user';

const MEMBER_COL = 'members';
const MESSAGE_COL = 'messages';

const DEFAULT_SIZE = 10;

const { Firestore } = FirebaseAdmin.getInstance();
async function post({ uid, message, author }: PostMessage) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  await Firestore.runTransaction(async (transation) => {
    let messageCount = 1;
    const memberDoc = await transation.get(memberRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    if (memberInfo.messageCount !== undefined) {
      messageCount = memberInfo.messageCount;
    }

    const newMessageRef = memberRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      messageNo: number;
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      messageNo: messageCount,
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transation.set(newMessageRef, newMessageBody);
    await transation.update(memberRef, { messageCount: messageCount + 1 });
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
      const isDeny = docData.deny !== undefined && docData.deny === true;
      const returnData = {
        ...docData,
        id: mv.id,
        message: isDeny ? '비공개 처리된 메시지 입니다.' : docData.message,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });

  return listData;
}

async function listWithPage({ uid, page = 1, size = DEFAULT_SIZE }: { uid: string; page?: number; size?: number }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;
    const totalElements = messageCount !== 0 ? messageCount - 1 : 0;
    const remains = totalElements % size;
    const totalPages = (totalElements - remains) / size + (remains > 0 ? 1 : 0);
    const startAt = totalElements - (page - 1) * size;
    console.log('totalElements {} remains {} totalPages {} startAt {}', totalElements, remains, totalPages, startAt);
    if (startAt < 0) {
      return {
        totalElements,
        totalPages: 0,
        page,
        size,
        content: [],
      };
    }
    const messageCol = memberRef.collection(MESSAGE_COL).orderBy('messageNo', 'desc').startAt(startAt).limit(size);
    const messageDoc = await transation.get(messageCol);
    const data = messageDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const isDeny = docData.deny !== undefined && docData.deny === true;
      const returnData = {
        ...docData,
        id: mv.id,
        message: isDeny ? '비공개 처리된 메시지 입니다.' : docData.message,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return {
      totalElements,
      totalPages,
      page,
      size,
      content: data,
    };
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
    const isDeny = messageData.deny !== undefined && messageData.deny === true;
    return {
      ...messageData,
      id: messageId,
      message: isDeny ? '비공개 처리된 메시지 입니다.' : messageData.message,
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

async function updateDeny({ uid, messageId, deny = true }: PostMessageDeny) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);
  const result = await Firestore.runTransaction(async (transation) => {
    const memberDoc = await transation.get(memberRef);
    const messageDoc = await transation.get(messageRef);
    if (memberDoc.exists === false) {
      throw new BadReqError('존재하지않는 사용자');
    }
    if (messageDoc.exists === false) {
      throw new BadReqError('존재하지않는 문서');
    }
    await transation.update(messageRef, { deny });
    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      deny,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return result;
}

const MessageModel = {
  post,
  list,
  listWithPage,
  get,
  postReply,
  updateDeny,
};

export default MessageModel;
0;
