import React from 'react';
import {View} from 'react-native';

interface Space {
	size: number;
}

export function Space({size}: Space) {
	return <View style={{width: size, height: size}} pointerEvents="none" />;
}

export function VSpace({size}: Space) {
	return <View style={{height: size}} pointerEvents="none" />;
}

export function HSpace({size}: Space) {
	return <View style={{width: size}} pointerEvents="none" />;
}
