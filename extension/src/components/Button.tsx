import React, {ButtonHTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';

const Button = React.forwardRef<
	HTMLButtonElement,
	ButtonHTMLAttributes<HTMLButtonElement>
>((props, forwardedRef) => {
	const {children, className, ...restProps} = props;
	return (
		<button
			ref={forwardedRef}
			{...restProps}
			className={twMerge(
				'transition-colors rounded-xl bg-button-fill px-3 py-[5px] font-medium text-button-text text-sm tracking-tight hover:opacity-75 active:opacity-50',
				className,
			)}>
			{children}
		</button>
	);
});

export default Button;
