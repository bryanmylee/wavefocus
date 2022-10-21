import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dayjs from 'dayjs';
import {LayoutChangeEvent} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
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
	const contentWidth = width * 2;
	const handleLayout = useCallback((ev: LayoutChangeEvent) => {
		setWidth(ev.nativeEvent.layout.width);
	}, []);
	const strokeWidth = 10;
	const trackWidth = contentWidth - strokeWidth;

	const {intervals} = useHistoryMemory();
	const dayStartHour = 8;
	let dayStart = dayjs().startOf('day').add(dayStartHour, 'hours');
	if (dayjs().hour() < dayStartHour) {
		dayStart = dayStart.subtract(1, 'day');
	}
	const filteredIntervals = useMemo(() => {
		return intervals.filter(({end}) => dayjs(end).isAfter(dayStart));
	}, [intervals, dayStart]);

	const now = useCurrentMs(10000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const dayStartMs = useMemo(() => dayStart.unix() * 1000, [now]);
	const intervalSizes: IntervalSize[] = useMemo(() => {
		return filteredIntervals.map(({start, end}) => {
			const startPercent = Math.max(0, start - dayStartMs) / DAY_DURATION_MS;
			const endPercent =
				Math.max(0, Math.min(end, now) - dayStartMs) / DAY_DURATION_MS;
			return [trackWidth * startPercent, trackWidth * endPercent];
		});
	}, [filteredIntervals, dayStartMs, trackWidth, now]);

	const scrollViewRef = useRef<ScrollView | null>(null);
	const scrollOffset = useMemo(() => {
		const percentOfDay = (now - dayStartMs) / DAY_DURATION_MS;
		return (Math.floor(percentOfDay * 4) / 4) * contentWidth;
	}, [now, dayStartMs, contentWidth]);
	useEffect(
		function setScrollOffset() {
			setTimeout(() => {
				scrollViewRef.current?.scrollTo({x: scrollOffset, animated: false});
			}, 0);
		},
		[scrollOffset],
	);

	return (
		<ScrollView
			ref={scrollViewRef}
			onLayout={handleLayout}
			horizontal
			snapToInterval={width / 2}
			showsHorizontalScrollIndicator={false}>
			<Container style={{width: contentWidth}}>
				<Svg height={10} width={contentWidth}>
					<Line
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						stroke={theme.timer.progressTrack}
						opacity={theme.timer.progressTrackOpacity}
						x1={strokeWidth / 2}
						x2={contentWidth - strokeWidth / 2}
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
					<TimeLabel style={{left: contentWidth * 0.25}}>2pm</TimeLabel>
					<TimeLabel style={{left: contentWidth * 0.5}}>8pm</TimeLabel>
					<TimeLabel style={{left: contentWidth * 0.75}}>2am</TimeLabel>
				</TimeLabelContainer>
			</Container>
		</ScrollView>
	);
}

const Container = styled.View`
	flex: 1;
`;

const TimeLabelContainer = styled.View`
	position: relative;
	height: 20px;
`;

const TimeLabel = styled.Text`
	position: absolute;
	font-variant: tabular-nums;
	font-size: 14px;
	font-family: Inter;
	font-weight: 600;
	color: ${(p) => p.theme.text.base};
`;
