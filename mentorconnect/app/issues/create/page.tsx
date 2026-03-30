import { IssueForm } from "../components/IssueForm";

export default function CreateIssuePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-mono text-2xl font-semibold tracking-tight">Create Issue</h1>
      <IssueForm />
    </div>
  );
}
