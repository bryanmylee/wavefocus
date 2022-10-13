import React, {PropsWithChildren} from 'react';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

interface FixedSafeAreaViewProps extends PropsWithChildren {
	centered?: boolean;
}

const FixedSafeAreaView = React.forwardRef<
	typeof Container,
	FixedSafeAreaViewProps
>(({centered = false, children}, forwardedRef) => {
	const insets = useSafeAreaInsets();
	let resolvedInsets = {...insets};
	if (centered) {
		const vert = Math.max(insets.top, insets.bottom);
		const hori = Math.max(insets.left, insets.right);
		resolvedInsets = {
			top: vert,
			bottom: vert,
			left: hori,
			right: hori,
		};
	}
	return (
		<Container ref={forwardedRef} insets={resolvedInsets}>
			{children}
		</Container>
	);
});
FixedSafeAreaView.displayName = 'FixedSafeAreaView';

export default FixedSafeAreaView;

interface ContainerProps {
	insets: EdgeInsets;
}

const Container = styled.View<ContainerProps>`
	position: relative;
	flex: 1;
	margin-top: ${({insets}) => insets.top}px;
	margin-bottom: ${({insets}) => insets.bottom}px;
	margin-right: ${({insets}) => insets.right}px;
	margin-left: ${({insets}) => insets.left}px;
`;
