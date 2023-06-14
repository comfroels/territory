import * as React from 'react';

export interface UserContext {
	user: string;
	setUser: (user: string | null) => void;
}

const Ctx = React.createContext({} as UserContext);

export function useUserContext() {
	const context = React.useContext(Ctx);

	if (!context)
		throw new Error(`useUserContext must be used within a UserContextProvider`);

	return context;
}

export function UserContextProvider({
	initialUser,
	children,
}: {
	initialUser: string | null;
	children: React.ReactNode;
}) {
	const [user, setUser] = React.useState<string | null>(initialUser);
	React.useEffect(() => {
		if (typeof window !== 'undefined') {
			const user = localStorage.getItem(`territory:user`);
			console.log('user', user);
			if (user) {
				setUser(user);
			} else {
				setUser(initialUser);
			}
		}
	}, [initialUser]);
	const clearUser = React.useCallback(() => setUser(null), []);
	const handleSetUser = React.useCallback((user: string) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('territory:user', user);
		}
		setUser(user);
	}, []);

	const value = React.useMemo(
		() =>
			({
				user,
				setUser: handleSetUser,
			} as UserContext),
		[user, setUser]
	);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
