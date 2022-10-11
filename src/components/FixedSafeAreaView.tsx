import React, {PropsWithChildren} from 'react';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

interface FixedSafeAreaViewProps extends PropsWithChildren {
	centered?: boolean;
}

export default function FixedSafeAreaView({
	centered = false,
	children,
}: FixedSafeAreaViewProps) {
	const insets = useSafeAreaInsets();
	if (centered) {
		const vert = Math.max(insets.top, insets.bottom);
		const hori = Math.max(insets.left, insets.right);
		return (
			<Container
				insets={{
					top: vert,
					bottom: vert,
					left: hori,
					right: hori,
				}}>
				{children}
			</Container>
		);
	}
	return <Container insets={insets}>{children}</Container>;
}

interface ContainerProps {
	insets: EdgeInsets;
}

const Container = styled.View<ContainerProps>`
	position: relative;
	flex: 1;
	margin-top: ${({insets}) => insets.top}px;
	margin-bottom: ${({insets}) => insets.bottom}px;
	margin-right: ${({insets}) => insets.right}px;
	margin-left: ${({insets}) => insets.left}px;
`;
