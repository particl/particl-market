// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentMessageType } from '../enums/CommentMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { CommentMessageInterface } from './CommentMessageInterface';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CommentMessage extends MessageBody implements CommentMessageInterface {

    @IsNotEmpty()
    @IsEnum(CommentMessageType)
    public type: CommentMessageType;

    @IsNotEmpty()
    public sender: string;

    @IsNotEmpty()
    public marketHash: string;

    @IsNotEmpty()
    public target: string;

    @IsNotEmpty()
    public parentHash: string;

    public message: string;

    @IsNotEmpty()
    public signature: string;
}
