import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskLogsTimeline } from "@/features/tasks/components/task-logs-timeline";

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    AlertTriangle: Icon,
    ArrowRight: Icon,
    CalendarClock: Icon,
    Clock3: Icon,
    FileText: Icon,
    Layers3: Icon,
    PencilLine: Icon,
    RefreshCw: Icon,
    Sparkles: Icon,
    UserRound: Icon,
  };
});

describe("TaskLogsTimeline", () => {
  it("renders loading, empty, and retryable error states", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <TaskLogsTimeline entries={[]} isLoading />,
    );

    expect(screen.getByLabelText("Loading task activity log")).toBeInTheDocument();

    rerender(<TaskLogsTimeline entries={[]} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();

    rerender(
      <TaskLogsTimeline
        entries={[]}
        errorMessage="Try the request again."
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /retry loading logs/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders readable values for status, assignee, due date, and empty description", () => {
    render(
      <TaskLogsTimeline
        entries={[
          {
            id: "log-status",
            eventType: "STATUS_CHANGED",
            fieldName: "status",
            oldValue: "TODO",
            newValue: "IN_PROGRESS",
            summary: "Member User moved the task from Todo to In Progress",
            actor: {
              id: "member-1",
              name: "Member User",
            },
            createdAt: "2026-04-06T09:00:00.000Z",
          },
          {
            id: "log-assignee",
            eventType: "TASK_UPDATED",
            fieldName: "assigneeId",
            oldValue: null,
            newValue: {
              id: "member-2",
              name: "Jordan Lane",
            },
            summary: "Member User updated the assignee",
            actor: {
              id: "member-1",
              name: "Member User",
            },
            createdAt: "2026-04-05T09:00:00.000Z",
          },
          {
            id: "log-due-date",
            eventType: "TASK_UPDATED",
            fieldName: "dueDate",
            oldValue: null,
            newValue: "2026-04-20",
            summary: "Member User updated the due date",
            actor: {
              id: "member-1",
              name: "Member User",
            },
            createdAt: "2026-04-04T09:00:00.000Z",
          },
          {
            id: "log-description",
            eventType: "TASK_UPDATED",
            fieldName: "description",
            oldValue: null,
            newValue: null,
            summary: "Member User updated the description",
            actor: {
              id: "member-1",
              name: "Member User",
            },
            createdAt: "2026-04-03T09:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lane")).toBeInTheDocument();
    expect(screen.getByText("Apr 20, 2026")).toBeInTheDocument();
    expect(screen.getAllByText("No description")).toHaveLength(2);
  });
});
