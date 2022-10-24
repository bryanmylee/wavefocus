import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import styled from 'styled-components/native';
import Button from '../components/Button';
import Fade from '../components/Fade';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import {Space, VSpace} from '../components/Space';
import {useVerticalSwipeScreenContext} from '../components/VerticalSwipe';
import * as ZStack from '../components/ZStack';
import {useBreakpoints} from '../utils/useBreakpoints';
import BestHoursHistogram from './BestHoursHistogram';
import HistoryHeaderAnimation from './HistoryHeaderAnimation';
import HistoryTimeline from './HistoryTimeline';
import {Period} from './types';
import {useBestHoursMemory} from './useBestHoursMemory';
import {useHistoryMemory} from './useHistoryMemory';

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
	const {resetHistory} = useHistoryMemory();
	const {bestPeriod, resetHours, isReset} = useBestHoursMemory();
	const {md} = useBreakpoints();

	const createResetAlert = useCallback(() => {
		Alert.alert('Reset hours?', 'This will reset recommendations.', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Reset',
				onPress: () => {
					resetHistory();
					resetHours();
				},
				style: 'destructive',
			},
		]);
	}, [resetHistory, resetHours]);
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
							<HistogramLayout md={md}>
								<HistogramContainer md={md}>
									<BestHoursHistogram />
								</HistogramContainer>
								<Space size={20} />
								<AdviceContainer md={md}>
									{!isReset && (
										<>
											<AdviceText>
												You are most productive {PHRASES[bestPeriod]}.
											</AdviceText>
											<VSpace size={20} />
										</>
									)}
									<Button
										title="Reset hours"
										style={{marginLeft: 'auto', marginRight: 'auto'}}
										onPress={createResetAlert}
									/>
								</AdviceContainer>
							</HistogramLayout>
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

interface HistogramLayoutProps {
	md: boolean;
}

const HistogramLayout = styled.View<HistogramLayoutProps>`
	flex-direction: ${(p) => (p.md ? 'row' : 'column')};
`;

const HistogramContainer = styled.View<HistogramLayoutProps>`
	${(p) => (p.md ? 'flex: 3;' : '')}
`;

const AdviceContainer = styled.View<HistogramLayoutProps>`
	${(p) => (p.md ? 'flex: 2;' : '')}
	align-items: flex-start;
`;
