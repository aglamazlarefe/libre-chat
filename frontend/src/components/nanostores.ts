import {atom} from 'nanostores';

interface ChatConfig {
  info: any;
  llm: any;
  vector: any;
}

// api: process.env.PUBLIC_API_URL ? process.env.PUBLIC_API_URL : 'https://chat.semanticscience.org'
export const $chatConfig = atom<ChatConfig>({
  info: {
    title: "Medical LLM Chat",
    description: "Open source medical LLM chatbot.",
    repository_url: "https://github.com/aglamazlarefe/libre-chat",
    examples: [
  "Diyabetin yaygın belirtileri nelerdir?",
  "Tip 1 ve Tip 2 diyabet arasındaki fark nedir?",
  "Yüksek tansiyon değerlerini nasıl yorumlamalıyım?",
  "Obezite hastası için hangi yaşam tarzı değişiklikleri önerilir?",
  "İbuprofenin yaygın yan etkileri nelerdir?",
  "50 yaş üstü yetişkinler için hangi aşılar önerilir?",
  "Nefes darlığının olası nedenleri nelerdir?"]
  },
  llm: {},
  vector: {},
});

export function setConfig(chatConfig: ChatConfig) {
  $chatConfig.set(chatConfig);
}

export const apiUrl = import.meta.env.PUBLIC_API_URL || window.origin;
