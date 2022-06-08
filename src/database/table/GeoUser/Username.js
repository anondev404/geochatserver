const { UsernameFormatInvalidException } = require("./exception/UsernameFormatInvalidException");

//valid username must satisfy this regex
const _usernameRegex = "/^[a-z\d.]{5,}$/i";

class Username {

	//method to be called to validated a username
	static validate(username) {
		const regex = new RegExp(_usernameRegex);

		if (regex.test(username)) {
			throw new UsernameFormatInvalidException();
		}
	}
}