export type StudentProfile = {
  name: string;
  country: string;
  grade: number;
  marks: number;
  subjects: string[];
  interests: string[];
  budgetAnnual: number;
  currency: string;
  preferredCountries: string[];
  locationPreference: "home" | "abroad" | "flexible";
  financialAid: boolean;
};

export type Pathway = {
  id: string;
  title: string;
  route: string;
  countries: string[];
  durationYears: number;
  estimatedCost: string;
  admission: string[];
  careers: string[];
  fit: number;
  rationale: string[];
  assumptions: string[];
  uncertainty: string[];
};

export type DecisionMatrix = {
  criteria: string[];
  rows: { pathway: string; values: Record<string, string> }[];
};