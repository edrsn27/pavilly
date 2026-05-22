"use client";

import { useParams } from "next/navigation";
import { PosTerminal } from "@/features/pos";

export default function PosPage() {
  const params = useParams<{ id: string }>();
  return <PosTerminal storeId={params.id} />;
}
