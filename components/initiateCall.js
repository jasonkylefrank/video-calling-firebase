import { useState } from 'react';
import styled from 'styled-components';
import SectionHeader from './sectionHeader';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


const Root = styled.section`
    display: flex;
    flex-direction: column;
`;
const ActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 24px;
`;
const JoinCallContainer = styled.span`
    margin-top: 36px;
    display: flex;
    flex-direction: column;

    & > * {
        margin-bottom: 16px;
    }
`;


export default function InitiateCall({ 
    className,
    isWebcamInitialized,
    peerConnection,
    firestore
}) {
    const [callId, setCallId] = useState("");

    const handleStartCallBtnClick = async () => {
        // Reference Firestore collections for signalling
        const callDoc = firestore.collection('calls').doc();
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        callDoc && setCallId(callDoc.id);

        // --- Handle offer stuff ---
        
        // Get candidates for caller, save to DB.
        //  Need to set this BEFORE calling createOffer() or setLocalDescription
        peerConnection.onicecandidate = (event) => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        // Create offer
        const offerDescription = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type
        };
        await callDoc.set({ offer });

        // --- Handle remote answer ---
        
        // Listen for remote answer & use it as our remote description
        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                peerConnection.setRemoteDescription(answerDescription);
            }
        });
        // Add each new answer ICE candidate to our peer connection
        answerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    peerConnection.addIceCandidate(candidate);
                }
            });
        });

    };

    // Answer the call with the unique ID
    const handleJoinCallBtnClick = async () => {
        const callDoc  = firestore.collection('calls').doc(callId);
        const answerCandidates = callDoc.collection('answerCandidates');
        const offerCandidates = callDoc.collection('offerCandidates');

        peerConnection.onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
        };

        const callData = (await callDoc.get()).data();
        const offerDescription = callData.offer;
        // For this user (who is not initiating the call), the offer is their remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp
        };
        await callDoc.update({ answer });
        // Add new offer ICE candidates to our peer connection
        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                console.log(change);
                if (change.type === 'added') {
                    const data = change.doc.data();
                    peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            })
        });
    };

    const handleCallIdTextFieldChange = (e) => setCallId(e.target.value);

    return (
        <Root className={className}>
            <SectionHeader>
                2. Start or join call
            </SectionHeader>

            <ActionsContainer>
                <Button
                    color='primary'
                    disabled={!isWebcamInitialized}
                    onClick={handleStartCallBtnClick}
                >
                    Start call
                </Button>
                
                <JoinCallContainer>
                    <TextField
                        label="Call id"
                        value={callId}
                        onChange={handleCallIdTextFieldChange}
                    />
                    <Button
                        color='primary'
                        disabled={!isWebcamInitialized}
                        onClick={handleJoinCallBtnClick}
                    >
                        Join call
                    </Button>
                </JoinCallContainer>
            </ActionsContainer>
        </Root>
    );
}
