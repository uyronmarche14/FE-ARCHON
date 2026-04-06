export type TaskAssignmentNotification = {
  id: string;
  type: "task_assigned";
  createdAt: string;
  actor: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
  };
};

export type TaskAssignmentNotificationsResponse = {
  items: TaskAssignmentNotification[];
};
