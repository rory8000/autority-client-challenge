import { toast, TypeOptions } from "react-toastify";

const API_HOST = 'http://localhost:4000'

export async function getTasks(pageNumber, pageSize, sorting): Promise<any> {
  const url = new URL('/tasks', API_HOST);
  url.searchParams.set('page', `${pageNumber}`);
  url.searchParams.set('size', `${pageSize}`);
  url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

  const response = await fetch(url.href);

  return await response.json()
}

export async function createTask(task): Promise<any> {
  const response = await fetch(`${API_HOST}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
  const result = await handleResponse(response, 'created', 'create');
  return result
}

export async function updateTask(task): Promise<any> {
  const response = await fetch(`${API_HOST}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
  const result = await handleResponse(response, 'updated', 'update');
  return result
}

export async function completeTask(taskId): Promise<any> {
  const response = await fetch(`${API_HOST}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  })
  const result = await handleResponse(response, 'completed', 'complete');
  return result
}

export async function deleteTask(taskId): Promise<Response> {
  const response = await fetch(`${API_HOST}/tasks/${taskId}`, {
    method: 'DELETE',
  })
  const result = await handleResponse(response, 'deleted', 'delete');
  return result
}

const handleResponse = async (response: Response, successMessage: string, errorMessage: string) => {
  const data = await getData(response);

  if (response.status >= 400) {
    const msg = `Fail to ${errorMessage} task`
    toast(msg, { hideProgressBar: true, type: 'error' });
    console.error(msg, data);
    throw new Error(msg);
  }

  let msg = `Task ${successMessage} successfully`
  let type: TypeOptions = 'success'
  if (response.status < 200 && response.status >= 300) {
    msg = 'Unexpected response';
    type = 'warning'
  }

  toast(msg, { hideProgressBar: false, type: type, autoClose: 2000 });

  return data

}

async function getData(response: Response) {
  const contentType = response.headers.get("content-type");
  let result: any;
  if (
    // response.status != 204 &&
    contentType &&
    contentType.indexOf("application/json") !== -1
  ) {
    result = await response.json();
  }
  return result;
}
