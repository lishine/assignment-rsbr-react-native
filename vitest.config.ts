import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: [(process.cwd() + '/tests-setup.tsx')],
		include: ['packages/mobile/tests/**/*.test.{ts,tsx}'],
		globals: true,
	},
})
