/* eslint-disable max-len */
import { Container, Image } from "native-base";
import { GameContext } from "../context/GameContext";
import React, { useEffect, useContext, useState } from "react";

export default function Background(props: { children: React.ReactNode }): React.ReactElement {
    const gameContext = useContext(GameContext);

    const tempsNuit = gameContext.NightDuration * 60;
    const tempsJour = gameContext.DayDuration * 60;

    const [distanceTop, setDistanceTop] = useState(0);

    useEffect(() => {
        setInterval(() => {
            setDistanceTop((top) => top + 10);
        }, 1000);
    }, []);

    return (
        <>
            <Container minHeight={"100%"} minWidth={"100%"} position={"relative"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} overflow={"hidden"}>
                <Image source={require("../assets/background2.png")} alt="Background image" position={"absolute"} width={"100%"} height={"300%"} top={distanceTop} resizeMode="cover" />
                <Container pt={50} />
                {props.children}
            </Container>
        </>
    );
}
