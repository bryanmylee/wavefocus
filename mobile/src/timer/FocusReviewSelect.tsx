import React, {useEffect} from 'react';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';
import {VSpace} from '../components/Space';
import {Review, REVIEWS, REVIEW_TO_LABEL} from '../review/Review';
import {useBreakpoints} from '../utils/useBreakpoints';

interface FocusReviewSelectProps {
	currentReview: Review;
	onCurrentReviewChange?: (review: Review) => void;
}

export default function FocusReviewSelect({
	currentReview,
	onCurrentReviewChange,
}: FocusReviewSelectProps) {
	const {md} = useBreakpoints();
	const currentIndex = REVIEWS.findIndex((r) => r === currentReview);
	return (
		<Container md={md}>
			<QuestionText>How was your focus?</QuestionText>
			<VSpace size={12} />
			<SelectContainer>
				<SelectBackground />
				<SelectArea>
					<OptionBackground index={currentIndex} />
					{REVIEWS.map((review, index) => (
						<OptionTouchable
							key={review}
							onPress={() => onCurrentReviewChange?.(review)}>
							<OptionText active={index === currentIndex}>
								{REVIEW_TO_LABEL[review]}
							</OptionText>
						</OptionTouchable>
					))}
				</SelectArea>
			</SelectContainer>
		</Container>
	);
}

interface ContainerProps {
	md: boolean;
}

const Container = styled.View<ContainerProps>`
	margin: 24px;
	${(p) => (p.md ? 'margin-left: auto;' : '')}
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
	padding: 6px;
	width: 224px;
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
	border-radius: 18px;
	background-color: ${(p) => p.theme.select.fill};
`;

const OptionTouchable = styled.TouchableOpacity`
	flex: 1;
	padding: 8px;
`;

interface OptionTextProps {
	active: boolean;
}

const OptionText = styled.Text<OptionTextProps>`
	text-align: center;
	font-family: Inter;
	font-size: 16px;
	font-weight: 600;
	color: ${(p) => (p.active ? p.theme.select.activeText : p.theme.select.text)};
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
	background-color: ${(p) => p.theme.select.activeFill};
`;
