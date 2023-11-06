/* eslint-disable react/jsx-props-no-spreading */
import { ChakraProvider } from '@chakra-ui/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthUserProvider } from '@/contexts/auth_user.context';

const MyApp = function ({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthUserProvider>
        <Component {...pageProps} />
      </AuthUserProvider>
    </ChakraProvider>
  );
};

export default MyApp;
