import React, {ButtonHTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';
import Button from '../components/Button';
import appleIcon from './apple-icon.svg?raw';

const SignInWithAppleButton = React.forwardRef<
	HTMLButtonElement,
	ButtonHTMLAttributes<HTMLButtonElement>
>((props, forwardedRef) => {
	const {children, className, ...restProps} = props;
	return (
		<Button
			ref={forwardedRef}
			{...restProps}
			className={twMerge(
				'bg-black text-white dark:bg-white dark:text-black flex items-center gap-2',
				className,
			)}>
			<div
				className="w-3.5 h-3.5 inline-block"
				dangerouslySetInnerHTML={{__html: appleIcon}}
			/>
			Sign in with Apple
		</Button>
	);
});

export default SignInWithAppleButton;
