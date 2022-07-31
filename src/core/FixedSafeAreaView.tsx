import React, {PropsWithChildren} from 'react';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

export default function FixedSafeAreaView({children}: PropsWithChildren) {
	const insets = useSafeAreaInsets();
	return <Container insets={insets}>{children}</Container>;
}

interface ContainerProps {
	insets: EdgeInsets;
}

const Container = styled.View<ContainerProps>`
	flex: 1;
	padding-top: ${({insets}) => insets.top}px;
	padding-bottom: ${({insets}) => insets.bottom}px;
	padding-right: ${({insets}) => insets.right}px;
	padding-left: ${({insets}) => insets.left}px;
`;
