import axios from 'axios';

export type SupportedLanguages = 'BG'
    | 'CS'
    | 'DA'
    | 'DE'
    | 'EL'
    | 'EN-GB'
    | 'EN-US'
    | 'EN'
    | 'ES'
    | 'ET'
    | 'FI'
    | 'FR'
    | 'HU'
    | 'IT'
    | 'JA'
    | 'LT'
    | 'LV'
    | 'NL'
    | 'PL'
    | 'PT-PT'
    | 'PT-BR'
    | 'PT'
    | 'RO'
    | 'RU'
    | 'SK'
    | 'SL'
    | 'SV'
    | 'ZH';

export default class TranslationAPI {
    constructor(private readonly authKey: string) {
    }

    async translate(text: string, targetLanguage: SupportedLanguages) {
        const fullUrl = `https://3c4bw77amzjsqi5jcdm7marywq0difgh.lambda-url.eu-central-1.on.aws?auth_key=${this.authKey}&text=${text}&target_lang=${targetLanguage}`;
        const { data } = await axios.get(fullUrl);

        return data;
    }
}