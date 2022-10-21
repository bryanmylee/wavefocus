import React, {useCallback, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {LayoutChangeEvent} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import {VSpace} from '../components/Space';
import {DAY_DURATION_MS} from '../constants';
import {useCurrentMs} from '../utils/useCurrentMs';
import {useHistoryMemory} from './useHistoryMemory';

type IntervalSize = [x1: number, x2: number];

export default function HistoryTimeline() {
	const theme = useTheme();
	const [width, setWidth] = useState(0);
	const handleLayout = useCallback((ev: LayoutChangeEvent) => {
		setWidth(ev.nativeEvent.layout.width);
	}, []);
	const strokeWidth = 10;
	const trackWidth = width - strokeWidth;

	const {intervals} = useHistoryMemory();
	const today8am = dayjs().startOf('day').add(8, 'hours');
	const filteredIntervals = useMemo(() => {
		return intervals
			.filter(({end}) => dayjs(end).isAfter(today8am))
			.sort((a, b) => a.start - b.start);
	}, [intervals, today8am]);
	const now = useCurrentMs(10000);
	const intervalSizes: IntervalSize[] = useMemo(() => {
		const today8amMs = today8am.unix() * 1000;
		return filteredIntervals.map(({start, end}) => {
			const startPercent = Math.max(0, start - today8amMs) / DAY_DURATION_MS;
			const endPercent =
				Math.max(0, Math.min(end, now) - today8amMs) / DAY_DURATION_MS;
			return [trackWidth * startPercent, trackWidth * endPercent];
		});
	}, [filteredIntervals, today8am, trackWidth, now]);

	return (
		<Container onLayout={handleLayout}>
			<Svg height={10} width={width}>
				<Line
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					stroke={theme.timer.progressTrack}
					opacity={theme.timer.progressTrackOpacity}
					x1={strokeWidth / 2}
					x2={width - strokeWidth / 2}
					y={5}
				/>
				{intervalSizes.map(([x1, x2]) => (
					<Line
						key={x1}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						stroke={theme.timer.progressFill}
						x1={x1}
						x2={x2}
						y={5}
					/>
				))}
			</Svg>
			<VSpace size={12} />
			<TimeLabelContainer>
				<TimeLabel style={{left: 0}}>8am</TimeLabel>
				<TimeLabel style={{left: width * 0.25}}>2pm</TimeLabel>
				<TimeLabel style={{left: width * 0.5}}>8pm</TimeLabel>
				<TimeLabel style={{left: width * 0.75}}>2am</TimeLabel>
			</TimeLabelContainer>
		</Container>
	);
}

const Container = styled.View``;

const TimeLabelContainer = styled.View`
	position: relative;
`;

const TimeLabel = styled.Text`
	position: absolute;
	font-variant: tabular-nums;
	font-size: 14px;
	font-family: Inter;
	font-weight: 600;
	color: ${(p) => p.theme.text.base};
`;
