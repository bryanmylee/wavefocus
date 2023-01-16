import clsx from 'classnames';
import Button from '../components/Button';
import {useUser} from './UserProvider';
import appleIcon from './apple-icon.svg?raw';

export interface SignInScreenProps {
	show: boolean;
}

export default function SignInScreen({show}: SignInScreenProps) {
	const {user, signInApple, signInGoogle, signOut} = useUser();

	return (
		<div
			className={clsx(
				'overflow-hidden transition-all duration-500 border-timer-fluid-fill border-opacity-timer-fluid',
				show ? 'h-24 border-b' : 'h-0',
			)}>
			<div className="flex flex-col items-center gap-3 p-3">
				{user == null ? null : user.isAnonymous ? (
					<>
						<Button onClick={signInGoogle}>Sign in with Google</Button>
						<Button
							onClick={signInApple}
							className="bg-black text-white dark:bg-white dark:text-black flex items-center gap-2">
							<div
								className="w-3.5 h-3.5 inline-block"
								dangerouslySetInnerHTML={{__html: appleIcon}}
							/>
							Sign in with Apple
						</Button>
					</>
				) : (
					<>
						<Button onClick={signOut}>Sign out</Button>
					</>
				)}
			</div>
		</div>
	);
}
