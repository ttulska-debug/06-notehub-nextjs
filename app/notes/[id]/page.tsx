import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/api/queryClient";
import { fetchNoteById } from "@/lib/api/api";

import NoteDetailsClient from "@/components/NoteDetails/NoteDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoteDetailsPage({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient
    .query({
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}