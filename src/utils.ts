export function pluralizeItems(count: number): string {
  return count === 1 ? "item" : "items";
}

export const availableLanguages = [
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "EN-GB",
  "EN-US",
  "EN",
  "ES",
  "ET",
  "FI",
  "FR",
  "HU",
  "IT",
  "JA",
  "LT",
  "LV",
  "NL",
  "PL",
  "PT-PT",
  "PT-BR",
  "PT",
  "RO",
  "RU",
  "SK",
  "SL",
  "SV",
  "ZH",
];

export function getFullLanguagesNameFromShortHandle(language: string): string {
  switch (language) {
    case "EN":
      return "English";
    case "BG":
      return "Bulgarian";
    case "CS":
      return "Czech";
    case "DA":
      return "Danish";
    case "DE":
      return "German";
    case "EL":
      return "Greek";
    case "EN-GB":
      return "English (UK)";
    case "EN-US":
      return "English (US)";
    case "ES":
      return "Spanish";
    case "ET":
      return "Estonian";
    case "FI":
      return "Finnish";
    case "FR":
      return "French";
    case "HU":
      return "Hungarian";
    case "IT":
      return "Italian";
    case "JA":
      return "Japanese";
    case "LT":
      return "Lithuanian";
    case "LV":
      return "Latvian";
    case "NL":
      return "Dutch";
    case "PL":
      return "Polish";
    case "PT-PT":
      return "Portuguese (Portugal)";
    case "PT-BR":
      return "Portuguese (Brazil)";
    case "PT":
      return "Portuguese";
    case "RO":
      return "Romanian";
    case "RU":
      return "Russian";
    case "SK":
      return "Slovak";
    case "SL":
      return "Slovenian";
    case "SV":
      return "Swedish";
    case "ZH":
      return "Chinese";
    default:
      return "English";
  }
}
