import { NextApiRequest, NextApiResponse } from 'next';
import BadReqError from './error/bad_request_error';
import MessageModel, { PostMessage } from '@/models/message/message.model';

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

const MessageCtrl = {
  post,
};

export default MessageCtrl;
