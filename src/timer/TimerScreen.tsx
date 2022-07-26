import React, {useCallback} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';
import {useUser} from '../auth/UserProvider';
import Timer from './Timer';
import {useTimerMemory} from './useTimerMemory';

export default function TimerScreen() {
	const {user} = useUser();
	const {isActive, toggleActive, secondsRemaining} = useTimerMemory(
		user?.uid ?? '',
	);

	const togglePlayPause = useCallback(() => {
		toggleActive();
	}, [toggleActive]);

	return (
		<>
			<TimerContainer>
				<Timer seconds={secondsRemaining} />
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
