import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
// Must import firebase stuff dynamically like this to ensure that
//  it is only loaded client-side since it accesses browser-only APIs
//  like the 'navigator'.  See https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
const firestore = dynamic(
  () => import('../firebase/firebaseInit'),
  { ssr: false } // Don't load this on the server
);
import isRunningOnServer from '../utilities/isRunningOnServer';
import VideoArea from '../components/videoArea';

//#region Styled Components
const Container = styled.div`
  min-height: 100vh;
  ${'' /* height: 100vh; */}
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Main = styled.main`
  padding-bottom: 5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const footerHeight = '64px';

const Footer = styled.footer`
  width: 100%;
  height: ${footerHeight};
  min-height: ${footerHeight};
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
  margin: 40px 0;
  line-height: 1.15;
  font-size: 2.4rem;
  text-align: center;
  font-weight: 300;
  color: rgba(0,0,0,0.54);

  & .version {
    color: rgba(0,0,0,0.28);
  }

  & a {
    color: ${ ({theme}) => theme.colors.primary };

    &:hover, &:focus, &:active {
      text-decoration: underline;
    }
  }
`;

const LogoImage = styled(Image)`
  filter: grayscale(1);
  display: inline-block;  

  & + & {
    ${'' /* For some reason margin is not taking effect. Something appears to be overriding any margin I set here (setting it to 0) */}
    ${'' /* The selector seems fine though (see: https://github.com/styled-components/styled-components/issues/74#issuecomment-296757178) */}
    ${'' /* margin-left: 48px; */}
  }
`;
// A bit of a workaround b/c of the margin problem noted above
const LogoSeparator = styled.span`
  display: inline-block;
  height: 20px;
  width: 20px;
`;
//#endregion ---Styled Components---


export default function Home() {
  const logoSize = 24; // px
 
  const stunServers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ],
    iceCandidatePoolSize: 10
  };
   
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const pc = !isRunningOnServer() && new RTCPeerConnection(stunServers);
    setPeerConnection(pc);
    return () => {
      // TODO: Any cleanup needed here?
    }
  }, []);


  return (
    <Container>
      <Head>
        <title>Meow chat!</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <Main>
        <Title>
          Meow caller <span className="version">v1.01</span>
        </Title>
        
        <VideoArea
          firestore={firestore}
          peerConnection={peerConnection}
        />


      </Main>

      <Footer>
        Powered by
          <LogoSeparator />
          <LogoImage title="WebRTC" src="/webrtc-logo.png" width={logoSize} height={logoSize} />
          <LogoSeparator />
          <LogoImage title="Next.js" src="/nextjs-logo.svg" width={logoSize * 2.2} height={logoSize * 1.2} />
          <LogoSeparator />
          <LogoImage title="Styled Components" src="/styled-components-logo.png" width={logoSize} height={logoSize} />

          <LogoSeparator />
          <LogoImage title="Google Firebase" src="/firebase-logo.svg" width={logoSize} height={logoSize} />
          <LogoSeparator />
          <LogoImage title="Azure" src="/azure-logo.png" width={logoSize} height={logoSize} />

          {/* <strong>WebRTC</strong>,&nbsp;
          <strong>Google Firebase</strong>,&nbsp;&&nbsp;
          <strong>Azure</strong> */}
        {/* &nbsp;technologies */}
      </Footer>
    </Container>
  )
}
