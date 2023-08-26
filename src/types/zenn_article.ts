export interface ZennArticle {
    articles: Article[];
    next_page: null;
}

export interface Article {
    id: number;
    post_type: string;
    title: string;
    slug: string;
    comments_count: number;
    liked_count: number;
    body_letters_count: number;
    article_type: string;
    emoji: string;
    is_suspending_private: boolean;
    published_at: Date;
    body_updated_at: Date;
    source_repo_updated_at: Date | null;
    pinned: boolean;
    path: string;
    user: User;
    publication: Publication;
}

export interface Publication {
    id: number;
    name: string;
    avatar_small_url: string;
    display_name: string;
    beta_stats: boolean;
    pro: boolean;
    beta_pro_entry: boolean;
    avatar_registered: boolean;
}

export interface User {
    id: number;
    username: string;
    name: string;
    avatar_small_url: string;
}
