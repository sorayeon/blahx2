import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth_user.context';

const GNB = function () {
  const { loading, authUser, signInWithGoogle, signOut } = useAuth();

  const loginBtn = (
    <Button
      onClick={signInWithGoogle}
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="pink.400"
      _hover={{ bg: 'pink.300' }}
    >
      로그인
    </Button>
  );
  const logOutBtn = (
    <Button onClick={signOut} as="a" variant="link" fontWeight={400}>
      로그아웃
    </Button>
  );

  const authInitialized = loading || authUser === null;
  return (
    <Box borderBottom={1} borderStyle="solid" borderColor="gray.200" backgroundColor="white">
      <Flex minH="60px" maxW="md" py={{ base: 2 }} px={{ base: 4 }} mx="auto">
        <Spacer />
        <Box flex="1">
          <img src="/logo.svg" alt="logo" style={{ height: '40px' }} />
        </Box>
        <Box justifyContent="flex-end">{authInitialized ? loginBtn : logOutBtn}</Box>
      </Flex>
    </Box>
  );
};

export default GNB;
