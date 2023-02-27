import { useState } from 'react';

import { createTask, updateTask } from '../taskAPI'

export interface Task {
  id: string;
  name: string;
  description: string;
  author: string;
  isComplete: boolean;
  createdAt: string;
};

export const taskController = (formValues) => {
  // We'll update 'values' as the form updates
  const [values, setValues] = useState(formValues);
  // 'errors' is used to check the form for errors
  const [errors, setErrors] = useState({} as any);
  const validate: any = (fieldValues = values) => {
    let temp: any = { ...errors }

    if ('name' in fieldValues)
      temp.name = fieldValues.name ? '' : 'This field is required.'

    if ('description' in fieldValues)
      temp.description = fieldValues.description ? '' : 'This field is required.'

    if ('author' in fieldValues)
      temp.author = fieldValues.author ? '' : 'This field is required.'

    setErrors({
      ...temp
    });
  }
  const handleInputValue: any = (fieldValues: any) => {
    const { name, value } = fieldValues.target;
    setValues({
      ...values,
      [name]: value
    });
    validate({ [name]: value });
  }

  const formIsValid: any = (fieldValues = values) => {
    const isValid =
      fieldValues.name &&
      fieldValues.description &&
      fieldValues.author &&
      Object.values(errors).every((x) => x === '');

    return isValid;
  }

  const handleFormSubmit = async () => {
    const isValid =
      Object.values(errors).every((x) => x === '') && formIsValid();
    if (isValid) {
      let isUpdate = values.id != undefined && values.id != '' && values.id != null
      isUpdate ? await updateTask(values) : await createTask(values);
    }
  };

  return {
    handleInputValue,
    handleFormSubmit,
    formIsValid,
    errors,
  };
}