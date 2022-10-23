import React from 'react';
import {useCallback, useState} from 'react';
import {LayoutChangeEvent, useWindowDimensions} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import {VSpace} from '../components/Space';
import {useBestHoursMemory} from './useBestHoursMemory';

const HOURS = Array.from({length: 24}).map((_, i) => i);

export default function BestHoursHistogram() {
	const {normalizedScores} = useBestHoursMemory();

	const [width, setWidth] = useState(0);
	const theme = useTheme();
	const handleLayout = useCallback((ev: LayoutChangeEvent) => {
		setWidth(ev.nativeEvent.layout.width);
	}, []);
	const strokeWidth = 10;
	const histogramWidth = width - strokeWidth;
	const {height} = useWindowDimensions();
	const histogramHeight = Math.min(128, height / 4);
	return (
		<Container onLayout={handleLayout}>
			<Svg height={histogramHeight} width={width}>
				{HOURS.map((hour) => (
					<Line
						key={hour}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						stroke={theme.timer.progressTrack}
						opacity={theme.timer.progressTrackOpacity}
						y1={strokeWidth / 2}
						y2={histogramHeight - strokeWidth / 2}
						x={strokeWidth / 2 + (histogramWidth * hour) / (HOURS.length - 1)}
					/>
				))}
				{normalizedScores.map(
					(score, hour) =>
						score >= 0.05 && (
							<Line
								key={hour}
								strokeWidth={strokeWidth}
								strokeLinecap="round"
								stroke={theme.timer.progressFill}
								y1={
									strokeWidth / 2 +
									(1 - score) * (histogramHeight - strokeWidth)
								}
								y2={histogramHeight - strokeWidth / 2}
								x={
									strokeWidth / 2 + (histogramWidth * hour) / (HOURS.length - 1)
								}
							/>
						),
				)}
			</Svg>
			<VSpace size={12} />
			<TimeLabelContainer>
				<TimeLabel style={{left: 0}}>12am</TimeLabel>
				<TimeLabel style={{left: width * 0.25}}>6am</TimeLabel>
				<TimeLabel style={{left: width * 0.5}}>12pm</TimeLabel>
				<TimeLabel style={{left: width * 0.75}}>6pm</TimeLabel>
			</TimeLabelContainer>
		</Container>
	);
}

const Container = styled.View``;

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
