export type BodyProfile = {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  activityLevel: "sedentary" | "light" | "moderate" | "heavy" | "very_heavy";
  goalWeight: number;
  goalBodyFat: number;
};

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "座りがち（運動ほぼなし）",
  light: "軽い運動（週1〜2回）",
  moderate: "中程度の運動（週3〜5回）",
  heavy: "激しい運動（毎日）",
  very_heavy: "非常に激しい（1日2回以上）",
};

const MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  very_heavy: 1.9,
};

export function calculateNutritionTargets(p: BodyProfile): NutritionTargets {
  const bmr = Math.round(
    p.gender === "male"
      ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
      : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
  );
  const tdee = Math.round(bmr * (MULTIPLIERS[p.activityLevel] ?? 1.55));
  const isGaining = p.goalWeight > p.weight;
  const targetCalories = isGaining
    ? tdee + 300
    : Math.max(tdee - 400, bmr + 200);
  const protein = Math.round(p.weight * 2.2);
  const fat = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.round(
    Math.max(targetCalories - protein * 4 - fat * 9, 200) / 4
  );
  return { bmr, tdee, targetCalories, protein, carbs, fat };
}
