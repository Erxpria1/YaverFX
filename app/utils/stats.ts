export const POINTS_PER_LEVEL = 100;

export const COMPANIONS = [
  { level: 1, name: "Çırak Yaver", image: "/characters/char_0.png" },
  { level: 2, name: "Gözlemci", image: "/characters/char_1.png" },
  { level: 3, name: "Odak Ustası", image: "/characters/char_2.png" },
  { level: 4, name: "Zaman Bükücü", image: "/characters/char_3.png" },
  { level: 5, name: "Elit Yaver", image: "/characters/char_4.png" },
  { level: 6, name: "Efsanevi", image: "/characters/char_5.png" },
];

export function calculateLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

export function getCompanionForLevel(level: number) {
  return COMPANIONS.reduce((prev, current) => 
    (level >= current.level ? current : prev), COMPANIONS[0]
  );
}

export interface StoredStats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}
