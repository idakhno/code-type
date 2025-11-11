import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

type AppThemeProviderProps = ThemeProviderProps;

export const ThemeProvider = ({ children, ...props }: AppThemeProviderProps) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
};

