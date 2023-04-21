import { Container, Image } from "native-base";
import React from "react";

export default function Background(props: { children: React.ReactNode }): React.ReactElement {
    return (
        <>
            <Container minHeight={"100%"} minWidth={"100%"} position={"relative"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Image source={require("../assets/background.png")} alt="Background image" position={"absolute"} width={"100%"} height={"100%"} resizeMode="cover" />
                <Container pt={50} />
                {props.children}
            </Container>
        </>
    );
}
