import type { MessageLanguageHint } from "@/types/messages";

export const messageTestExamples = [
  "prix",
  "price?",
  "chhal taman",
  "wach kayn stock",
  "fin kayn lmagazin",
  "delivery dispo?",
  "3ndkom livraison?",
  "wa9tاش kat7ello?",
  "horaire svp",
] as const;

export const messageLanguageHintLabels: Record<MessageLanguageHint, string> = {
  darija: "Darija signal",
  french: "French signal",
  mixed: "Mixed signal",
  neutral: "Neutral signal",
};
