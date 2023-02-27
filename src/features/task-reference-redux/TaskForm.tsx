import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';

// local imports
import { taskController, Task } from './controller/taskController'

interface CreateModalProps {
  formData: Task,
  columns: MRT_ColumnDef<Task>[];
  onClose: () => void;
  submitCallback: () => void;
  open: boolean;
}

const TaskForm = ({
  open,
  formData,
  columns,
  onClose,
  submitCallback,
}: CreateModalProps) => {
  let isUpdate = formData.id != undefined && formData.id != '' && formData.id != null
  columns = columns.filter((column) =>
    column.enableEditing ?? true
  );

  const {
    handleInputValue,
    handleFormSubmit,
    formIsValid,
    errors,
  } = taskController(formData);

  const handleCreateNewTask = async () => {
    try {
      await handleFormSubmit()
    } catch (error) {
      return;
    }
    onClose();
    submitCallback();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{isUpdate ? 'Update' : 'Create New'} Task</DialogTitle>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogContent>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
            }}
          >
            {columns.map((column) => (
              <TextField
                {...(errors[`${column.accessorKey}`] && { error: true, helperText: errors[`${column.accessorKey}`] })}
                key={column.accessorKey}
                label={column.header}
                name={column.accessorKey}
                onBlur={handleInputValue}
                onChange={handleInputValue}
                defaultValue={formData[`${column.accessorKey}`]}
              />
            ))}
          </Stack>

        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleCreateNewTask} variant="contained" disabled={!formIsValid()}>
            {isUpdate ? 'Update' : 'Create New'} Task
          </Button>
        </DialogActions>
      </form>
    </Dialog >
  );
};

export default TaskForm;