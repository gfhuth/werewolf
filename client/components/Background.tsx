import React from "react";
import { View, ImageBackground } from "react-native";

export default function Background(props: { children: React.ReactNode }): React.ReactElement {
    return (
        <View
            style={{
                minHeight: "100%",
                minWidth: "100%"
            }}
        >
            <ImageBackground
                source={require("../assets/pxArt_6.png")}
                resizeMode="cover"
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                {props.children}
            </ImageBackground>
        </View>
    );
}
