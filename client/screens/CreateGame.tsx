import { API_BASE_URL } from "@env";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Button, View } from "react-native";
import Background from "../components/Background";
import InputDate from "../components/inputs/InputDate";
import InputNumber from "../components/inputs/InputNumber";
import InputText from "../components/inputs/InputText";
import NavigationUI from "../components/NavigationUI";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";

type FormFieldsValue = {
    nbPlayerMin: string;
    nbPlayerMax: string;
    dayLength: string;
    nightLength: string;
    startDate: string;
    percentageWerewolf: string;
    probaContamination: string;
    probaInsomnie: string;
    probaVoyance: string;
    probaSpiritisme: string;
}

export default function CreateGame(): React.ReactElement {
    const { token } = useContext(UserContext);

    const { control, handleSubmit, register } = useForm<FormFieldsValue>();

    const fields: {
        [key in keyof FormFieldsValue]: {
            type: "text" | "date" | "number";
            validation: { required?: boolean; min?: number; max?: number };
            defaultValue?: any;
        };
    } = {
        nbPlayerMin: { type: "number", validation: { required: true, min: 2, max: 100 }, defaultValue: 5 },
        nbPlayerMax: { type: "number", validation: { required: true, min: 2, max: 100 }, defaultValue: 20 },
        dayLength: { type: "number", validation: { required: true, min: 1, max: 24 * 60 }, defaultValue: 60 },
        nightLength: { type: "number", validation: { required: true, min: 1, max: 24 * 60 }, defaultValue: 60 },
        startDate: { type: "date", validation: { required: true, min: new Date().getTime() }, defaultValue: new Date().getTime() },
        percentageWerewolf: { type: "number", validation: { required: true, min: 0, max: 100 }, defaultValue: 50 },
        probaContamination: { type: "number", validation: { required: true, min: 0, max: 100 }, defaultValue: 20 },
        probaInsomnie: { type: "number", validation: { required: true, min: 0, max: 100 }, defaultValue: 20 },
        probaVoyance: { type: "number", validation: { required: true, min: 0, max: 100 }, defaultValue: 20 },
        probaSpiritisme: { type: "number", validation: { required: true, min: 0, max: 100 }, defaultValue: 20 }
    };

    const submitCreateGame = (fieldValues: FormFieldsValue): void => {
        request(`${API_BASE_URL}/game/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({
                nbPlayerMin: parseInt(fieldValues.nbPlayerMin),
                nbPlayerMax: parseInt(fieldValues.nbPlayerMax),
                dayLength: parseInt(fieldValues.dayLength),
                nightLength: parseInt(fieldValues.nightLength),
                startDate: new Date(fieldValues.startDate).getTime(),
                percentageWerewolf: parseInt(fieldValues.percentageWerewolf) / 100,
                probaContamination: parseInt(fieldValues.probaContamination) / 100,
                probaInsomnie: parseInt(fieldValues.probaInsomnie) / 100,
                probaVoyance: parseInt(fieldValues.probaVoyance) / 100,
                probaSpiritisme: parseInt(fieldValues.probaSpiritisme) / 100
            })
        });
    };

    return (
        <Background>
            <NavigationUI allowBack={false} />

            <View>
                {Object.keys(fields).map((n, i) => {
                    const name = n as keyof FormFieldsValue;
                    const field = fields[name];
                    switch (field.type) {
                    case "text":
                        return <InputText key={i} control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    case "number":
                        return <InputNumber key={i} control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    case "date":
                        return <InputDate key={i} control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    }
                })}
            </View>

            <Button onPress={handleSubmit(submitCreateGame)} title="Submit" />
        </Background>
    );
}
