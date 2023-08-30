import { ZennArticle, Article, User } from "./types/zenn_article";
import { cdate } from "cdate";

const cdateJST = cdate().tz("Asia/Tokyo").cdateFn();

interface UserArticles {
    userName: User["name"];
    userID: User["id"];
    articles: Article[];
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

const reduceUserArticles = (articles: Article[]): UserArticles[] => {
    return articles.reduce(
        (acc: UserArticles[], article) => {
            const foundUser = acc.find((user) => user.userID === article.user.id);
            if (foundUser) {
                foundUser.articles.push(article);
                foundUser.articles.sort((a, b) =>
                    a.published_at > b.published_at ? 1 : -1
                );
            } else {
                acc.push({
                    userID: article.user.id,
                    userName: article.user.name,
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
            return m += `・ ${article.title} | https://zenn.dev${article.path} | ${cdateJST(article.published_at).format("YYYY-MM-DD")}\n`;
        }, `${userArticle.userName} さんの先月のZennブログ投稿です\n`);
        if (userArticles.length - 1 !== i) {
            message += `\n`;
        }
        return message;
    }, "");
}

export const fetchZennArticleMessage = async (publicationName: string): Promise<string> => {
    const url = `https://zenn.dev/api/articles?publication_name=${publicationName}&count=20&order=latest`;
    const response = await fetch(url);
    if (!response.ok) {
        throw `failed to fetch articles err: ${response.body}`;
    }
    const data: ZennArticle = await response.json();
    const lastMonthArticles = extractLastMonthArticles(data.articles);
    const userArticles = reduceUserArticles(lastMonthArticles);
    return makeMessage(userArticles);
}