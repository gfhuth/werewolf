import { Actionsheet } from "native-base";
import { GameContext, Power } from "../../../context/GameContext";
import { PowerContext } from "../../../context/PowerContext";
import { UserContext } from "../../../context/UserContext";
import PowerOverlay from "./PowerOverlay";
import { useContext, useEffect, useState } from "react";

export function Overlay(): React.ReactElement {
    console.log("spiritism");
    return <PowerOverlay power={Power.SPIRITISM}></PowerOverlay>;
}

export function PlayerActions(props: { player: string }): React.ReactElement {
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);
    const powerContext = useContext(PowerContext);

    const onUse = (): void => {
        gameContext.sendJsonMessage("USE_POWER_CLAIRVOYANCE", {
            target: props.player
        });
    };

    if (!powerContext.active) return <></>;

    if (userContext.username === props.player) return <></>;

    return <Actionsheet.Item onPress={onUse}>[Voyance] Voir le rôle</Actionsheet.Item>;
}
