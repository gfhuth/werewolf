import { Control, useController, UseFormRegisterReturn } from "react-hook-form";
import { TextInput, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    textInput: {
        height: 30,
        marginTop: 10,
        backgroundColor: "#fff",
        paddingLeft: 10
    }
});

export default function InputText(props: { control: Control<any, any>; defaultValue: string; name: string; options?: UseFormRegisterReturn<string> }): React.ReactElement {
    const { field } = useController({
        control: props.control,
        defaultValue: props.defaultValue,
        name: props.name
    });

    return <TextInput style={styles.textInput} onChangeText={field.onChange} value={field.value} {...props.options} />;
}
