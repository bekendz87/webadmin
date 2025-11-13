import React from 'react';
import { GetServerSideProps } from 'next';

export default function Custom404(): React.JSX.Element {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }
  },
    React.createElement('h1', null, 'API Server Only'),
    React.createElement('p', null,
      'Please access the client at: ',
      React.createElement('a', { href: 'http://localhost:3004' }, 'http://localhost:3004')
    )
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // Nếu không phải API request, redirect đến client
  if (!req.url?.startsWith('/api')) {
    return {
      redirect: {
        destination: 'http://localhost:3004',
        permanent: false,
      },
    };
  }

  return { props: {} };
};