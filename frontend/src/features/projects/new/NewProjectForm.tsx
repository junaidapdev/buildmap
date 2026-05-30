import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  PROJECT_AGENT_VALUES,
  PROJECT_TYPE_VALUES,
  ProjectCreateSchema,
  type ProjectCreateInput,
} from '@shared/schemas/project';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { NEW_PROJECT_MESSAGES } from '@/features/projects/new/messages';
import { PROJECT_AGENT_LABELS, PROJECT_TYPE_LABELS } from '@/features/projects/new/select-options';
import { mapPreferredAgentForNewProject } from '@/features/settings/mapPreferredAgentForNewProject';
import { useUserProfile } from '@/features/settings/useUserProfile';
import { useCreateProject } from '@/features/projects/new/useCreateProject';

type ProjectFormValues = z.input<typeof ProjectCreateSchema>;

function RequiredIndicator() {
  return (
    <>
      <span aria-hidden="true"> *</span>
      <span className="sr-only"> {NEW_PROJECT_MESSAGES.REQUIRED_FIELD}</span>
    </>
  );
}

export function NewProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const profileQuery = useUserProfile();
  const appliedDefaultRef = useRef(false);
  const [showError, setShowError] = useState(false);
  const form = useForm<ProjectFormValues, unknown, ProjectCreateInput>({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      project_type: undefined,
      preferred_stack: '',
      preferred_agent: undefined,
    },
  });

  useEffect(() => {
    if (appliedDefaultRef.current || !profileQuery.data) {
      return;
    }
    const mapped = mapPreferredAgentForNewProject(profileQuery.data.default_preferred_agent);
    if (mapped) {
      form.setValue('preferred_agent', mapped);
    }
    appliedDefaultRef.current = true;
  }, [profileQuery.data, form]);

  function onSubmit(values: ProjectCreateInput): void {
    setShowError(false);
    createProject.mutate(values, {
      onSuccess: (project) => {
        navigate(ROUTES.PROJECT_CLARIFY(project.id));
      },
      onError: () => {
        setShowError(true);
      },
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {showError && createProject.isError && (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{NEW_PROJECT_MESSAGES.ERROR_GENERIC}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {NEW_PROJECT_MESSAGES.FIELD_NAME_LABEL}
                    <RequiredIndicator />
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_NAME_PLACEHOLDER}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_DESCRIPTION_LABEL}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-y"
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_DESCRIPTION_PLACEHOLDER}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_type"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PROJECT_TYPE_LABEL}</FormLabel>
                    {field.value && (
                      <Button
                        className="h-auto px-0 py-0 text-xs"
                        onClick={() => field.onChange(undefined)}
                        size="sm"
                        type="button"
                        variant="link"
                      >
                        {NEW_PROJECT_MESSAGES.CLEAR_SELECTION}
                      </Button>
                    )}
                  </div>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={NEW_PROJECT_MESSAGES.FIELD_PROJECT_TYPE_PLACEHOLDER}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_TYPE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PROJECT_TYPE_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_stack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PREFERRED_STACK_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_PREFERRED_STACK_PLACEHOLDER}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_agent"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PREFERRED_AGENT_LABEL}</FormLabel>
                    {field.value && (
                      <Button
                        className="h-auto px-0 py-0 text-xs"
                        onClick={() => field.onChange(undefined)}
                        size="sm"
                        type="button"
                        variant="link"
                      >
                        {NEW_PROJECT_MESSAGES.CLEAR_SELECTION}
                      </Button>
                    )}
                  </div>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={NEW_PROJECT_MESSAGES.FIELD_PREFERRED_AGENT_PLACEHOLDER}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_AGENT_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PROJECT_AGENT_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button asChild className="w-full sm:w-auto" type="button" variant="outline">
                <Link to={ROUTES.DASHBOARD}>{NEW_PROJECT_MESSAGES.CANCEL_BUTTON}</Link>
              </Button>
              <Button
                aria-busy={createProject.isPending}
                className="w-full sm:w-auto"
                disabled={createProject.isPending}
                type="submit"
              >
                {createProject.isPending
                  ? NEW_PROJECT_MESSAGES.SUBMIT_BUTTON_BUSY
                  : NEW_PROJECT_MESSAGES.SUBMIT_BUTTON}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
