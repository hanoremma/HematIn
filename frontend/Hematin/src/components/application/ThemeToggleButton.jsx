import { useEffect, useState } from "react";

const ThemeToggle = () => {

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("theme") === "dark"
    );

  useEffect(() => {

    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

  }, [darkMode]);

  const toggleTheme = () => {

    const newTheme = !darkMode;

    setDarkMode(newTheme);

    localStorage.setItem(
      "theme",
      newTheme ? "dark" : "light"
    );

  };

  return (

    <button
      className="theme-toggle"
      onClick={toggleTheme}
    >

      <i
        className={
          darkMode
            ? "bi bi-sun-fill"
            : "bi bi-moon-fill"
        }
      />

    </button>

  );

};

export default ThemeToggle;