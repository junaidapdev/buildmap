import { NEW_PROJECT_MESSAGES } from '@/features/projects/new/messages';
import { NewProjectForm } from '@/features/projects/new/NewProjectForm';

export function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{NEW_PROJECT_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{NEW_PROJECT_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      <NewProjectForm />
    </div>
  );
}
