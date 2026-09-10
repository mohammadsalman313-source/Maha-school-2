/**
 * Maharashtra PM-POSHAN (शालेय पोषण आहार) Calculation Engine
 * Governed by Maharashtra Prathmik Shikshan Parishad / Education Department norms
 */

export interface PoshanCalculationInput {
  primaryPresent: number; // Class 1 to 5 count
  upperPrimaryPresent: number; // Class 6 to 8 count
  primaryRate?: number; // default ₹5.45
  upperPrimaryRate?: number; // default ₹8.17
}

export interface PoshanCalculationResult {
  primaryPresent: number;
  upperPrimaryPresent: number;
  totalPresent: number;
  riceKg: number;
  pulsesKg: number;
  oilKg: number;
  veggiesKg: number;
  spicesKg: number;
  cookingCostRs: number;
  caloriesKcal: number;
  proteinGrams: number;
  supplementaryCount: number;
}

export const MAHA_POSHAN_NORMS = {
  primary: {
    riceGrams: 100,
    pulsesGrams: 20,
    oilGrams: 5,
    veggiesGrams: 50,
    spicesGrams: 2,
    cookingCost: 5.45,
    calories: 450,
    protein: 12,
  },
  upperPrimary: {
    riceGrams: 150,
    pulsesGrams: 30,
    oilGrams: 7.5,
    veggiesGrams: 75,
    spicesGrams: 3,
    cookingCost: 8.17,
    calories: 700,
    protein: 20,
  },
};

export const MAHA_WEEKLY_MENU = [
  {
    dayIndex: 1, // Monday
    dayNameMr: 'सोमवार',
    dayNameEn: 'Monday',
    menuMr: 'मटकी उसळ व भात / वरण भात',
    menuEn: 'Matki Usal & Steamed Rice / Dal Rice',
    supplementaryMr: 'नियमित आहार',
    supplementaryEn: 'Regular Diet',
    recommendedPulse: 'मटकी / तूर डाळ',
  },
  {
    dayIndex: 2, // Tuesday
    dayNameMr: 'मंगळवार',
    dayNameEn: 'Tuesday',
    menuMr: 'चवळी उसळ व भात / व्हेज पुलाव',
    menuEn: 'Chawli Usal & Rice / Veg Pulao',
    supplementaryMr: 'नियमित आहार',
    supplementaryEn: 'Regular Diet',
    recommendedPulse: 'चवळी / मूग',
  },
  {
    dayIndex: 3, // Wednesday
    dayNameMr: 'बुधवार',
    dayNameEn: 'Wednesday',
    menuMr: 'मूग डाळ पौष्टिक खिचडी व कढी',
    menuEn: 'Nutritious Moong Dal Khichdi & Kadhi',
    supplementaryMr: 'नियमित आहार',
    supplementaryEn: 'Regular Diet',
    recommendedPulse: 'मूग डाळ',
  },
  {
    dayIndex: 4, // Thursday
    dayNameMr: 'गुरुवार',
    dayNameEn: 'Thursday',
    menuMr: 'हरभरा (चना) उसळ व भात',
    menuEn: 'Chana Usal & Steamed Rice',
    supplementaryMr: 'नियमित आहार',
    supplementaryEn: 'Regular Diet',
    recommendedPulse: 'हरभरा (चना)',
  },
  {
    dayIndex: 5, // Friday
    dayNameMr: 'शुक्रवार',
    dayNameEn: 'Friday',
    menuMr: 'सोयाबीन भाजी पुलाव / वाटाणा उसळ भात',
    menuEn: 'Soybean Veggie Pulao / Green Peas Usal',
    supplementaryMr: 'नियमित आहार',
    supplementaryEn: 'Regular Diet',
    recommendedPulse: 'सोयाबीन वडी / वाटाणा',
  },
  {
    dayIndex: 6, // Saturday
    dayNameMr: 'शनिवार',
    dayNameEn: 'Saturday',
    menuMr: 'मसाले भात + अंडी / केळी / चिक्की वाटप',
    menuEn: 'Masale Bhat + Boiled Egg / Banana / Chikki',
    supplementaryMr: 'उकडलेले अंडे / केळे / शेंगदाणा चिक्की',
    supplementaryEn: 'Boiled Egg / Banana / Peanut Chikki',
    recommendedPulse: 'मूग / तूर डाळ',
  },
  {
    dayIndex: 0, // Sunday
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    menuMr: 'शाळेस साप्ताहिक सुट्टी',
    menuEn: 'Weekly School Holiday',
    supplementaryMr: '-',
    supplementaryEn: '-',
    recommendedPulse: '-',
  },
];

export function calculatePoshanAahar(input: PoshanCalculationInput): PoshanCalculationResult {
  const pNorm = MAHA_POSHAN_NORMS.primary;
  const uNorm = MAHA_POSHAN_NORMS.upperPrimary;

  const pCount = Math.max(0, input.primaryPresent || 0);
  const uCount = Math.max(0, input.upperPrimaryPresent || 0);
  const total = pCount + uCount;

  const pRate = input.primaryRate ?? pNorm.cookingCost;
  const uRate = input.upperPrimaryRate ?? uNorm.cookingCost;

  // Grams to Kilograms: / 1000
  const riceKg = (pCount * pNorm.riceGrams + uCount * uNorm.riceGrams) / 1000;
  const pulsesKg = (pCount * pNorm.pulsesGrams + uCount * uNorm.pulsesGrams) / 1000;
  const oilKg = (pCount * pNorm.oilGrams + uCount * uNorm.oilGrams) / 1000;
  const veggiesKg = (pCount * pNorm.veggiesGrams + uCount * uNorm.veggiesGrams) / 1000;
  const spicesKg = (pCount * pNorm.spicesGrams + uCount * uNorm.spicesGrams) / 1000;

  const cookingCostRs = pCount * pRate + uCount * uRate;
  const caloriesKcal = pCount * pNorm.calories + uCount * uNorm.calories;
  const proteinGrams = pCount * pNorm.protein + uCount * uNorm.protein;

  return {
    primaryPresent: pCount,
    upperPrimaryPresent: uCount,
    totalPresent: total,
    riceKg: Number(riceKg.toFixed(3)),
    pulsesKg: Number(pulsesKg.toFixed(3)),
    oilKg: Number(oilKg.toFixed(3)),
    veggiesKg: Number(veggiesKg.toFixed(3)),
    spicesKg: Number(spicesKg.toFixed(3)),
    cookingCostRs: Number(cookingCostRs.toFixed(2)),
    caloriesKcal,
    proteinGrams: Number(proteinGrams.toFixed(1)),
    supplementaryCount: total,
  };
}
