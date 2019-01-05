module.exports = {
	moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
	transform: {
		'^.+\\.jsx?$': 'babel-jest'
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	testMatch: [
		'**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
	]
};
