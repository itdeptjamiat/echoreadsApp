import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';

interface TextFieldProps<T extends FieldValues> extends Omit<TextInputProps, 'onChange'> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  placeholder?: string;
}

export const TextField = <T extends FieldValues>({
  name,
  control,
  label,
  error,
  placeholder,
  ...props
}: TextFieldProps<T>) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  const hasError = !!fieldState.error || !!error;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        {...props}
      />
      {(fieldState.error || error) && (
        <Text style={styles.errorText}>
          {fieldState.error?.message || error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
}); 