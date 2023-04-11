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
    nbPlayerMin: number;
    nbPlayerMax: number;
    dayLength: number;
    nightLength: number;
    startDate: number;
    percentageWerewolf: number;
    probaContamination: number;
    probaInsomnie: number;
    probaVoyance: number;
    probaSpiritisme: number;
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
        request(`${API_BASE_URL}/game/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({
                nbPlayerMin: fieldValues.nbPlayerMin,
                nbPlayerMax: fieldValues.nbPlayerMax,
                dayLength: fieldValues.dayLength,
                nightLength: fieldValues.nightLength,
                startDate: fieldValues.startDate,
                percentageWerewolf: fieldValues.percentageWerewolf,
                probaContamination: fieldValues.probaContamination / 100,
                probaInsomnie: fieldValues.probaInsomnie / 100,
                probaVoyance: fieldValues.probaVoyance / 100,
                probaSpiritisme: fieldValues.probaSpiritisme / 100
            })
        });
    };

    return (
        <Background>
            <NavigationUI allowBack={false} />

            <View>
                {Object.keys(fields).map((n) => {
                    const name = n as keyof FormFieldsValue;
                    const field = fields[name];
                    switch (field.type) {
                    case "text":
                        return <InputText control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    case "number":
                        return <InputNumber control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    case "date":
                        return <InputDate control={control} name={name} defaultValue={field.defaultValue} options={register(name, { ...field.validation })} />;
                    }
                })}
            </View>

            <Button onPress={handleSubmit(submitCreateGame)} title="Submit" />
        </Background>
    );
}
