import React from 'react';
import {ButtonProps} from 'react-native';
import styled from 'styled-components/native';

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
	background-color: ${(p) => p.theme.timer.fluidFill};
	opacity: ${(p) => p.theme.timer.fluidOpacity};
`;

const StyledText = styled.Text`
	color: ${(p) => p.theme.timer.text};
	font-size: 20px;
	font-weight: 600;
	font-family: Inter;
`;

export default function Button(props: ButtonProps) {
	return (
		<ButtonBase {...props} accessibilityLabel={props.title}>
			<ButtonBackground />
			<StyledText>{props.title}</StyledText>
		</ButtonBase>
	);
}
