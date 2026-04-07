import PomodoroTimer from "./components/PomodoroTimer";
import TabLayout from "./components/TabLayout";
import ThemeSelector from "./components/ThemeSelector";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start font-sans min-h-screen pb-20 pt-[env(safe-area-inset-top,2rem)] bg-[var(--theme-bg)] text-[var(--theme-text)]">
      {/* Theme Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSelector />
      </div>
      
      <main className="flex flex-1 w-full max-w-md flex-col items-center justify-start px-4 pt-4 pb-8 overflow-y-auto overflow-x-hidden no-scrollbar">
        <PomodoroTimer />
      </main>
      <TabLayout />
    </div>
  );
}
