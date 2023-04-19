import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { useState } from "react";
import { Input, Pressable } from "native-base";

export default function InputDate(props: { value: Date, onChange: (value: Date) => void }): React.ReactElement {
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);

    const [date, setDate] = useState(new Date(props.value));
    const [hours, setHours] = useState(new Date(props.value).getHours());
    const [minutes, setMinutes] = useState(new Date(props.value).getMinutes());

    const onConfirmDate = (params: { date: any & { getDate: () => number} }): void => {
        if (!params.date) return;
        setDate(new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate()));
        setDateOpen(false);
        setTimeOpen(true);
    };
    const onConfirmTime = (hoursAndMinutes: { hours: number; minutes: number }): void => {
        setTimeOpen(false);
        setHours(hoursAndMinutes.hours);
        setMinutes(hoursAndMinutes.minutes);

        props.onChange(new Date(date.getTime() + 1000 * 60 * 60 * hoursAndMinutes.hours + 1000 * 60 * hoursAndMinutes.minutes));
    };
    const onDismiss = (): void => {
        setDateOpen(false);
        setTimeOpen(false);
    };

    return (
        <>
            <Pressable mt={2} onPress={(): void => setDateOpen(true)}>
                <Input value={props.value.toISOString()} />
            </Pressable>
            <DatePickerModal visible={dateOpen} date={date} mode="single" onConfirm={onConfirmDate} onDismiss={onDismiss} locale="en" />
            <TimePickerModal visible={timeOpen} hours={hours} minutes={minutes} onConfirm={onConfirmTime} onDismiss={onDismiss} />
        </>
    );
}
