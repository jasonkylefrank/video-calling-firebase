import { useState } from 'react';
import styled from 'styled-components';
import SectionHeader from './sectionHeader';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

//#region --- Styled Components ---
const Root = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const ActionsContainer = styled.div`
    display: ${({ hidden }) => hidden ? 'none': 'flex'};
    flex-direction: column;
    padding-top: 24px;
`;
const StartCallContainer = styled.span`
    display: ${({ hidden }) => hidden ? 'none': 'flex'};
    flex-direction: column;
`;
const StartCallIDContainer = styled.div`
    display: ${({ hidden }) => hidden ? 'none': 'flex'};
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
`;
const StartCallIDLabelValContainer = styled.div`

`;
const StartCallIDLabel = styled.label`
    font-weight: 700;
    color: rgba(0,0,0,0.54);
`;
const StartCallIDValue = styled.label`

`;
const StartCallIDTagline = styled.label`
    font-size: 12px;
    margin-top: 12px;
    color: rgba(30, 136, 229, 0.54);
`;
const JoinCallContainer = styled.span`
    margin-top: 36px;
    display: ${({ hidden }) => hidden ? 'none': 'flex'};
    flex-direction: column;    

    & > * {
        margin-bottom: 16px;
    }
`;
const StyledTextField = styled(TextField)`
    display: ${({ hidden }) => hidden ? 'none': 'inline-flex'};
`;
//#endregion --- Styled Components ---


const userRoles = Object.freeze({
    NOT_DETERMINED: 'not determined',
    INITIATOR: 'initiator',
    JOINER: 'joiner' 
});



export default function InitiateCall({ 
    className,
    isWebcamInitialized,
    peerConnection,
    firestore
}) {
    const [callId, setCallId] = useState("");
    const [userRole, setUserRole] = useState(userRoles.NOT_DETERMINED);


    const handleStartCallBtnClick = async () => {
        // Reference Firestore collections for signalling
        const callDoc = firestore.collection('calls').doc();
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        callDoc && setCallId(callDoc.id);

        // --- Handle offer ---
        
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
        
        setUserRole(userRoles.INITIATOR);
    };

    const handleJoinCallBtnClick = () => {
        setUserRole(userRoles.JOINER);
    };
    
    // Answer the call with the unique ID
    const handleJoinThatCallBtnClick = async () => {
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
            <SectionHeader>2. Start or join call</SectionHeader>

            <ActionsContainer hidden={!isWebcamInitialized}>
                <StartCallContainer hidden={userRole === userRoles.JOINER}>
                    {/* The initial userRole state is 'not determined', so once we know this user is the 'initiator',
                        then we need to transform parts of this UI */}
                    <Button
                        color='primary'
                        onClick={handleStartCallBtnClick}
                        disabled={userRole === userRoles.INITIATOR}
                    >
                        {
                            (() => {
                                switch(userRole) {
                                    case userRoles.NOT_DETERMINED:
                                        return 'Start call';
                                    case userRoles.INITIATOR:
                                        return '✓ Call initiated';
                                }
                            }) ()
                        }
                    </Button>
                    <StartCallIDContainer hidden={userRole === userRoles.NOT_DETERMINED}>
                        <StartCallIDLabelValContainer>
                            <StartCallIDLabel>Call ID: </StartCallIDLabel>
                            <StartCallIDValue>{callId}</StartCallIDValue>
                        </StartCallIDLabelValContainer>
                        <StartCallIDTagline>Send this to the lucky guest!</StartCallIDTagline>
                    </StartCallIDContainer>
                </StartCallContainer>
                
                <JoinCallContainer hidden={userRole === userRoles.INITIATOR}>
                    {
                        userRole === userRoles.NOT_DETERMINED && (
                            <Button
                                color='primary'
                                disabled={!isWebcamInitialized}
                                onClick={handleJoinCallBtnClick}
                            >
                                Join call
                            </Button>
                        )
                    }
                    {
                        userRole === userRoles.JOINER && (
                            <>
                                {/* HACKY: Trying to solve the "all bold fonts" problem on MUI's TextField
                                           by passing-in inline styles for font-weight.  Doesn't seem to work yet :-( */}
                                <StyledTextField
                                    label="Call id"
                                    InputLabelProps={{ style: {fontWeight: 'nornal'} }}
                                    value={callId}
                                    onChange={handleCallIdTextFieldChange}
                                    inputProps={{ style: {fontWeight: 'normal'} }}
                                />
                                <Button
                                    color='primary'
                                    disabled={!callId}
                                    onClick={handleJoinThatCallBtnClick}
                                >
                                    Join that call!
                                </Button>
                            </>
                        )
                    }

                    

                </JoinCallContainer>
            </ActionsContainer>
        </Root>
    );
}
