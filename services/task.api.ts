import http from "./http";

export interface Task {
	_id?: string;
	title: string;
	description: string;
	dueDate: string;
	status: "pending" | "in progress" | "completed";
	priority?: "low" | "medium" | "high" | "urgent";
	assigneeName?: string;
	assigneeEmail: string;
	createdAt?: string;
	updatedAt?: string;
}

export async function getTasks(): Promise<Task[]> {
	const res = await http.get("/task/get-tasks");
	return res.data.tasks;
}

export async function createTask(
	task: Omit<Task, "_id" | "createdAt" | "updatedAt">
): Promise<Task> {
	const res = await http.post("/task/create-task", task);
	return res.data.task;
}

export async function updateTask(
	id: string,
	task: Partial<Omit<Task, "_id" | "createdAt" | "updatedAt">>
): Promise<Task> {
	const res = await http.put(`/task/update-task/${id}`, task);
	return res.data.task;
}

export async function deleteTask(id: string): Promise<void> {
	await http.delete(`/task/delete-task/${id}`);
}