import { useMediaQuery } from "../utils/useMediaQuery";

type ColorSchemeName = 'light' | 'dark' | null | undefined;

export function useColorScheme(): ColorSchemeName {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return isDark ? 'dark' : 'light';
}