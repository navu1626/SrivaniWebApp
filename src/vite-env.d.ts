/// <reference types="vite/client" />

// Add any custom Vite env variables here so TypeScript knows their types.
interface ImportMetaEnv {
	readonly VITE_BASE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
