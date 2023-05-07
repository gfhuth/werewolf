import { ImageSourcePropType } from "react-native";

const images : {[key:string]: {uri:ImageSourcePropType}} = {
    SPIRITISM: {
        uri: require("../../assets/images/powers/SPIRITISM.png")
    },
    CONTAMINATION: {
        uri: require("../../assets/images/powers/CONTAMINATION.png")
    },
    INSOMNIA: {
        uri: require("../../assets/images/powers/INSOMNIA.png")
    },
    WEREWOLF: {
        uri: require("../../assets/images/roles/WEREWOLF.png")
    },
    HUMAN: {
        uri: require("../../assets/images/roles/HUMAN.png")
    },
    CLAIRVOYANCE: {
        uri: require("../../assets/images/powers/CLAIRVOYANCE.png")
    }
};

export { images };
