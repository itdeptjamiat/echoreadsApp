import React, { ReactNode } from 'react';
import { FormProvider as HookFormProvider, UseFormReturn } from 'react-hook-form';

interface FormProviderProps {
  children: ReactNode;
  methods: UseFormReturn<any>;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, methods }) => {
  return (
    <HookFormProvider {...methods}>
      {children}
    </HookFormProvider>
  );
}; 