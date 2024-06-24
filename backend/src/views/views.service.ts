import { BadRequestException, Injectable } from "@nestjs/common";
import { ViewsRepsitory } from "./views.repository";
import { Types } from "mongoose";
import { UpdateReadTimeDto } from "./dto";

@Injectable()
export class ViewsService {
    constructor(private repo: ViewsRepsitory) {}

    async addViewForArticle(
        userId: Types.ObjectId,
        articleId: Types.ObjectId,
        ipAddress: string,
    ) {
        const exists = await this.repo.exsits({ articleId, userId, ipAddress });
        if (exists) {
            throw new BadRequestException("View already exists");
        }

        const view = await this.repo.create({ articleId, userId });
        return view;
    }

    async updateReadTimeForArticle(
        viewId: string,
        readTimeInMs: number,
        userId: Types.ObjectId,
        articleId: Types.ObjectId,
    ) {
        const view = await this.repo.findOne({
            _id: viewId,
            userId,
            articleId,
        });
        if (!view) {
            throw new BadRequestException("View not found");
        }

        const viewCreatedAt: Date = (view as any).createdAt;
        const now = new Date().getTime();
        const diff = now - viewCreatedAt.getTime();

        // if diff is less than 3 hours and is more than read time then
        // we're sure that could be a legit view
        if (diff > readTimeInMs && diff < 1000 * 60 * 60 * 3) {
            await this.repo.updateOne(
                { _id: view._id },
                { $set: { readTimeInMs } },
            );
        }
    }
}