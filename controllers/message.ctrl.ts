import { NextApiRequest, NextApiResponse } from 'next';
import BadReqError from './error/bad_request_error';
import MessageModel from '@/models/message/message.model';
import { PostMessage, PostMessageReply } from '@/models/message/in_message';

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
  const { uid } = req.query;

  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const listResp = await MessageModel.list({ uid: uidToStr });

  return res.status(200).json(listResp);
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

const MessageCtrl = {
  post,
  list,
  postReply,
};

export default MessageCtrl;
