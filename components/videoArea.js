import { useState, useEffect } from 'react';
import styled from 'styled-components';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Video from '../components/video';

const VideosContainer = styled.div`
    display: flex;
    text-align: center;
`;

export default function VideoArea({
    firestore,
    peerConnection
}) {
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
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
    useEffect(async () => {
        if (!chosenWebcam) {
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: chosenWebcam.deviceId },
            audio: true            
        });
        // Push tracks from local stream to peer connection
        stream.getTracks().forEach((track) => peerConnection.addTrack(track));

        setLocalStream(stream);

        //TODO... (other stuff)

    }, [chosenWebcam]);

    // Deal with the possibility of the user having multiple webcams that need to be picked from
    useEffect(() => {
        if (!chosenWebcam && availableWebcams?.length > 1) {
            setIsWebcamDialogOpen(true);
        }
        else {
            setIsWebcamDialogOpen(false);
        }
    }, [availableWebcams, chosenWebcam]);

    return (
        <>
            <h2>1. Start your webcam</h2>

            <VideosContainer>
                <span>
                    <label>Local stream</label>
                    <Video srcObject={localStream} />
                </span>
                <span>
                    <label>Remote stream</label>                    
                    <Video srcObject={remoteStream} />
                </span>
            </VideosContainer>

            <Button variant="outlined" onClick={handleWebcamBtnClick}>Start webcam</Button>

 
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