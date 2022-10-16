import React from 'react';
import styled from 'styled-components/native';
import * as ZStack from '../components/ZStack';
import HistoryHeaderAnimation from './HistoryHeaderAnimation';

export default function HistoryScreen() {
	return (
		<Container>
			<ZStack.Container flex={1}>
				<ZStack.Item>
					<HistoryHeaderAnimation />
				</ZStack.Item>
			</ZStack.Container>
		</Container>
	);
}

const Container = styled.View`
	flex: 1;
`;
