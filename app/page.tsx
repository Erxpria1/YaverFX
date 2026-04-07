import PomodoroTimer from "./components/PomodoroTimer";
import TabLayout from "./components/TabLayout";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 font-sans min-h-screen pb-20">
      <main className="flex flex-1 w-full max-w-md flex-col items-center justify-center px-4">
        <PomodoroTimer />
      </main>
      <TabLayout />
    </div>
  );
}
