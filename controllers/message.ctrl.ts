import { NextApiRequest, NextApiResponse } from 'next';
import BadReqError from './error/bad_request_error';
import MessageModel from '@/models/message/message.model';
import { PostMessage, PostMessageReply, PostMessageDeny } from '@/models/message/in_message';
import AuthorizationError from './error/authorization_error';
import FirebaseAdmin from '@/models/firebase_admin';

const DEFAULT_SIZE = 10;

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author }: PostMessage = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (message === undefined) {
    throw new BadReqError('message 누락');
  }

  await MessageModel.post({ uid, message, author });

  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid, page, size } = req.query;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  const convertPage = page === undefined ? '1' : page;
  const convertSize = size === undefined ? `${DEFAULT_SIZE}` : size;

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;
  const listResp = await MessageModel.listWithPage({
    uid: uidToStr,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });

  return res.status(200).json(listResp);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToStr = Array.isArray(messageId) ? messageId[0] : messageId;
  const data = await MessageModel.get({ uid: uidToStr, messageId: messageIdToStr });

  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply }: PostMessageReply = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (reply === undefined) {
    throw new BadReqError('reply 누락');
  }

  await MessageModel.postReply({ uid, messageId, reply });

  return res.status(201).end();
}

async function updateDeny(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new AuthorizationError('권한이 없습니다');
  }

  let tokenUid: string | null = null;
  try {
    const decode = await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    tokenUid = decode.uid;
  } catch (err) {
    throw new AuthorizationError('token에 문제가 있습니다');
  }

  const { uid, messageId, deny }: PostMessageDeny = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (uid !== tokenUid) {
    throw new AuthorizationError('수정 권한이 없습니다');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (deny === undefined) {
    throw new BadReqError('deny 누락');
  }

  const result = await MessageModel.updateDeny({ uid, messageId, deny });

  return res.status(200).json(result);
}

const MessageCtrl = {
  post,
  list,
  get,
  postReply,
  updateDeny,
};

export default MessageCtrl;
