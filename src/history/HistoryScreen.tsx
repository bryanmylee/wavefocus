import React from 'react';
import styled from 'styled-components/native';
import Fade from '../components/Fade';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import {VSpace} from '../components/Space';
import {useVerticalSwipeScreenContext} from '../components/VerticalSwipe';
import * as ZStack from '../components/ZStack';
import HistoryHeaderAnimation from './HistoryHeaderAnimation';
import HistoryTimeline from './HistoryTimeline';

export default function HistoryScreen() {
	const {visible} = useVerticalSwipeScreenContext();
	return (
		<ZStack.Container flex={1}>
			<ZStack.Item>
				<HistoryHeaderAnimation pause={!visible} />
			</ZStack.Item>
			<ZStack.Item>
				<FixedSafeAreaView>
					<Fade when={visible}>
						<MainContent>
							<VSpace size={48} />
							<HeaderText>Today</HeaderText>
							<VSpace size={20} />
							<HistoryTimeline />
						</MainContent>
					</Fade>
				</FixedSafeAreaView>
			</ZStack.Item>
		</ZStack.Container>
	);
}

const HeaderText = styled.Text`
	font-size: 24px;
	font-family: Inter;
	font-weight: 800;
	color: ${(p) => p.theme.text.base};
`;

const MainContent = styled.View`
	padding: 24px;
`;
