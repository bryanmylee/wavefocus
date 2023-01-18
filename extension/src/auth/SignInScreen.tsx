import clsx from 'classnames';
import Button from '../components/Button';
import {useTimerScreenDimensions} from '../timer/useTimerScreenDimensions';
import {useUser} from './UserProvider';

export interface SignInScreenProps {
	show: boolean;
}

export default function SignInScreen({show}: SignInScreenProps) {
	const {user, signIn, signOut} = useUser();
	const {width} = useTimerScreenDimensions();
	return (
		<div
			className={clsx(
				'overflow-hidden transition-all duration-500 border-timer-fluid-fill border-opacity-timer-fluid',
				show ? 'h-28 border-b' : 'h-0',
			)}
			style={{width}}>
			<div className="flex flex-col h-full justify-center items-center gap-2 p-4">
				{user == null ? null : user.isAnonymous ? (
					<Button onClick={signIn}>Sign in</Button>
				) : (
					<>
						<h1 className="font-semibold text-sm text-text-base leading-4 text-ellipsis whitespace-nowrap overflow-hidden max-w-full">
							Signed in as {user.displayName}
						</h1>
						<p className="font-medium text-xs text-text-subtitle text-ellipsis whitespace-nowrap overflow-hidden max-w-full">
							{user.email}
						</p>
						<Button onClick={signOut}>Sign out</Button>
					</>
				)}
			</div>
		</div>
	);
}
