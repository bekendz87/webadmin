import { GetStaticProps } from 'next';

export default function Home() {
    return null;
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        redirect: {
            destination: 'http://localhost:3004',
            permanent: false,
        },
    };
};