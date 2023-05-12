/* eslint-disable max-len */
import { Container, Image } from "native-base";
import { GameContext } from "../context/GameContext";
import React, { useEffect, useContext, useState } from "react";

export default function Background(props: { children: React.ReactNode }): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [tempsSeconde, settempsSeconde] = useState<number>(0);
    const tempsNuit = (gameContext.NightDuration) * 60;
    const tempsJour = (gameContext.DayDuration) * 60;

    setInterval(() => {
        settempsSeconde(tempsSeconde + 1);
    }, 1000);


    const divStyle = {
        translateX: tempsSeconde
    };


    return (
        <>
            <Container minHeight={"100%"} minWidth={"100%"} position={"relative"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Image source={require("../assets/background2.png")} alt="Background image" position={"absolute"} width={"100%"} height={"100%"} style={divStyle} resizeMode="cover" />
                <Container pt={50} />
                {props.children}
            </Container>
        </>
    );
}
