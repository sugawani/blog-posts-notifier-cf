export interface WantedlyPost {
    body: Body;
}

export interface Body {
    [key: string]: BodyDetail;
}

export interface BodyDetail {
    posts: Post[];
}

export interface Post {
    post_path: string;
    title: string;
    published_at: Date;
}
