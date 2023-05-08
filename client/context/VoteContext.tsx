import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContext";
import Logger from "../utils/Logger";

export enum VoteType {
    VOTE_WEREWOLF,
    VOTE_VILLAGE,
}

export type Ratification = {
    target: string;
    countForKilling: number;
    countForLiving: number;
};

const LOGGER = new Logger("VOTE");

export const VoteContext = React.createContext<{
    active: boolean;
    type: VoteType;
    ratifications: Array<Ratification>;
    vote:(player: string, shouldKill: boolean) => void;
        }>({
            active: false,
            type: VoteType.VOTE_VILLAGE,
            ratifications: [],
            vote: () => null
        });

export function VoteProvider(props: { children: React.ReactNode }): React.ReactElement {
    const [active, setActive] = useState(false);
    const [type, setType] = useState<VoteType>(VoteType.VOTE_VILLAGE);
    const [ratifications, setRatifications] = useState<Array<Ratification>>([]);

    const gameContext = useContext(GameContext);

    const isPlayerTargeted = (player: string): boolean => ratifications.find((r) => r.target === player) != undefined;

    const vote = (player: string, shouldKill: boolean): void => {
        if (isPlayerTargeted(player)) {
            // send ratification
            gameContext.sendJsonMessage("RESPONSE_RATIFICATION", {
                vote_type: type,
                playerVoted: player,
                ratification: shouldKill
            });
        } else {
            // propose new vote
            if (!shouldKill) {
                LOGGER.log(`Error: trying to send a living vote for someone not targetted`);
                return;
            }
            gameContext.sendJsonMessage("VOTE_SENT", {
                vote_type: type,
                playerVoted: player
            });
        }
    };

    const addTarget = (data: { vote_type: VoteType; playerVoted: string }): void => {
        setRatifications((ratifs) => [
            ...ratifs.map((r) => ({ ...r })),
            {
                target: data.playerVoted,
                countForKilling: 1,
                countForLiving: 0
            }
        ]);
        LOGGER.log(`Vote ratification added for ${data.playerVoted}`);
    };

    const updateTarget = (data: { nbInvalidation: number; nbValidation: number; playerVoted: string; vote_type: VoteType }): void => {
        const target = data.playerVoted;
        setRatifications((ratifs) => [
            ...ratifs.filter((r) => r.target !== target).map((r) => ({ ...r })),
            {
                target: target,
                countForKilling: data.nbValidation,
                countForLiving: data.nbInvalidation
            }
        ]);
        LOGGER.log(`Vote ratification updated for ${target}`);
    };

    const onVoteInfo = (data: { [key: string]: { nbValidation: number; nbInvalidation: number } }): void => {
        setRatifications(
            Object.keys(data).map((target) => ({
                target: target,
                countForKilling: data[target].nbValidation,
                countForLiving: data[target].nbInvalidation
            }))
        );
    };

    useEffect(() => {
        gameContext.registerEventHandler("ASK_RATIFICATION", addTarget);
        gameContext.registerEventHandler("GET_ALL_INFO_VOTE", onVoteInfo);
        gameContext.registerEventHandler("UPDATE_PROPOSITION", updateTarget);
    }, []);

    return <VoteContext.Provider value={{ active, type, ratifications, vote }}>{props.children}</VoteContext.Provider>;
}
