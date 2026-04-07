import PomodoroTimer from "./components/PomodoroTimer";
import TabLayout from "./components/TabLayout";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start bg-zinc-950 font-sans min-h-screen pb-20 pt-[env(safe-area-inset-top,2rem)]">
      <main className="flex flex-1 w-full max-w-md flex-col items-center justify-start px-4 pt-4 pb-8 overflow-y-auto overflow-x-hidden no-scrollbar">
        <PomodoroTimer />
      </main>
      <TabLayout />
    </div>
  );
}
