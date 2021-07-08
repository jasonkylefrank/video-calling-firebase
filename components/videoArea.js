import { useState, useEffect } from 'react';
import styled from 'styled-components';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Video from '../components/video';
import SectionHeader from '../components/sectionHeader';


//#region ---Styled Components---
const VideosContainer = styled.div`
    display: flex;
    text-align: center;

    ${({ localStream }) => {
        if (localStream) 
            return `
                height: 100%;
                opacity: 1;
            `
        else return `
                height: 36px;
                opacity: 0;
            `
    }}
`;
const VideoContainer = styled.span`
    display: flex;
    flex-direction: column;
`;
const StyledVideo = styled(Video)`
    margin: 16px;
    max-height: 400px;
    max-width: 45vw;
`;
const VideoLabel = styled.label`
    font-size: 14px;
    color: rgba(0,0,0,0.54);
`;
//#endregion ---Styled Components---

export default function VideoArea({
    peerConnection,
    setIsWebcamInitialized
}) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const [availableWebcams, setAvailableWebcams] = useState();
    const [isWebcamDialogOpen, setIsWebcamDialogOpen] = useState(false);
    const [chosenWebcam, setChosenWebcam] = useState();

    const handleWebcamBtnClick = async () => {
        const cams = await (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
        setAvailableWebcams(cams);
        // If the user has multiple options then we'll open a picker for them to choose. Otherwise, go ahead and set it
        if (cams.length === 1) { 
            setChosenWebcam(cams[0]); 
        }                
    };
    // Once we have a chosen webcam, then do stuff with it
    useEffect(() => {        
        async function setupStreams() {
            if (!chosenWebcam) {
                return;
            }
    
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: chosenWebcam.deviceId },
                audio: true            
            });
            // Push tracks from local stream to peer connection
            stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));    
            setLocalStream(stream);

            // Pull tracks from peer connection stream, add to this user's UI
            peerConnection.ontrack = async (event) => {
                const stream = event.streams[0];

                if (!remoteStream) {
                    setRemoteStream(new MediaStream(stream.getTracks()));
                }
            };
        }
        setupStreams();
    }, [chosenWebcam, peerConnection, remoteStream]);

    // Deal with the possibility of the user having multiple webcams that need to be picked from
    useEffect(() => {
        if (!chosenWebcam && availableWebcams?.length > 1) {
            setIsWebcamDialogOpen(true);
        }
        else {
            setIsWebcamDialogOpen(false);
        }
    }, [availableWebcams, chosenWebcam]);

    // Signal to the outer component that streams have been initialized
    useEffect(() => {
        if (localStream) {
            setIsWebcamInitialized(true);            
        }
    }, [localStream, setIsWebcamInitialized]);

    return (
        <>
            <SectionHeader>1. Start your webcam</SectionHeader>

            <VideosContainer localStream={localStream}>
                <VideoContainer>
                    <VideoLabel>Local stream</VideoLabel>
                    {/* Muted since we don't want to hear ourselves and it would
                    cause feedback when demoing this via another video calling app */}
                    <StyledVideo srcObject={localStream} muted={true} />
                </VideoContainer>
                <VideoContainer>
                    <VideoLabel>Remote stream</VideoLabel>                    
                    <StyledVideo srcObject={remoteStream} />
                </VideoContainer>
            </VideosContainer>

            <Button 
                color="primary"
                //variant="outlined"
                onClick={handleWebcamBtnClick}
                disabled={localStream !== null}>
                    Start webcam
            </Button>

 
            <Dialog open={isWebcamDialogOpen}>
                <DialogTitle>Choose webcam</DialogTitle>
                <List>
                    {availableWebcams?.map((cam) => (
                        <ListItem 
                            button
                            onClick={() => setChosenWebcam(cam)}
                            key={cam.deviceId}
                        >
                            {cam.label}
                        </ListItem>
                    ))}
                </List>
            </Dialog>

        </>
    );
}