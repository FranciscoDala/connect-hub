// components/post/PostSidebar.tsx
"use client";

type Props = {
  postId: string;
  categoryId?: string;
};

export default function PostSidebar({ postId, categoryId }: Props) {
  // por enquanto vazia, vamos adicionar os novos blocos aqui
  // ideias que discutimos: índice, mais lidas, newsletter, etc
  return (
    <aside className="col-span-12 space-y-4 lg:col-span-4">
      {/* Sidebar limpa - pronta para receber novos blocos */}
    </aside>
  );
}
