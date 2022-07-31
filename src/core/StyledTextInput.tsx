import React from 'react';
import {TextInputProps} from 'react-native';
import styled from 'styled-components/native';

interface StyledTextInputProps extends TextInputProps {
	width?: string | number;
}

export default function TextInput({
	width = 'auto',
	...props
}: StyledTextInputProps) {
	return <StyledTextInput {...props} width={width} />;
}

const StyledTextInput = styled.TextInput<StyledTextInputProps>`
	border-radius: 12px;
	border-color: ${(p) => p.theme.fill.primary};
	border-width: 4px;
	padding: 12px;
	width: ${({width}) => (typeof width === 'string' ? width : `${width}px`)};
`;
