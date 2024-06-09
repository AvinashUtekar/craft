import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "./schema";
import { Model, Types } from "mongoose";

@Injectable({})
export class ArticleRepository {
    constructor(@InjectModel(Article.name) private model: Model<Article>) {}

    /** Initialize an article by an author. */
    async initArticle(authorId: Types.ObjectId) {
        return await this.model.create({
            authorIds: [authorId],
            lastUpdatedAt: new Date(),
        });
    }

    async exists(articleId: string) {
        return await this.model.exists({ articleId });
    }

    async checkArticleExists(authorId: Types.ObjectId, articleId: string) {
        return await this.model.findOne(
            { articleId, authorIds: authorId },
            { authorIds: 1 },
        );
    }

    async getArticleById(articleId: string) {
        return await this.model
            .findOne({ articleId })
            .populate("authorIds", "username profilePic userId");
    }

    async updateOne(articleId: string, update: Partial<Article>) {
        return await this.model.updateOne(
            { articleId },
            { $set: update },
            { runValidators: true },
        );
    }

    async getUserPublishedArticles(authorId: Types.ObjectId) {
        return await this.model
            .find({ isPublic: true, authorIds: authorId })
            .populate("authorIds", "username profilePic userId");
    }

    async getUserDraftArticles(authorId: Types.ObjectId) {
        return await this.model
            .find({ isPublic: false, authorIds: authorId })
            .populate("authorIds", "username profilePic userId");
    }
}
