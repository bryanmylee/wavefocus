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
		insets.top = vert;
		insets.bottom = vert;
		const hori = Math.max(insets.left, insets.right);
		insets.left = hori;
		insets.right = hori;
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
