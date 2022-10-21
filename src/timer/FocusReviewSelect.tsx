import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';
import {VSpace} from '../components/Space';
import {REVIEWS} from '../review/Review';

interface FocusReviewSelectProps {
	currentIndex: number;
	onCurrentIndexChange?: (index: number) => void;
}

export default function FocusReviewSelect({
	currentIndex,
	onCurrentIndexChange,
}: FocusReviewSelectProps) {
	const window = useWindowDimensions();
	return (
		<Container wide={window.width > 480}>
			<QuestionText>How was your focus?</QuestionText>
			<VSpace size={12} />
			<SelectContainer>
				<SelectBackground />
				<SelectArea>
					<OptionBackground index={currentIndex} />
					{REVIEWS.map((review, index) => (
						<OptionTouchable
							key={review}
							onPress={() => onCurrentIndexChange?.(index)}>
							<OptionText>{review}</OptionText>
						</OptionTouchable>
					))}
				</SelectArea>
			</SelectContainer>
		</Container>
	);
}

interface ContainerProps {
	wide: boolean;
}

const Container = styled.View<ContainerProps>`
	margin: 24px;
	${(p) => (p.wide ? 'margin-left: auto;' : '')}
`;

const QuestionText = styled.Text`
	text-align: center;
	font-family: Inter;
	font-size: 20px;
	font-weight: 600;
	color: ${(p) => p.theme.text.base};
`;

const SelectContainer = styled.View`
	posiiton: relative;
	padding: 8px;
	width: 256px;
	margin-left: auto;
	margin-right: auto;
`;

const SelectArea = styled.View`
	position: relative;
	flex-direction: row;
`;

const SelectBackground = styled.View`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 20px;
	background-color: ${(p) => p.theme.timer.fluidFill};
	opacity: ${(p) => p.theme.timer.fluidOpacity};
`;

const OptionTouchable = styled.TouchableOpacity`
	flex: 1;
	padding: 8px;
`;

const OptionText = styled.Text`
	text-align: center;
	font-family: Inter;
	font-size: 16px;
	font-weight: 500;
	color: ${(p) => p.theme.text.base};
`;

interface OptionBackgroundProps {
	index: number;
}

function OptionBackground({index}: OptionBackgroundProps) {
	const offset = useSharedValue(index);
	const baseAnim = useAnimatedStyle(() => ({
		left: `${(offset.value / 3) * 100}%`,
	}));
	useEffect(
		function syncOffset() {
			offset.value = withTiming(index, {
				duration: 300,
				easing: Easing.inOut(Easing.cubic),
			});
		},
		[offset, index],
	);
	return <OptionBackgroundBase style={baseAnim} />;
}

const OptionBackgroundBase = styled(Animated.View)`
	position: absolute;
	top: 0;
	bottom: 0;
	width: 33%;
	border-radius: 12px;
	background-color: ${(p) => p.theme.background};
`;
