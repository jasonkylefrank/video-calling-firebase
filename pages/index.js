import Head from 'next/head';
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
//#endregion


export default function Home() {
 
  const stunServers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ],
    iceCandidatePoolSize: 10
  };
  
  // Global state
  // TODO: Determine if this should occur in a useEffect()
  const pc = !isRunningOnServer() && new RTCPeerConnection(stunServers);


  return (
    <Container>
      <Head>
        <title>Meow chat!</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <Main>
        <Title>
          Video meower <span className="version">v1.01</span>
        </Title>
        
        <VideoArea
          firestore={firestore}
          peerConnection={pc}
        />


      </Main>

      <Footer>
        Powered by&nbsp;<strong>WebRTC</strong>&nbsp;technology
      </Footer>
    </Container>
  )
}
