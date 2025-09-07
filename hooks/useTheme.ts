// hooks/useTheme.ts
import { useEffect, useState } from "preact/hooks";

export function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(()=> {
        const saveTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (saveTheme) setTheme(saveTheme);
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === "light" ? "dark": "light");

    return { theme, toggleTheme };
}