import { useEffect, useRef } from "react";

export default function Video({ srcObject, ...props }) {
    const ref = useRef();

    useEffect(() => {
        // Must set the srcObject in this way, rather than via an attribute
        //  directly on the <video> element due to a React problem with that
        //  attribute.  For inspiration for this solution, see: https://github.com/coding-with-chaim/group-video-final/blob/d7f34070c9e060a3dd64214338df0255a44daf27/client/src/routes/Room.js#L20
        ref.current.srcObject = srcObject
    }, [srcObject]);
    
    return(
        <video ref={ref} autoPlay playsInline></video>
    );
};