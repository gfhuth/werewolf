import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Image, Pressable } from "react-native";
import { StackNavigation } from "../App";
import ImageButton from "./ImageButton";

const backImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAAAlklEQVR4Ae3a1REDMRDG4A3VmHbcUFLigf0exn/mkxuQjmELAAAAAD5Eq5atP6+rZeuPhGz9kZCtPxKy9fs6Zuuf60CfPn369OnTp0+fPn369OnTfx36X1vh+nO6/pytL+D1BCexy+iNhFPt6/dIOEiQIEGCBAkSJEiQ8B0k+PwoQYKhP2OXAYOvRo+vD38bvwcAAACABXF8ILs1PQqpAAAAAElFTkSuQmCC";

const iconPadding = 30;

export default function NavigationUI(props: { allowBack?: boolean }) {
    const navigation = useNavigation<StackNavigation>();

    return (
        <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            {props.allowBack && <ImageButton tintColor={"white"} onPress={navigation.goBack} source={{ uri: backImage }} style={{ position: "absolute", top: iconPadding, left: iconPadding, width: 30, height: 30 }} />}
            <ImageButton tintColor={"white"} onPress={() => navigation.navigate("Settings")} source={require("../assets/gear.png")} style={{ position: "absolute", top: iconPadding, right: iconPadding, width: 30, height: 30 }} />
        </View>
    );
}
