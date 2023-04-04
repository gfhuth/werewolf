import DatePicker from "react-native-date-picker";
import { Control, useController, UseFormRegisterReturn } from "react-hook-form";
import { TextInput, StyleSheet } from "react-native";
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

    const [open, setOpen] = useState(false);

    return (
        <>
            <TextInput style={styles.textInput} onPressIn={(): void => setOpen(true)} value={field.value} {...props.options} />;
            <DatePicker
                modal
                open={open}
                date={field.value}
                onConfirm={(newDate): void => {
                    setOpen(false);
                    field.onChange(newDate.getTime());
                }}
                onCancel={(): void => {
                    setOpen(false);
                }}
            />
        </>
    );
}
