import { ZennArticle, Article, User } from "./types/zenn_article";
import { cdate } from "cdate";

const cdateJST = cdate().tz("Asia/Tokyo").cdateFn();

interface UserArticles {
    userName: User["name"];
    userID: User["id"];
    articles: Article[];
}

interface UserBinding {
    id: number;
    name: string;
}

const extractLastMonthArticles = (articles: Article[]): Article[] => {
    const lastMonth = cdateJST().add(-1, "month");
    const firstDayOfLastMonth = lastMonth.startOf("month");
    const lastDayOfLastMonth = lastMonth.endOf("month");

    return articles.filter(article => {
        const publishedAt = cdateJST(article.published_at);
        return firstDayOfLastMonth <= publishedAt && publishedAt <= lastDayOfLastMonth
    })
}

const reduceUserArticles = (articles: Article[], userBindings: UserBinding[]): UserArticles[] => {
    return articles.reduce(
        (acc: UserArticles[], article) => {
            const foundUser = acc.find((user) => user.userID === article.user.id);
            if (foundUser) {
                foundUser.articles.push(article);
                foundUser.articles.sort((a, b) =>
                    a.published_at > b.published_at ? 1 : -1
                );
            } else {
                const userName = userBindings.find(ub => ub.id === article.user.id)?.name ?? article.user.name
                acc.push({
                    userID: article.user.id,
                    userName: userName,
                    articles: [article],
                });
            }
            return acc;
        },
        [],
    );
}

function makeMessage(userArticles: UserArticles[]): string {
    if (userArticles.length === 0) {
        return "先月のZennブログ投稿はありませんでした… :cry:";
    }
    return userArticles.reduce((message: string, userArticle, i) => {
        message += userArticle.articles.reduce((m: string, article) => {
            return m += `• ${cdateJST(article.published_at).format("YYYY-MM-DD")} | <https://zenn.dev${article.path}|${article.title}>\n`;
        }, `${userArticle.userName} さんの先月のZennブログ投稿です 投稿数: ${userArticle.articles.length}件\n`);
        if (userArticles.length - 1 !== i) {
            message += `\n`;
        }
        return message;
    }, "");
}

const fetchUserBindings = async (DB: D1Database): Promise<UserBinding[]> => {
    const { results } = await DB.prepare("SELECT * FROM user_bindings").all();
    return results.map((result) => {
        return {
            id: result.id,
            name: result.name,
        } as UserBinding;
    });
}

export const fetchZennArticleMessage = async (publicationName: string, DB: D1Database): Promise<string> => {
    const url = `https://zenn.dev/api/articles?publication_name=${publicationName}&count=20&order=latest`;
    const response = await fetch(url);
    if (!response.ok) {
        throw `failed to fetch articles err: ${response.body}`;
    }
    const data: ZennArticle = await response.json();
    const lastMonthArticles = extractLastMonthArticles(data.articles);
    const userBindings = await fetchUserBindings(DB);
    const userArticles = reduceUserArticles(lastMonthArticles, userBindings);
    return makeMessage(userArticles);
}