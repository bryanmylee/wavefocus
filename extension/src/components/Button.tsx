import React, {ButtonHTMLAttributes} from 'react';

const Button = React.forwardRef<
	HTMLButtonElement,
	ButtonHTMLAttributes<HTMLButtonElement>
>((props, forwardedRef) => {
	const {children, className, ...restProps} = props;
	return (
		<button
			ref={forwardedRef}
			{...restProps}
			className={
				'rounded-2xl bg-button-fill px-3 py-[7.5px] font-medium text-button-text text-base tracking-tight hover:opacity-75 active:opacity-50' +
				className
			}>
			{children}
		</button>
	);
});

export default Button;
