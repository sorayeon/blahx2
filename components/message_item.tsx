import { InMessage } from '@/models/message/in_message';
import ResizeTextarea from 'react-textarea-autosize';
import convertDateToString from '@/utils/convert_date_to_string';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import MoreBtnIcon from './more_btn_icon';
import FirebaseClient from '@/models/firebase_client';
export const BROKEN_IMAGE = 'https://bit.ly/broken-link';

interface Props {
  uid: string;
  displayName: string;
  screenName: string;
  photoURL: string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

const MessageItem = function ({ uid, displayName, screenName, photoURL, isOwner, item, onSendComplete }: Props) {
  const [reply, setReply] = useState('');
  const toast = useToast();

  async function postReply() {
    const resp = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        reply,
      }),
    });

    if (resp.status < 300) {
      onSendComplete();
    }
  }

  async function updateDeny({ deny }: { deny: boolean }) {
    const token = await FirebaseClient.getInstance().Auth.currentUser?.getIdToken();
    if (token === undefined) {
      toast({
        title: '로그인한 사용자만 사용할 수 있는 메뉴입니다.',
      });
      return;
    }
    const resp = await fetch('/api/messages.deny', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', authorization: token },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        deny,
      }),
    });

    if (resp.status < 300) {
      onSendComplete();
    }
  }

  const haveReply = item.reply !== undefined;
  const isDeny = item.deny !== undefined ? item.deny === true : false;
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar size="xs" src={item.author ? item.author.photoURL ?? BROKEN_IMAGE : BROKEN_IMAGE} />
          <Text fontSize="xx-small" ml="1">
            {item.author ? item.author.displayName : 'anonymous'}
          </Text>
          <Text fontSize="xx-small" whiteSpace="pre-line" color="gray.500" ml="1">
            {convertDateToString(item.createAt)}
          </Text>
          <Spacer />
          {isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MoreBtnIcon />}
                width="24px"
                height="24px"
                borderRadius="full"
                variant="link"
                size="xs"
              />
              <MenuList>
                <MenuItem
                  onClick={() => {
                    updateDeny({ deny: item.deny !== undefined ? !item.deny : true });
                  }}
                >
                  {isDeny ? '비공개 처리 해제' : '비공개 처리'}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = `/${screenName}/${item.id}`;
                  }}
                >
                  메시지 상세 보기
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
        {haveReply && (
          <Box pt="2">
            <Divider />
            <Flex mt="2">
              <Box pt="2">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" p="2" width="full" bg="gray.100">
                <Flex alignItems="center">
                  <Text fontSize="xx-small">{displayName}</Text>
                  <Text whiteSpace="pre-line" fontSize="xx-small" color="gray" ml="1">
                    {convertDateToString(item.replyAt!)}
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Flex>
          </Box>
        )}
        {haveReply === false && isOwner && (
          <Box pt="2">
            <Divider />
            <Flex mt="2">
              <Box pt="1">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" width="full" bg="gray.100" mr="2">
                <Textarea
                  border="none"
                  boxShadow="none !important"
                  resize="none"
                  minH="unset"
                  overflow="hidden"
                  fontSize="xs"
                  placeholder="댓글을 입력하세요..."
                  as={ResizeTextarea}
                  value={reply}
                  onChange={(e) => setReply(e.currentTarget.value)}
                />
              </Box>
              <Button
                disabled={reply.length === 0}
                colorScheme="pink"
                bgColor="#FF75B5"
                variant="solid"
                size="sm"
                onClick={() => {
                  postReply();
                }}
              >
                등록
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageItem;
