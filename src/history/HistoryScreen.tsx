import React from 'react';
import styled from 'styled-components/native';
import Fade from '../components/Fade';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import {VSpace} from '../components/Space';
import {useVerticalSwipeScreenContext} from '../components/VerticalSwipe';
import * as ZStack from '../components/ZStack';
import BestHoursHistogram from './BestHoursHistogram';
import HistoryHeaderAnimation from './HistoryHeaderAnimation';
import HistoryTimeline from './HistoryTimeline';
import {Period} from './types';
import {useBestHoursMemory} from './useBestHoursMemory';

const PHRASES: Record<Period, string> = {
	'early-morning': 'early in the morning',
	morning: 'in the morning',
	noon: 'at noon',
	afternoon: 'in the afternoon',
	evening: 'in the evening',
	night: 'at night',
	'late-night': 'late at night',
};

export default function HistoryScreen() {
	const {visible} = useVerticalSwipeScreenContext();
	const {bestPeriod} = useBestHoursMemory();
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
							<VSpace size={32} />
							<HeaderText>Best hours</HeaderText>
							<VSpace size={20} />
							<BestHoursHistogram />
							<VSpace size={20} />
							<AdviceText>
								You are most productive {PHRASES[bestPeriod]}.
							</AdviceText>
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

const AdviceText = styled.Text`
	font-size: 16px;
	font-family: Inter;
	font-weight: 600;
	color: ${(p) => p.theme.text.base};
`;
