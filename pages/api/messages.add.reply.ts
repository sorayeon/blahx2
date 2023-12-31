import { NextApiRequest, NextApiResponse } from 'next';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_support_method';
import MessageCtrl from '@/controllers/message.ctrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['POST'];

  try {
    checkSupportMethod(supportMethod, method);
    await MessageCtrl.postReply(req, res);
  } catch (error) {
    console.error(error);
    // 에러 처리
    handleError(error, res);
  }
}
