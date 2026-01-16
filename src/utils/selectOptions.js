import { UI_TEXT } from "@/lib/uiStrings";

export const noOfQuestionsOptions = [
  { label: "Zero", value: 0 },
  { label: "One", value: 1 },
  { label: "Two", value: 2 },
  { label: "Three", value: 3 },
  { label: "Four", value: 4 },
  { label: "Five", value: 5 },
  { label: "Six", value: 6 },
];

export const typeOfQuestionsOptions = [
  { label: "Automated Questions", value: 0 },
  { label: "Manual Questions", value: 1 },
  { label: "1:1 Manual and Automated Questions", value: 2 },
];

export const customFooterTemplateOptions = [
  {
    label: UI_TEXT.personalization.footer.customFooter.noFooter,
    value: 0,
  },
  {
    label: UI_TEXT.personalization.footer.customFooter.linkText,
    value: 1,
  },
];
