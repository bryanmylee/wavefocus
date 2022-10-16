import styled from 'styled-components/native';

interface ContainerProps {
	flex?: number;
}

export const Container = styled.View<ContainerProps>`
	position: relative;
	${(p) => (p.flex != null ? `flex: ${p.flex};` : '')}
`;

export const Item = styled.View`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
`;
