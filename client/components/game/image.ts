import { ImageSourcePropType } from "react-native";

const images : {[key:string]: {uri:ImageSourcePropType}} = {
    Chaman: {
        uri: require("../../assets/images/roles/Chaman.png")
    },
    Contamination: {
        uri: require("../../assets/images/roles/Contamination.png")
    },
    Insomnie: {
        uri: require("../../assets/images/roles/Insomnie.png")
    },
    Loup: {
        uri: require("../../assets/images/roles/Loup.png")
    },
    Villageois: {
        uri: require("../../assets/images/roles/Villageois.png")
    },
    Voyante: {
        uri: require("../../assets/images/roles/Voyante.png")
    }
};

export { images };
