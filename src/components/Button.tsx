import React from 'react';
import {ButtonProps} from 'react-native';
import styled from 'styled-components/native';

export default function Button(props: ButtonProps) {
	return (
		<ButtonBase {...props} accessibilityLabel={props.title}>
			<ButtonBackground />
			<StyledText>{props.title}</StyledText>
		</ButtonBase>
	);
}

const ButtonBase = styled.TouchableOpacity`
	position: relative;
	padding-left: 16px;
	padding-right: 16px;
	padding-top: 10px;
	padding-bottom: 10px;
`;

const ButtonBackground = styled.View`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 16px;
	background-color: ${(p) => p.theme.fill.button};
`;

const StyledText = styled.Text`
	color: ${(p) => p.theme.text.base};
	font-size: 18px;
	font-weight: 500;
	font-family: Inter;
	letter-spacing: -0.5px;
`;
