export type CategoryId = 'history' | 'complex' | 'love' | 'tense' | 'random';

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  description: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    border: string;
    gradientFrom: string;
    gradientTo: string;
    button: string;
    buttonHover: string;
    chatBubbleUser: string;
    chatBubbleAi: string;
  };
  iconName: string;
  promptTopic: string;
}

export interface GeneratedTopic {
  id: string;
  categoryId: CategoryId;
  content: string;
  groundingSources?: Array<{
    title?: string;
    uri: string;
  }>;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
