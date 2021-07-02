import Head from 'next/head';
import Image from 'next/image';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Main = styled.main`
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Footer = styled.footer`
  width: 100%;
  height: 64px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(0,0,0,0.54);
  font-size: 13px;

  & a {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }
`;

const Title = styled.h1`
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;

  & a {
    color: ${ ({theme}) => theme.colors.primary };

    &:hover, &:focus, &:active {
      text-decoration: underline;
    }
  }
`;



export default function Home() {
  return (
    <Container>
      <Head>
        <title>Meow chat!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>
          Welcome to <a href="https://nextjs.org">Next.js!</a>        
        </Title>

      </Main>

      <Footer>
        Powered by&nbsp;<strong>WebRTC</strong>&nbsp;technology
      </Footer>
    </Container>
  )
}
