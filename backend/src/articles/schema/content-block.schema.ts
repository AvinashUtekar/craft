import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Document } from "mongoose";
import { IImage } from "../../users/schema";
import { createId } from "../../utils/ids";

// ====================================
// Content block types
// ====================================

type Paragraph = {
    type: "paragraph";
    value: { text: string };
};

type Heading = {
    type: "heading";
    value: { text: string; variant: "h1" | "h2" | "h3" };
};

type Divider = {
    type: "divider";
    value: Record<string, never>;
};

type Image = {
    type: "image";
    value: IImage & { caption?: string };
};

export type Block = Paragraph | Heading | Divider | Image;
export type BlockId = string;
export type ContentBlockType = Block & { blockId: BlockId };

interface IContentBlock {
    blockId: BlockId;
    type: Block["type"];
    value: Block["value"];
}

// ====================================
// Content block model
// ====================================

export const blocks: Block["type"][] = [
    "paragraph",
    "heading",
    "divider",
    "image",
] as const;

@Schema({ _id: false, timestamps: true })
export class ContentBlock extends Document implements IContentBlock {
    @Prop({
        type: String,
        required: true,
        unique: true,
        default: () => createId("blk"),
        immutable: true,
    })
    blockId: BlockId;

    @Prop({ type: String, required: true, enum: blocks })
    type: Block["type"];

    @Prop({ type: SchemaTypes.Map, required: true })
    value: Block["value"];
}

export const ContentBlockSchema = SchemaFactory.createForClass(ContentBlock);