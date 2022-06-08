const { UsernameFormatInvalidException } = require("./GeoUserHandlerException/UsernameFormatInvalidException");

//valid username must satisfy this _regex
const _regex = "/^[a-z\d.]{5,}$/i";

class Username {

	//method to be called to validated a username
	static validate(username) {
		const _regex = new _regexp(_regex);

		if (_regex.test(username)) {
			throw new UsernameFormatInvalidException();
		}
	}
}