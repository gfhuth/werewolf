import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { Control, useController, UseFormRegisterReturn } from "react-hook-form";
import { TextInput, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

const styles = StyleSheet.create({
    textInput: {
        height: 30,
        marginTop: 10,
        backgroundColor: "#fff",
        paddingLeft: 10
    }
});

export default function InputDate(props: { control: Control<any, any>; defaultValue: number; name: string; options?: UseFormRegisterReturn<string> }): React.ReactElement {
    const { field } = useController({
        control: props.control,
        defaultValue: props.defaultValue,
        name: props.name
    });

    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);

    const [date, setDate] = useState(new Date(field.value));
    const [hours, setHours] = useState(new Date(field.value).getHours());
    const [minutes, setMinutes] = useState(new Date(field.value).getMinutes());

    const onConfirmDate = (params: { date: any & { getDate: () => number} }): void => {
        if (!params.date) return;
        setDate(new Date(params.date.getDate()));
        setDateOpen(false);
        setTimeOpen(true);
    };
    const onConfirmTime = (hoursAndMinutes: { hours: number; minutes: number }): void => {
        setTimeOpen(false);
        setHours(hoursAndMinutes.hours);
        setMinutes(hoursAndMinutes.minutes);

        field.onChange(date.getTime() + 1000 * 60 * 60 * hoursAndMinutes.hours + 1000 * 60 * hoursAndMinutes.minutes);
    };
    const onDismiss = (): void => {
        setDateOpen(false);
        setTimeOpen(false);
    };

    return (
        <>
            <Pressable onPress={(): void => setDateOpen(true)}>
                <TextInput style={styles.textInput} value={new Date(field.value).toISOString()} {...props.options} />
            </Pressable>
            <DatePickerModal visible={dateOpen} date={date} mode="single" onConfirm={onConfirmDate} onDismiss={onDismiss} locale="fr" />
            <TimePickerModal visible={timeOpen} hours={hours} minutes={minutes} onConfirm={onConfirmTime} onDismiss={onDismiss} locale="fr" />
        </>
    );
}
