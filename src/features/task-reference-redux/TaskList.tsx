import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
} from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AssignmentTurnedIn, Delete, Edit } from '@mui/icons-material';

// local imports
import { getTasks, deleteTask, completeTask } from './taskAPI'
import { Task } from './controller/taskController'
import Date from '../../components/Date'
import ConfirmDialog from '../../components/ConfirmDialog'
import TaskForm from './TaskForm'

type UserApiResponse = {
  data: Array<Task>;
  metadata: {
    totalRowCount: number;
    pageNumber: number;
    pageSize: number;
  };
};

const emptyTask = {
  id: '',
  name: '',
  description: '',
  author: '',
  isComplete: false,
  createdAt: '',
};
const AppTable = () => {
  //data and fetching state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [taskData, setTaskData] = useState<Task>(emptyTask);
  const [data, setData] = useState<Task[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    taskId: null,
    name: null,
    action: null,
    onConfirm: null,
  });

  //table state
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const json = (await getTasks(pagination.pageIndex, pagination.pageSize, sorting)) as UserApiResponse;
      setData(json.data);
      setRowCount(json.metadata.totalRowCount);
    } catch (error) {
      setIsError(true);
      console.error(error);
      return;
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
    setIsError(false);
  };

  const handleCreateTask = useCallback(
    async () => {
      setTaskData(emptyTask);
      setCreateModalOpen(true)
    },
    []
  )

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId)
    } catch (error) {
      return;
    }
    fetchData()
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      return;
    }
    fetchData();
  }

  const openConfirmDialog = async (row: MRT_Row<Task>, action: string, onConfirm: any) => {
    setConfirmOpen(true);
    let data = {
      taskId: row.getValue('id'),
      name: row.getValue('name'),
      action: action,
      onConfirm: onConfirm,
    };
    setConfirmData(data);
  }

  const handleEditTask = useCallback(
    async (row: MRT_Row<Task>) => {
      setTaskData({
        id: row.getValue('id'),
        name: row.getValue('name'),
        description: row.getValue('description'),
        author: row.getValue('author'),
        isComplete: row.getValue('isComplete'),
        createdAt: row.getValue('createdAt'),
      });
      setCreateModalOpen(true);
    },
    [],
  );

  useEffect(() => {
    fetchData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
  ]);

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'isComplete',
        header: 'Is Complete?',
        enableEditing: false,
        Cell: ({ row }) => (
          <span>{row.original.isComplete ? 'True' : 'False'}</span>
        ),
      },
      {
        accessorKey: 'author',
        header: 'Author',
      },
      {
        accessorKey: 'createdAt',
        header: 'Creation date',
        enableEditing: false,
        Cell: ({ row }) => (
          <Date dateString={row.original.createdAt}></Date>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 120,
          },
        }}
        columns={columns}
        data={data}
        initialState={{ columnVisibility: { id: false } }}
        enableColumnOrdering
        enableRowActions
        positionActionsColumn='last'
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement='left' title='Edit'>
              <IconButton color='primary' onClick={() => handleEditTask(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='right' title='Delete'>
              <IconButton color='error' onClick={() => openConfirmDialog(row, 'delete', handleDeleteTask)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='right' title='Complete'>
              <span>
                <IconButton color='success' onClick={() => openConfirmDialog(row, 'complete', handleCompleteTask)} disabled={row.getValue('isComplete')}>
                  <AssignmentTurnedIn />
                </IconButton>

              </span>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Button
            color='primary'
            onClick={handleCreateTask}
            variant='contained'
          >
            Create New Task
          </Button>
        )}
        getRowId={(row) => row.id}
        manualPagination
        manualSorting
        enableColumnFilters={false}
        muiToolbarAlertBannerProps={
          isError
            ? {
              color: 'error',
              children: 'Error loading data',
            }
            : undefined
        }
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        rowCount={rowCount}
        state={{
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting,
        }}
      />
      <TaskForm
        key={taskData.id}
        formData={taskData}
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        submitCallback={fetchData}
      />
      <ConfirmDialog
        title='Are you sure?'
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onConfirm={confirmData.onConfirm}
        taskId={confirmData.taskId}
      >
        Are you sure you want to {confirmData.action} this task: {confirmData.name}?
      </ConfirmDialog>
    </>
  )
};

export default AppTable;