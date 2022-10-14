module.exports = {
	root: true,
	extends: '@react-native-community',
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/no-shadow': ['error'],
				'no-shadow': 'off',
				'no-undef': 'off',
			},
		},
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'react-hooks/exhaustive-deps': ['warn'],
			},
		},
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'react-native/no-inline-styles': 'off',
			},
		},
	],
};
