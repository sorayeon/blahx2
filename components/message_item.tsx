import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
export const BROKEN_IMAGE = 'https://bit.ly/broken-link';

const MessageItem = function () {
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
          <Avatar size="xs" src={BROKEN_IMAGE} />
          <Text fontSize="xx-small" ml="1">
            anonymous
          </Text>
          <Text fontSize="xx-small" whiteSpace="pre-line" color="gray.500" ml="1">
            1일
          </Text>
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            내용
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageItem;
