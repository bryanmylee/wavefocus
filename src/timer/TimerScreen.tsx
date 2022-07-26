import React, {useCallback, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';
import {useInterval} from '../utils/useInterval';
import Timer from './Timer';

const MAX_ACTIVE_TIME_SEC = 25 * 60;

export default function TimerScreen() {
	const [seconds, setSeconds] = useState(MAX_ACTIVE_TIME_SEC);
	const [isActive, setIsActive] = useState(false);

	useInterval(
		() => {
			setSeconds((ts) => ts - 1);
		},
		1000,
		isActive,
	);

	const togglePlayPause = useCallback(() => {
		if (seconds <= 0) {
			return;
		}
		setIsActive((a) => !a);
	}, [seconds]);

	return (
		<>
			<TimerContainer>
				<Timer seconds={seconds} />
			</TimerContainer>
			<BottomBar>
				<Button onPress={togglePlayPause}>
					<Icon name={isActive ? 'pause' : 'play'} size={42} color="#004f40" />
				</Button>
			</BottomBar>
		</>
	);
}

const TimerContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
`;

const BottomBar = styled.View`
	flex-direction: row;
	justify-content: center;
`;

const Button = styled.TouchableOpacity`
	margin: 64px;
`;
