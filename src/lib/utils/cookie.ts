export function getCookie(name: string): any {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookieValue = parts.pop()?.split(';').shift();
		if (cookieValue) {
			try {
				return JSON.parse(cookieValue);
			} catch (e) {
				console.error('Error parsing cookie JSON', e);
				return null;
			}
		}
	}
	return null;
}

export function setCookie(name: string, value: string, days: number) {
	const date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	const expires = `expires=${date.toUTCString()}`;
	document.cookie = `${name}=${value}; ${expires}; path=/`;
	console.log("create value success!");
}

export function addCookie(name: string, value: string, days: number) {
	const existingCookie = getCookie(name);
	let newValueArray: string[] = [];
	if (existingCookie) {
		newValueArray = existingCookie;
	}
	newValueArray.push(value);
	const newValue = JSON.stringify(newValueArray);
	const date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	const expires = `expires=${date.toUTCString()}`;
	document.cookie = `${name}=${newValue}; ${expires}; path=/`;
}
