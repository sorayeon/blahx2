import Head from 'next/head';
import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';
import GNB from './GNB';

interface Props {
  title: string;
  children: React.ReactNode;
}
export const ServiceLayout: React.FC<Props & BoxProps> = function ({ title = 'blah x2', children, ...boxProps }) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />
      {children}
    </Box>
  );
};
