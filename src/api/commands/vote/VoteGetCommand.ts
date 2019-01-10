// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteService } from '../../services/VoteService';
import { ProfileService } from '../../services/ProfileService';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Vote } from '../../models/Vote';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import * as resources from 'resources';

export class VoteGetCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Vote>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] profileId
     * [1] proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Vote>> {
        const proposalHash = data.params.shift();
        const proposal = await this.proposalService.findOneByHash(proposalHash);

        if (data.params.length > 0) {
            const voterAddress = data.params.shift();
            const vote: any = await this.voteService.findOneByVoterAndProposalId(voterAddress, proposal.id);
            return vote as Bookshelf.Collection<Vote>;
        } else {
            const votes = await this.voteService.findAllFromMeByProposalId(proposal.id);
            return votes.fetch();
        }
    }

    /**
     * data.params[]:
     *  [0]: profileHash
     *  [1]: voterAddress
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Expected proposalHash but received no params.');
        }

        // Get proposal id from proposal hash
        const proposalHash = data.params[0];
        if (!proposalHash || typeof proposalHash !== 'string') {
            throw new MessageException(`Invalid proposalHash = ${proposalHash}, expected String.`);
        }
        const proposal = await this.proposalService.findOneByHash(proposalHash);
        if (!proposal) {
            throw new MessageException(`Proposal with the hash = ${proposalHash} doesn't seem to exist.`);
        } else if (!proposal.id) {
            throw new MessageException(`Proposal with the hash = ${proposalHash} doesn't seem to have an ID; something is terribly wrong.`);
        }

        if (data.params.length >= 2) {
            const voterAddress = data.params[1];
            if (!voterAddress || typeof voterAddress !== 'string') {
                throw new MessageException(`Invalid voterAddress = ${voterAddress}, expected String.`);
            }
            const vote = await this.voteService.findOneByVoterAndProposalId(voterAddress, proposal.id);
            if (!vote) {
                throw new MessageException('User has not voted on proposal = ${proposalHash} yet.');
            }
        }
        return data;
    }

    public help(): string {
        return this.getName() + ' <proposalHash> [<votingAddress>]';
    }

    public description(): string {
        return 'Get votes on a given proposal by a given submitter. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
