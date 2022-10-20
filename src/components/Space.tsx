import React from 'react';
import {View} from 'react-native';

interface Space {
	size: number;
}

export function VSpace({size}: Space) {
	return <View style={{height: size}} />;
}

export function HSpace({size}: Space) {
	return <View style={{width: size}} />;
}
