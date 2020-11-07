import React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { Form, FormFieldProps, Label } from 'semantic-ui-react';
import { DateTimePicker } from 'react-widgets';

interface IProps extends FieldRenderProps<Date, HTMLElement>, FormFieldProps { }

const DateInput: React.FC<IProps> = ({
    input,
    width,
    time = false,
    date = false,
    type,
    placeholder,
    meta: { touched, error },
    ...rest
}) => {
    return (
        <Form.Field error={touched && !!error} type={type} width={width}>
            <DateTimePicker
                placeholder={placeholder}
                value={input.value || null}
                onChange={input.onChange}
                onBlur={input.onBlur}
                onKeyDown={(e) => e.preventDefault()}
                date={date}
                time={time}
                {...rest}
                id={undefined}
            />
            {touched && error && (
                <Label basic color='red'>
                    {error}
                </Label>
            )}
        </Form.Field>
    )
}

export default DateInput;
