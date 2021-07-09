import { useState, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
// Must import firebase stuff dynamically like this to ensure that
//  it is only loaded client-side since it accesses browser-only APIs
//  like the 'navigator'.  See https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
// const firestore = dynamic(
//   () => import('../firebase/firebaseInit'),
//   { ssr: false } // Don't load this on the server.  https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
// );

import isRunningOnServer from '../utilities/isRunningOnServer';
import VideoArea from '../components/videoArea';
import InitiateCall from '../components/initiateCall';

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

// I wanted to use Next.js's <Image> for this but it doesn't work with static exports.
//  Next.js's <Image> provides some nice things like lazy-loading of your images, etc.
const LogoImage = styled.img`
  filter: grayscale(1);
  display: inline-block;
  transition: all 0.4s;
  
  &:hover {
    filter: none;
    transform: scale(1.25);
  }

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

const SectionSeparator = styled.div`
  width: 50vw;
  max-width: 720px;
  border-bottom: 1px solid rgba(0,0,0,0.14);
  margin: 36px 0 20px 0;
`;

const StyledInitiateCall = styled(InitiateCall)`
  opacity: ${props => props.isWebcamInitialized ? 1.0 : 0.2};
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
  const [isWebcamInitialized, setIsWebcamInitialized] = useState(false);
  const [firestore, setFirestore] = useState(null);

  useEffect(() => {
    const pc = !isRunningOnServer() && new RTCPeerConnection(stunServers);
    setPeerConnection(pc);
    // We need to require firestore inside a useEffect like this in
    //  order to prevent the firebase initialization from running on the server.
    //  Next.js's dynamic imports did work for this use-case, I think because 
    //  we were not importing a react component. See: https://www.reddit.com/r/nextjs/comments/lagib3/im_having_a_hard_time_understanding_dynamic/glxz6u8?utm_source=share&utm_medium=web2x&context=3
    const f = require('../firebase/firebaseInit').default; // Must include the ".default" when using require().  See: https://stackoverflow.com/a/43249395/718325
    setFirestore(f);

    return () => {
      // TODO: Any cleanup needed here?
    }
  }, []);

  //#region --- Debugging Firestore ---
  async function printFirestoreData(collectionName) {
    const querySnapshot = await firestore?.collection(collectionName).get();
    console.log(`\nFirestore collection: "${collectionName}" currently contains: `);
    querySnapshot?.forEach((doc) => { 
      console.log(`${doc.id} =>`);
      console.log(doc.data());
    });
  }

  // useEffect(() => {
  //   printFirestoreData('tests');
  // }, [firestore]);
  //#endregion --- Debugging Firestore ---

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
          peerConnection={peerConnection}
          setIsWebcamInitialized={setIsWebcamInitialized}
        />

        <SectionSeparator />
        <StyledInitiateCall
          peerConnection={peerConnection}
          isWebcamInitialized={isWebcamInitialized}
          firestore={firestore}
        />
        {
          

        }
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
