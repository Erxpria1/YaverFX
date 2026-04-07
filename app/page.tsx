import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center px-4 sm:px-8 md:px-16">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 mb-6 sm:mb-8">
          Pomodoro Sayacı
        </h1>
        <PomodoroTimer />
        
        <div className="w-full mt-10 sm:mt-12 pt-8 border-t border-zinc-800">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-100 mb-4 sm:mb-6">
            Görevler
          </h2>
          <TaskList />
        </div>

        <div className="w-full mt-10 sm:mt-12 pt-8 border-t border-zinc-800">
          <AmbientSounds />
        </div>

        <div className="w-full mt-10 sm:mt-12 pt-8 border-t border-zinc-800">
          <SiteBlocker />
        </div>
      </main>
    </div>
  );
}
