import styled from "styled-components"

export default styled.h2`
    opacity: ${({ isDiminished }) => isDiminished && '0.3'};
`;