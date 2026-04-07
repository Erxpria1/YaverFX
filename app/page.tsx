import PomodoroTimer from "./components/PomodoroTimer";
import TabLayout from "./components/TabLayout";
import ThemeSelector from "./components/ThemeSelector";

export default function Home() {
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--theme-bg)" }}>
      <ThemeSelector />
      <main className="flex-1 flex items-center justify-center">
        <PomodoroTimer />
      </main>
      <TabLayout />
    </div>
  );
}
