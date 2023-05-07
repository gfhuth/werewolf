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

    const isPlayerTargeted = (player: string): boolean => !!ratifications.find((r) => r.target === player);

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
        if (isPlayerTargeted(data.playerVoted)) {
            // Update counts
            // TODO
        } else {
            // Add new target
            setRatifications([
                ...ratifications,
                {
                    target: data.playerVoted,
                    countForKilling: 1,
                    countForLiving: 0
                }
            ]);
        }
    };

    useEffect(() => {
        gameContext.registerEventHandler("ASK_RATIFICATION", addTarget);
    }, []);

    return <VoteContext.Provider value={{ active, type, ratifications, vote }}>{props.children}</VoteContext.Provider>;
}
