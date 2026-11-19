"use client";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  type FormikHelpers,
} from "formik";

import * as Yup from "yup";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createNote,
  type CreateNotePayload,
} from "@/lib/api/api";

import type { NoteTag } from "@/types/note";

import css from "./NoteForm.module.css";

const tags: NoteTag[] = [
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "At least 3 characters")
    .max(50, "Maximum 50 characters")
    .required("Title is required"),

  content: Yup.string()
    .max(500, "Maximum 500 characters"),

  tag: Yup.mixed<NoteTag>()
    .oneOf(tags, "Choose a valid tag")
    .required("Tag is required"),
});

const initialValues: CreateNotePayload = {
  title: "",
  content: "",
  tag: "Todo",
};

export default function NoteForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values: CreateNotePayload) =>
      createNote(values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      onCancel();
    },
  });

  const handleSubmit = async (
    values: CreateNotePayload,
    helpers: FormikHelpers<CreateNotePayload>
  ) => {
    try {
      await createMutation.mutateAsync(values);
      helpers.resetForm();
    } catch {
      // Помилка обробляється через createMutation.isError
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">
              Title
            </label>

            <Field
              id="title"
              type="text"
              name="title"
              className={css.input}
            />

            <ErrorMessage
              name="title"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">
              Content
            </label>

            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />

            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">
              Tag
            </label>

            <Field
              as="select"
              id="tag"
              name="tag"
              className={css.select}
            >
              {tags.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </Field>

            <ErrorMessage
              name="tag"
              component="span"
              className={css.error}
            />
          </div>

          {createMutation.isError && (
            <p className={css.error}>
              Could not create the note. Please try again.
            </p>
          )}

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={css.submitButton}
              disabled={
                isSubmitting || createMutation.isPending
              }
            >
              {isSubmitting || createMutation.isPending
                ? "Creating..."
                : "Create note"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}