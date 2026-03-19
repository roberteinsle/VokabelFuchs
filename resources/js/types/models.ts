export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Child {
    id: number;
    parent_id: number;
    name: string;
    language_pair: string;
    media_time_balance_gaming: number;
    media_time_balance_youtube: number;
    is_active: boolean;
    tags_count?: number;
    current_streak?: number;
    last_trained_date?: string | null;
}

export interface Tag {
    id: number;
    name: string;
    vocabularies_count?: number;
}

export interface VocabularyList {
    id: number;
    parent_id: number;
    name: string;
    language_pair: string;
    description: string | null;
    vocabularies_count?: number;
}

export interface Vocabulary {
    id: number;
    parent_id: number;
    vocabulary_list_id: number | null;
    word_de: string;
    word_en: string | null;
    word_fr: string | null;
    sentence_de: string | null;
    sentence_en: string | null;
    sentence_fr: string | null;
    image_path: string | null;
    is_active: boolean;
    tags: Tag[];
}

export interface FlashCard {
    id: number;
    vocabulary_id: number;
    child_id: number;
    drawer: number;
    next_review_date: string;
    streak_count: number;
    vocabulary?: Vocabulary;
}

export interface TrainingQuestion {
    flash_card_id: number;
    mode: 'multiple_choice' | 'free_text';
    source_lang: string;
    target_lang: string;
    prompt: string;
    sentence?: string;
    image_path?: string;
    drawer: number;
    options?: string[]; // multiple choice
}

export interface TrainingSession {
    id: number;
    training_mode: string;
    started_at: string;
    cards_correct: number;
    cards_wrong: number;
    media_time_earned_gaming?: number;
    media_time_earned_youtube?: number;
    duration_minutes?: number;
}

export interface MediaTimeLog {
    id: number;
    type: 'gaming' | 'youtube';
    action: 'earned' | 'spent';
    minutes: number;
    balance_after: number;
    created_at: string;
}

export interface MediaTimeRule {
    minutes_learn_per_gaming: number;
    minutes_gaming_per_learn: number;
    minutes_learn_per_youtube: number;
    minutes_youtube_per_learn: number;
    daily_cap_gaming: number;
    daily_cap_youtube: number;
    min_learn_for_unlock: number;
    base_minutes_per_correct: number;
    multiplier_multiple_choice: number;
    multiplier_free_text: number;
    multiplier_dictation: number;
    gaming_exchange_rate: number;
    youtube_exchange_rate: number;
    streak_bonus_days: number;
    streak_bonus_minutes: number;
}

export interface DrawerStats {
    [drawer: number]: number;
}
