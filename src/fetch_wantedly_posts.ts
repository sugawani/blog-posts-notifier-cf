import { Post, WantedlyPost } from "./types/wantedly_post";
import { cdate } from "cdate";

const cdateJST = cdate().tz("Asia/Tokyo").cdateFn();

const extractLastMonthPosts = (posts: Post[]): Post[] => {
    const lastMonth = cdateJST().add(-1, "month");
    const firstDayOfLastMonth = lastMonth.startOf("month");
    const lastDayOfLastMonth = lastMonth.endOf("month");

    return posts.filter(post => {
        const publishedAt = cdateJST(post.published_at);
        return firstDayOfLastMonth <= publishedAt && publishedAt <= lastDayOfLastMonth
    })
}

const makeMessage = (posts: Post[]): string => {
    if (posts.length === 0) {
        return "先月のWantedlyブログ投稿はありませんでした… :cry:";
    }
    return posts.reduce((message: string, post) => {
        return message += `・ ${post.title} | https://www.wantedly.com${post.post_path} | ${cdateJST(post.published_at).format("YYYY-MM-DD")}\n`;
    }, "先月のWantedlyブログ投稿です\n");
}

const parseHTML = (htmlString: string): Post[] => {
    const regex = /<script data-placeholder-key="wtd-ssr-placeholder">(.*?)<\/script>/;
    const match = htmlString.match(regex);
    if (!match) {
        throw "failed to parse wantedly html string";
    }
    const placeholderData = match[1];
    // 頭に // が入っていてパースできないので取り除く
    const parsedData = placeholderData.replace("// ", "");
    const wantedlyPost = JSON.parse(parsedData) as WantedlyPost;
    return extractPosts(wantedlyPost);
}

const extractPosts = (wantedlyPost: WantedlyPost): Post[] => {
    // body の下のキーは変動するので無理やり取り出す
    const articleKey = Object.keys(wantedlyPost.body)[0] as string;
    return wantedlyPost["body"][articleKey]["posts"];
}

export const fetchWantedlyPostMessage = async (companyID: string): Promise<string> => {
    const url = `https://www.wantedly.com/companies/${companyID}/stories`;
    const response = await fetch(url);
    if (!response.ok) {
        throw `failed to fetch posts err: ${response.body}`;
    }
    const htmlString = await response.text();
    const posts = parseHTML(htmlString);
    const lastMonthArticles = extractLastMonthPosts(posts);
    return makeMessage(lastMonthArticles);
}